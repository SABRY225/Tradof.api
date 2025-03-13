const mongoose = require('mongoose');

const askedQuestionsSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

const AskedQuestions = mongoose.model('AskedQuestions', askedQuestionsSchema);

module.exports = AskedQuestions;
