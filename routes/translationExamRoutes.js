const express = require("express");
const router = express.Router();
const generateTranslationExam = require("../config/ai");
const { cleanJsonResponse } = require("../helpers/examHelpers");
const ExamDataHandler = require("../models/ExamDataHandler");
const Exam = require("../models/Exam");

// Generate new exam
router.post("/generate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { initial_language, target_language } = req.body;

    if (!initial_language || !target_language) {
      return res.status(400).json({
        success: false,
        message: "Both initial_language and target_language are required",
      });
    }

    const exam = await generateTranslationExam({
      initial_language,
      target_language,
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

    // Create new exam in database
    const newExam = new Exam({
      email,
      examData: examHandler.exportExamData(),
      isCompleted: false,
    });

    await newExam.save();

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
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching exam",
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

module.exports = router;
