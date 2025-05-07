const { status } = require('@grpc/grpc-js');
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
    isAllowed: { type: Boolean, required: false,default:0 },
    status:{
        type: String,
        required: false,
        enum: ['pending', 'approve ', 'deny'],
        default:"pending"
    },
    timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
