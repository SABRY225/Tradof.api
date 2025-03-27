const { imageUploadUtil } = require("../helpers/cloudinary");
const { getTokenFromDotNet } = require("../helpers/getToken");
const TechnicalSupport = require("../model/technicalSupportModel");
const sharp = require("sharp");

const technicalSupportService = {
    sendMessage: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) return res.status(400).json({ success: false, message: 'Token is missing!' });
    
            const user = await getTokenFromDotNet(token);
            if (!user) return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
    
            const { userId, adminId, senderId, message } = req.body;
            if (![adminId, userId].includes(senderId)) {
                return res.status(403).json({ success: false, message: 'The sender must be the admin or the user' });
            }
    
            let chat = await TechnicalSupport.findOneAndUpdate(
                { userId, adminId },
                { $setOnInsert: { userId, adminId, messages: [] } },
                { new: true, upsert: true }
            );
    
            let fileUrl = null;
            if (req.file) {
                try {
                    const optimizedImage = await sharp(req.file.buffer)
                        .resize(800)
                        .jpeg({ quality: 80 })
                        .toBuffer();
    
                    const base64Image = `data:${req.file.mimetype};base64,${optimizedImage.toString("base64")}`;
                    const uploadResponse = await imageUploadUtil(base64Image);
                    fileUrl = uploadResponse.secure_url;
                } catch (uploadError) {
                    return res.status(500).json({ success: false, message: "File upload failed", error: uploadError.message });
                }
            }
    
            chat.messages.push({ senderId, message, file: fileUrl });
            await chat.save();
    
            res.status(201).json({ success: true, message: "Message sent successfully" });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    getMessages: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { userId } = req.params;

            const chat = await TechnicalSupport.findOne({ userId }).sort({ timestamp: 1 });;

            if (!chat) {
                return res.status(404).json({ success: false, message: "No messages found" });
            }
            res.status(200).json({
                success: true,
                messages: chat.messages
            });

        } catch (error) {
            res.status(500).json({ success: false, message:error.message });
        }
    },
};

module.exports = { technicalSupportService };
