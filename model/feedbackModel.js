const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    rate: { type: String, required: true },
    reason_rate: { type: String, required: true },
    idea: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
