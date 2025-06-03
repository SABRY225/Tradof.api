const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  examData: {
    type: Object,
    required: true,
  },
  answers: {
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
});

module.exports = mongoose.model("Exam", examSchema);
