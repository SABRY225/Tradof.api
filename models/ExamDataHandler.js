class ExamDataHandler {
  constructor() {
    this.examData = null;
    this.answerKey = {};
    this.userAnswers = {};
    this.sessionData = {};
  }

  /**
   * Load and process exam data from JSON
   * @param {Object} examJson - The exam data in JSON format
   */
  loadExamData(examJson) {
    try {
      this.examData = examJson;
      this.processExamData();
      console.log("Exam data loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading exam data:", error);
      return false;
    }
  }

  /**
   * Process the exam data and create answer key
   */
  processExamData() {
    if (!this.examData || !this.examData.sections) {
      throw new Error("Invalid exam data structure");
    }

    this.answerKey = {};

    // Process listening comprehension
    if (this.examData.sections.listening_comprehension) {
      this.examData.sections.listening_comprehension.forEach((audio, index) => {
        audio.questions.forEach((question) => {
          this.answerKey[question.question_number] = {
            correct_answer: question.correct_answer,
            explanation: question.explanation,
            section: "listening_comprehension",
            subsection: audio.audio_title,
            transcript: audio.transcript,
          };
        });
      });
    }

    // Process reading translation
    if (this.examData.sections.reading_translation) {
      this.examData.sections.reading_translation.forEach((passage, index) => {
        passage.questions.forEach((question) => {
          this.answerKey[question.question_number] = {
            correct_answer: question.correct_answer,
            explanation: question.explanation,
            section: "reading_translation",
            subsection: `Passage ${index + 1}`,
            source_text: passage.source_text,
          };
        });
      });
    }

    // Process vocabulary
    if (this.examData.sections.vocabulary) {
      this.examData.sections.vocabulary.forEach((item) => {
        this.answerKey[item.question_number] = {
          correct_answer: item.correct_answer,
          explanation: item.explanation,
          section: "vocabulary",
          subsection: "Vocabulary Assessment",
          context: item.context,
          term: item.term,
        };
      });
    }

    // Process grammar and syntax
    if (this.examData.sections.grammar_syntax) {
      this.examData.sections.grammar_syntax.forEach((item) => {
        this.answerKey[item.question_number] = {
          correct_answer: item.correct_answer,
          explanation: item.explanation,
          section: "grammar_syntax",
          subsection: "Grammar and Syntax",
          sentence: item.sentence,
        };
      });
    }
  }

  /**
   * Create exam data for frontend (without answers)
   */
  getExamForFrontend() {
    if (!this.examData) {
      throw new Error("No exam data loaded");
    }

    const frontendExam = {
      language_pair: this.examData.language_pair,
      difficulty: this.examData.difficulty,
      fields: this.examData.fields,
      sections: {},
    };

    // Process listening comprehension for frontend
    if (this.examData.sections.listening_comprehension) {
      frontendExam.sections.listening_comprehension =
        this.examData.sections.listening_comprehension.map((audio) => ({
          audio_title: audio.audio_title,
          transcript: audio.transcript,
          questions: audio.questions.map((q) => ({
            question_number: q.question_number,
            question: q.question,
            options: q.options,
          })),
        }));
    }

    // Process reading translation for frontend
    if (this.examData.sections.reading_translation) {
      frontendExam.sections.reading_translation =
        this.examData.sections.reading_translation.map((passage) => ({
          source_text: passage.source_text,
          questions: passage.questions.map((q) => ({
            question_number: q.question_number,
            question: q.question,
            options: q.options,
          })),
        }));
    }

    // Process vocabulary for frontend
    if (this.examData.sections.vocabulary) {
      frontendExam.sections.vocabulary = this.examData.sections.vocabulary.map(
        (item) => ({
          question_number: item.question_number,
          context: item.context,
          term: item.term,
          question: item.question,
          options: item.options,
        })
      );
    }

    // Process grammar and syntax for frontend
    if (this.examData.sections.grammar_syntax) {
      frontendExam.sections.grammar_syntax =
        this.examData.sections.grammar_syntax.map((item) => ({
          question_number: item.question_number,
          sentence: item.sentence,
          question: item.question,
          options: item.options,
        }));
    }

    return frontendExam;
  }

  /**
   * Store user answer
   * @param {string} questionNumber - Question number
   * @param {string} answer - User's answer
   */
  storeUserAnswer(questionNumber, answer) {
    this.userAnswers[questionNumber] = {
      answer: answer,
      timestamp: new Date(),
      isCorrect: this.answerKey[questionNumber]?.correct_answer === answer,
    };
  }

  /**
   * Get user's score and results
   */
  getResults() {
    const totalQuestions = Object.keys(this.answerKey).length;
    const answeredQuestions = Object.keys(this.userAnswers).length;
    const correctAnswers = Object.values(this.userAnswers).filter(
      (answer) => answer.isCorrect
    ).length;

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      score:
        totalQuestions > 0
          ? ((correctAnswers / totalQuestions) * 100).toFixed(2)
          : 0,
      percentage:
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      details: this.getDetailedResults(),
    };
  }

  /**
   * Get detailed results by section
   */
  getDetailedResults() {
    const sectionResults = {};

    Object.keys(this.answerKey).forEach((questionNumber) => {
      const question = this.answerKey[questionNumber];
      const userAnswer = this.userAnswers[questionNumber];
      const section = question.section;

      if (!sectionResults[section]) {
        sectionResults[section] = {
          total: 0,
          correct: 0,
          questions: [],
        };
      }

      sectionResults[section].total++;
      if (userAnswer?.isCorrect) {
        sectionResults[section].correct++;
      }

      sectionResults[section].questions.push({
        questionNumber,
        correct_answer: question.correct_answer,
        user_answer: userAnswer?.answer || "Not answered",
        is_correct: userAnswer?.isCorrect || false,
        explanation: question.explanation,
      });
    });

    return sectionResults;
  }

  /**
   * Clear all exam data
   */
  clearExamData() {
    this.examData = null;
    this.answerKey = {};
    this.userAnswers = {};
    this.sessionData = {};
    console.log("All exam data cleared successfully");
  }

  /**
   * Clear only user answers (keep exam structure)
   */
  clearUserAnswers() {
    this.userAnswers = {};
    console.log("User answers cleared successfully");
  }

  /**
   * Clear session data
   */
  clearSessionData() {
    this.sessionData = {};
    console.log("Session data cleared successfully");
  }

  /**
   * Reset exam to initial state
   */
  resetExam() {
    this.clearUserAnswers();
    this.clearSessionData();
    console.log("Exam reset to initial state");
  }

  /**
   * Get current exam status
   */
  getExamStatus() {
    return {
      isLoaded: this.examData !== null,
      totalQuestions: Object.keys(this.answerKey).length,
      answeredQuestions: Object.keys(this.userAnswers).length,
      hasSessionData: Object.keys(this.sessionData).length > 0,
      examData: this.examData
        ? {
            language_pair: this.examData.language_pair,
            difficulty: this.examData.difficulty,
            fields: this.examData.fields,
          }
        : null,
    };
  }

  /**
   * Export exam data as JSON
   */
  exportExamData() {
    return {
      examData: this.examData,
      answerKey: this.answerKey,
      userAnswers: this.userAnswers,
      sessionData: this.sessionData,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import exam data from JSON
   */
  importExamData(data) {
    try {
      if (data.examData) this.examData = data.examData;
      if (data.answerKey) this.answerKey = data.answerKey;
      if (data.userAnswers) this.userAnswers = data.userAnswers;
      if (data.sessionData) this.sessionData = data.sessionData;

      console.log("Exam data imported successfully");
      return true;
    } catch (error) {
      console.error("Error importing exam data:", error);
      return false;
    }
  }
}

module.exports = ExamDataHandler;
