const express = require("express");
const router = express.Router();
const generateTranslationExam = require("../config/ai");
const { cleanJsonResponse } = require("../helpers/examHelpers");
const ExamDataHandler = require("../models/ExamDataHandler");
const Exam = require("../models/Exam");
const { sendExamNotification } = require("../helpers/sendEmail");
const axios = require("axios");
const https = require("https");

// Generate new exam
router.post("/generate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { initial_language, target_language, examDate, token, freelancerId } =
      req.body;

    if (!initial_language || !target_language) {
      return res.status(400).json({
        success: false,
        message: "Both initial_language and target_language are required",
      });
    }

    if (!examDate) {
      return res.status(400).json({
        success: false,
        message: "Exam date is required",
      });
    }

    if (!token || !freelancerId) {
      return res.status(400).json({
        success: false,
        message: "Authentication token and freelancerId are required",
      });
    }

    const languagePairData = {
      initial_language: {
        value: initial_language.id,
        label: `${initial_language.languageName}(${initial_language.countryName}) / ${initial_language.languageCode}(${initial_language.countryCode})`,
      },
      target_language: {
        value: target_language.id,
        label: `${target_language.languageName}(${target_language.countryName}) / ${target_language.languageCode}(${target_language.countryCode})`,
      },
    };

    const exam = await generateTranslationExam({
      initial_language: languagePairData.initial_language.label,
      target_language: languagePairData.target_language.label,
    });

    if (!exam) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate translation exam",
      });
    }

    // Initialize ExamDataHandler
    const examHandler = new ExamDataHandler();

    // Load and process exam data
    const loadSuccess = examHandler.loadExamData(exam);
    if (!loadSuccess) {
      return res.status(500).json({
        success: false,
        message: "Failed to process exam data",
      });
    }

    // Calculate validity period (24 hours from exam date)
    const examDateTime = new Date(examDate);
    const validUntil = new Date(examDateTime);
    validUntil.setHours(validUntil.getHours() + 24);

    // Create new exam in database
    const newExam = new Exam({
      email,
      examData: examHandler.exportExamData(),
      isCompleted: false,
      examDate: examDateTime,
      validUntil: validUntil,
      isExpired: false,
      initial_language: languagePairData.initial_language,
      target_language: languagePairData.target_language,
    });

    // Add language pair for freelancer
    try {
      const data = [
        {
          languageFromId: initial_language.id,
          languageToId: target_language.id,
        },
      ];
      const response = await axios.post(
        `https://tradof.runasp.net/api/freelancers/${freelancerId}/language-pairs`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        }
      );

      await newExam.save();
      console.log("Language pair added successfully:", response.data);
    } catch (apiError) {
      console.error("Error adding language pair:", apiError);
      return res.status(500).json({
        success: false,
        message: "Failed to process add language pair",
        error: apiError,
      });
      // Don't fail the request if API call fails
    }

    // Send email notification
    try {
      await sendExamNotification({
        to: email,
        examId: newExam._id,
        initial_language: languagePairData.initial_language.label,
        target_language: languagePairData.target_language.label,
      });
    } catch (emailError) {
      console.error("Error sending exam notification email:", emailError);
      // Don't fail the request if email sending fails
    }

    return res.status(200).json({
      success: true,
      message: "Exam created successfully",
    });
  } catch (error) {
    console.error("Error generating translation exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while generating translation exam",
    });
  }
});

// Get exam by ID
router.get("/:examId", async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    if (exam.isCompleted) {
      return res.status(403).json({
        success: false,
        message: "This exam has expired",
        status: 403,
      });
    }

    // Check if exam is expired
    const now = new Date();
    if (now > exam.validUntil && !exam.isCompleted) {
      exam.isExpired = true;
      await exam.save();
      return res.status(403).json({
        success: false,
        message: "This exam has expired",
        status: 403,
      });
    }

    // Remove answerKey from examData
    const examData = exam.examData;
    const { answerKey, ...examDataWithoutAnswers } = examData;

    const examWithoutAnswers = {
      ...exam.toObject(),
      examData: examDataWithoutAnswers,
    };

    return res.status(200).json({
      success: true,
      data: examWithoutAnswers,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching exam",
      status: 500,
    });
  }
});

// Get all exams for a user
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const exams = await Exam.find({ email }).sort({ createdAt: -1 });

    // Remove answerKey from each exam's examData
    const examsWithoutAnswers = exams.map((exam) => {
      const examObj = exam.toObject();
      const { answerKey, ...examDataWithoutAnswers } = examObj.examData;
      return {
        ...examObj,
        examData: examDataWithoutAnswers,
      };
    });

    return res.status(200).json({
      success: true,
      data: examsWithoutAnswers,
    });
  } catch (error) {
    console.error("Error fetching user exams:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user exams",
    });
  }
});

