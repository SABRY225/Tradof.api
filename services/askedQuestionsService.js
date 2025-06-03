const { default: mongoose } = require("mongoose");
const { getTokenFromDotNet } = require("../helpers/getToken");
const AskedQuestions = require("../models/askedQuestionsModel");
const Notification = require("../models/notificationModel");

const askedQuestionsService = {
    createQuestion: async (req, res) => {
        try {
            const token = req.headers['authorization']; 
            
            if (!token) {
                return res.status(400).json({success: false, message: 'token is missing!' });
            }
            const user = await getTokenFromDotNet(token); 
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const {question} = req.body;
            if (!question) {
                return res.status(400).json({ success: false,message: "Question are required" });
            }
            const existingQuestion = await AskedQuestions.findOne({ question });

            if (existingQuestion) {
                return res.status(400).json({ success: false, message: "This question has already been asked!" });
            }
            const newQuestion = await AskedQuestions.create({user,question});
            const newNotification = await Notification.create({ type:"AskQuestion", receiverId:"admin", message:"A new ask question has been sent" });
            res.status(201).json({ success: true, message: "The question was sent to the officials" });
        } catch (error) {
            res.status(500).json({ success: false, message:error.message });
        }
    },
    deleteQuestion: async (req, res) => {
        try {
            const token = req.headers['authorization']; 
            
            if (!token) {
                return res.status(400).json({success: false, message: 'token is missing!' });
            }
            const user = await getTokenFromDotNet(token); 
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { questionId } = req.params;
    
            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                return res.status(400).json({ success: false, message: "Invalid Question ID" });
            }
    
            const deletedQuestion = await AskedQuestions.findByIdAndDelete(questionId);
    
            if (!deletedQuestion) {
                return res.status(404).json({ success: false, message: "Question not found" });
            }
    
            res.status(200).json({ success: true, message: "Question deleted successfully" });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    searchQuestion: async (req, res) => {
        try {
            const token = req.headers['authorization']; 
            
            if (!token) {
                return res.status(400).json({success: false, message: 'token is missing!' });
            }
            const user = await getTokenFromDotNet(token); 
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { query } = req.query;
    
            if (!query || query.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Search query is required" });
            }
    
            const questions = await AskedQuestions.find({
                question: { $regex: new RegExp(query, "i") },
                answer: { $exists: true, $ne: "" } // فقط الأسئلة التي لديها إجابة
              });
    
            if (questions.length === 0) {
                return res.status(200).json({ success: true,data:[], message: "No matching questions found" });
            }
    
            res.status(200).json({ success: true, data:questions });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    answerQuestion: async (req, res) => {
        try {
            const token = req.headers['authorization']; 
            
            if (!token) {
                return res.status(400).json({success: false, message: 'token is missing!' });
            }
            const user = await getTokenFromDotNet(token); 
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { id } = req.params;
            const { answer } = req.body;
    
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid Question ID" });
            }
    
            if (!answer || answer.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Answer is required" });
            }
    
            const question = await AskedQuestions.findById(id);
    
            if (!question) {
                return res.status(404).json({ success: false, message: "Question not found" });
            }
    
            if (question.answer) {
                return res.status(400).json({ success: false, message: "Question already answered" });
            }
    
            question.answer = answer;
            await question.save();
            const newNotification = await Notification.create({ type:"AskQuestion", receiverId:question.user.id, message:question.answer });
            res.status(200).json({ success: true, message: "Question answered successfully", question });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    getUnansweredQuestions: async (req, res) => {
        try {
            const token = req.headers['authorization']; 
            
            if (!token) {
                return res.status(400).json({success: false, message: 'token is missing!' });
            }
            const user = await getTokenFromDotNet(token); 
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const unansweredQuestions = await AskedQuestions.find({
                answer: { $in: [null, ""] } 
            });
    
            if (unansweredQuestions.length === 0) {
                return res.status(404).json({ success: false, message: "No unanswered questions found" });
            }
    
            res.status(200).json({ success: true, data: unansweredQuestions });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateAnswer: async (req, res) => {
    try {
        const token = req.headers['authorization']; 
            
        if (!token) {
            return res.status(400).json({success: false, message: 'token is missing!' });
        }
        const user = await getTokenFromDotNet(token); 
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
        }
        
        const { id } = req.params;
        const { answer } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Question ID" });
        }

        if (!answer || answer.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Answer is required" });
        }

        const updatedQuestion = await AskedQuestions.findByIdAndUpdate(
            id,
            { answer },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, message: "Answer updated successfully", question: updatedQuestion });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
   }
};

module.exports = { askedQuestionsService };
