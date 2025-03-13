const AskedQuestions = require("../model/askedQuestionsModel");

const askedQuestionsService = {
    createQuestion: async (req, res) => {
        try {
            const { fullName, email, question } = req.body;

            const newQuestion = new AskedQuestions({
                fullName,
                email,
                question
            });

            await newQuestion.save();
            res.status(201).json({ success: true, message: "Question sent successfully" });
        } catch (error) {
            res.status(500).json({ success: false, error: "An error occurred while sending the question" });
        }
    },
    deleteQuestion: async (req, res) => {
        try {
            const { questionId } = req.params;

            const deletedQuestion = await AskedQuestions.findByIdAndDelete(questionId);
            if (!deletedQuestion) {
                return res.status(404).json({ success: false, message: "Question not found" });
            }

            res.status(200).json({ success: true, message: "Question deleted successfully" });
        } catch (error) {
            console.error("Error deleting question:", error);
            res.status(500).json({ success: false, error: "An error occurred while deleting the question" });
        }
    },
    searchQuestion: async (req, res) => {
        try {
            const { query } = req.query;

            const questions = await AskedQuestions.find({
                question: { $regex: query, $options: "i" } // Case-insensitive search
            });

            res.status(200).json({ success: true, questions });
        } catch (error) {
            console.error("Error searching question:", error);
            res.status(500).json({ success: false, error: "An error occurred while searching for the question" });
        }
    },
    answerQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const { answer } = req.body;

            const updatedQuestion = await AskedQuestions.findByIdAndUpdate(
                id,
                { answer },
                { new: true }
            );

            if (!updatedQuestion) {
                return res.status(404).json({ success: false, message: "Question not found" });
            }

            res.status(200).json({ success: true, message: "Question answered successfully", question: updatedQuestion });
        } catch (error) {
            console.error("Error answering question:", error);
            res.status(500).json({ success: false, error: "An error occurred while answering the question" });
        }
    },
    getUnansweredQuestions : async (req, res) => {
        try {
            const unansweredQuestions = await AskedQuestions.find({ answer: { $exists: false } });
    
            res.status(200).json({ success: true, questions: unansweredQuestions });
        } catch (error) {
            console.error("Error fetching unanswered questions:", error);
            res.status(500).json({ success: false, error: "An error occurred while fetching unanswered questions" });
        }
    }
};

module.exports = { askedQuestionsService };
