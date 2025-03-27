const { getTokenFromDotNet } = require("../helpers/getToken");
const Notification = require("../model/notificationModel");

const notificationService = {
    sendNotification: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const { type, senderId, message,description } = req.body;
            if ( !type || !senderId || !message) {
                return res.status(400).json({ success: false, message: 'Type and sender and message are required!' });
            }
    
            const newNotification = new Notification({ type, senderId, message,description });
            await newNotification.save();
    
            res.status(201).json({
                success: true,
                message: "Notification sent successfully"
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = { notificationService };