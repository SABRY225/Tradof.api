const Feedback = require("../models/feedbackModel");
const { getTokenFromDotNet } = require("../helpers/getToken");
const { default: mongoose } = require("mongoose");

const feedbackService = {
    sendFeedback: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const { rate, reasonRate, idea } = req.body;
            if (!rate || !reasonRate) {
                return res.status(400).json({ success: false, message: 'Rate and reasonRate are required!' });
            }
    
            const newFeedback = new Feedback({
                user, 
                rate,
                reasonRate,
                idea
            });
    
            await newFeedback.save();
    
            res.status(201).json({
                success: true,
                message: "Feedback sent successfully",
                feedback: newFeedback
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    getFeedbacks: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const feedbacks = await Feedback.find()
                .select('-__v') 
                .sort({ timestamp: -1 }); 
    
            if (!feedbacks.length) {
                return res.status(404).json({ success: false, message: 'No feedbacks found!' });
            }
    
            res.status(200).json({
                success: true,
                data:feedbacks
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    deleteFeedback: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const { feedbackId } = req.params;
    
            if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
                return res.status(400).json({ success: false, message: 'Invalid feedback ID format' });
            }
    
            const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);
    
            if (!deletedFeedback) {
                return res.status(404).json({ success: false, message: 'Feedback not found' });
            }
    
            res.status(200).json({
                success: true,
                message: 'Feedback deleted successfully'
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

module.exports = { feedbackService };