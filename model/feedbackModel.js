const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: Object,
        required: true
    },
    rate: {
        type: String,
        required: true,
        enum: ['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'],
    },
    reasonRate: { type: String, required: true },
    idea: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