// Correct and grade exam
router.post("/correct/:examId", async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, freelancerId, token } = req.body;

    if (!token || !freelancerId) {
      return res.status(400).json({
        success: false,
        message: "Not authentication",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Answers object is required",
      });
    }

    console.log(answers);
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Get correct answers from exam data
    const correctAnswers = exam.examData?.answerKey;

    if (!correctAnswers || typeof correctAnswers !== "object") {
      console.log("Exam data structure:", {
        hasAnswerKey: !!exam.examData?.answerKey,
        answerKeyType: typeof exam.examData?.answerKey,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid exam data: missing or invalid answer key",
        debug: {
          hasAnswerKey: !!exam.examData?.answerKey,
          answerKeyType: typeof exam.examData?.answerKey,
        },
      });
    }

    // Compare answers and calculate score
    let score = 0;
    const results = [];
    const userAnswers = {};

    // Convert answers object to array and compare
    for (let i = 1; i <= 50; i++) {
      const questionNumber = i;
      const userAnswer = answers[questionNumber] || "";
      const correctAnswerData = correctAnswers[questionNumber];
      if (!correctAnswerData) {
        console.log(`Missing correct answer for question ${questionNumber}`);
        continue;
      }

      // Extract just the letter from the answer (A, B, C, or D)
      const cleanUserAnswer =
        userAnswer.split(":")[0].toLowerCase().trim() || ""; // Extract just the letter
      const cleanCorrectAnswer = correctAnswerData.correct_answer
        .toLowerCase()
        .trim();

      const isCorrect = cleanUserAnswer === cleanCorrectAnswer;

      if (isCorrect) {
        console.log(cleanUserAnswer, cleanCorrectAnswer, isCorrect);
        score++;
      }

      // Store user answer with metadata
      userAnswers[questionNumber] = {
        answer: userAnswer,
        cleanAnswer: cleanUserAnswer,
        isCorrect,
        answeredAt: new Date(),
        section: correctAnswerData.section,
      };

      results.push({
        questionNumber,
        userAnswer: cleanUserAnswer,
        correctAnswer: cleanCorrectAnswer,
        isCorrect,
        explanation: correctAnswerData.explanation,
        section: correctAnswerData.section,
      });
    }

    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const roundedPercentage = Math.round(percentage);

    // Update exam completion status and save user answers
    exam.isCompleted = true;
    exam.score = roundedPercentage;
    exam.completedAt = new Date();
    exam.userAnswers = userAnswers;
    await exam.save();

    console.log(exam.initial_language);
    console.log(exam.target_language);

    // Make API call to set freelancer score
    try {
      const response = await axios.post(
        "https://tradof.runasp.net/api/freelancers/set-score",
        {
          freelancerId,
          languageFromId: exam.initial_language.value,
          languageToId: exam.target_language.value,
          examType: 0, // Translation exam type
          mark: roundedPercentage,
        },
        {
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Score set successfully:", response.data);
    } catch (apiError) {
      console.error("Error setting freelancer score:", apiError);
      // Don't fail the request if API call fails
    }

    return res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions,
        percentage: roundedPercentage,
        results,
      },
    });
  } catch (error) {
    console.error("Error correcting exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while correcting exam",
      error: error.message,
    });
  }
});

// Generate multiple exams for a user
router.post("/generate-multiple/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { exams } = req.body;

    if (!Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exams array is required and must not be empty",
      });
    }

    const results = [];
    const errors = [];

    for (const examData of exams) {
      const { initial_language, target_language, examDate } = examData;

      if (!initial_language || !target_language || !examDate) {
        errors.push({
          exam: examData,
          error:
            "Missing required fields (initial_language, target_language, or examDate)",
        });
        continue;
      }

      try {
        const exam = await generateTranslationExam({
          initial_language: initial_language.label,
          target_language: target_language.label,
        });

        if (!exam) {
          errors.push({
            exam: examData,
            error: "Failed to generate translation exam",
          });
          continue;
        }

        // Initialize ExamDataHandler
        const examHandler = new ExamDataHandler();

        // Load and process exam data
        const loadSuccess = examHandler.loadExamData(exam);
        if (!loadSuccess) {
          errors.push({
            exam: examData,
            error: "Failed to process exam data",
          });
          continue;
        }

        // Calculate validity period (24 hours from exam date)
        const examDateTime = new Date(examDate);
        const validUntil = new Date(examDateTime);
        validUntil.setHours(validUntil.getHours() + 24);

        // Create new exam in database
        const newExam = new Exam({
          email,
          examData: examHandler.exportExamData(),
          isCompleted: false,
          examDate: examDateTime,
          validUntil: validUntil,
          isExpired: false,
          initial_language,
          target_language,
        });

        await newExam.save();

        // Send email notification
        try {
          await sendExamNotification({
            to: email,
            examId: newExam._id,
            initial_language: initial_language.label,
            target_language: target_language.label,
          });
        } catch (emailError) {
          console.error("Error sending exam notification email:", emailError);
          // Don't fail the request if email sending fails
        }

        results.push({
          exam: examData,
          success: true,
          examId: newExam._id,
        });
      } catch (error) {
        errors.push({
          exam: examData,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Multiple exams generation completed",
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error) {
    console.error("Error generating multiple translation exams:", error);
    return res.status(500).json({
      success: false,
      message:
        "Internal server error while generating multiple translation exams",
      error: error.message,
    });
  }
});

// Delete exam by ID
router.delete("/:examId", async (req, res) => {
  try {
    const { examId } = req.params;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Delete the exam
    await Exam.findByIdAndDelete(examId);

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting exam",
      error: error.message,
    });
  }
});

// Delete exams by language pair and email
router.delete("/language-pair/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { initial_language, target_language, token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    if (!initial_language || !target_language) {
      return res.status(400).json({
        success: false,
        message: "Both initial_language and target_language are required",
      });
    }

    // Find and delete all exams matching the criteria
    const result = await Exam.deleteMany({
      email,
      "initial_language.value": initial_language,
      "target_language.value": target_language,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No exams found for the specified language pair and email",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} exams`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting exams by language pair:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting exams",
      error: error.message,
    });
  }
});

module.exports = router;
