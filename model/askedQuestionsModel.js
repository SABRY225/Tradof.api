const mongoose = require('mongoose');

const askedQuestionsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: false }
});

const AskedQuestions = mongoose.model('AskedQuestions', askedQuestionsSchema);

module.exports = AskedQuestions;
