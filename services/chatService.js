const Chat = require("../model/chatModel");
const cloudinary = require("cloudinary").v2;

// تهيئة Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KRY_CLOUDINARY,
    api_secret: process.env.API_SECRET,
});


// API endpoints (your existing endpoints)
const chatService = {
    sendMessage: async (req, res) => {
        try {
            const { projectId } = req.params;
            const { freelancerId, companyId, senderId, message } = req.body;
            let fileUrl = null;

            // Upload file to Cloudinary if there is one
            if (req.file) {
                const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: "Chat Tradof",
                    resource_type: "auto", // Support all file types
                });
                fileUrl = uploadResponse.secure_url;
            }

            // Create new message object
            const newMessage = new Chat({
                projectId,
                freelancerId,
                companyId,
                senderId,
                message,
                file: fileUrl,
            });

            // Save message to the database
            const savedMessage = await newMessage.save();

            // Return the saved message response
            res.status(201).json({
                success: true,
                message: "Message sent successfully",
                data: {
                    projectId: savedMessage.projectId,
                    freelancerId: savedMessage.freelancerId,
                    companyId: savedMessage.companyId,
                    senderId: savedMessage.senderId,
                    message: savedMessage.message,
                    timestamp: savedMessage.timestamp.getTime(),
                }
            });

        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },

    getMessages: async (req, res) => {
        try {
            const { projectId } = req.params;

            // Fetch all messages related to the project
            const messages = await Chat.find({ projectId }).sort({ timestamp: 1 });

            res.status(200).json({
                success: true,
                messages: messages.map((msg) => ({
                    message: msg.message,
                    senderId: msg.senderId,
                    file: msg.file,
                    timestamp: msg.timestamp.getTime(),
                }))
            });

        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
};

module.exports = { chatService };
