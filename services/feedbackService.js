const Feedback = require("../models/feedbackModel");
const { getTokenFromDotNet } = require("../helpers/getToken");
const { default: mongoose } = require("mongoose");
const Notification = require("../models/notificationModel");

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
            const newNotification = new Notification({ type:"Feedback", receiverId:"admin", message:"A new feedback has been added to the platform that needs to be reviewed." });
            await newNotification.save();
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
    approveFeedback: async (req, res) => {
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
    
            const updatedFeedback = await Feedback.findByIdAndUpdate(
                feedbackId,
                { status: "approve",isAllowed: 1 },
                { new: true } 
              );
    
            if (!updatedFeedback) {
                return res.status(404).json({ success: false, message: 'Feedback not found' });
            }
    
            res.status(200).json({
                success: true,
                message: 'Feedback Approve successfully'
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    danyFeedback: async (req, res) => {
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
    
            const updatedFeedback = await Feedback.findByIdAndUpdate(
                feedbackId,
                { status: "dany" ,isAllowed: 0},
                { new: true } // optional, returns the updated document
              );
    
            if (!updatedFeedback) {
                return res.status(404).json({ success: false, message: 'Feedback not found' });
            }
    
            res.status(200).json({
                success: true,
                message: 'Feedback Dany successfully'
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = { feedbackService };