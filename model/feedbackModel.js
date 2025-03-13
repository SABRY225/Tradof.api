const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        id: { type: String, required: true },
        role: { type: String, required: true},
        fullName: { type: String, required: true },
        email: { type: String, required: true }
    },
    rate: { 
        type: String,
        required: true,
        enum: ['Very Bad', 'Bad', 'Good','Very Good','Excellent'],
    },
    reason_rate: { type: String, required: true },
    idea: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
