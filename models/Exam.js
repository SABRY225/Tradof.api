const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  initial_language: {
    type: Object,
    required: true,
  },
  target_language: {
    type: Object,
    required: true,
  },
  examData: {
    type: Object,
    required: true,
  },
  userAnswers: {
    type: Object,
    default: {},
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  examDate: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Exam", examSchema);
