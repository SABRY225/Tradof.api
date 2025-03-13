const Chat = require("../model/chatModel");
const cloudinary = require("cloudinary").v2;

// تهيئة Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KRY_CLOUDINARY,
    api_secret: process.env.API_SECRET,
});

const chatService = {
    sendMessages: async (req, res) => {
        try {
            const { projectId } = req.params;
            const { freelancerId, companyId, senderId, message } = req.body;
            let fileUrl = null;

            // رفع الملف إلى Cloudinary إذا كان هناك ملف مرفق
            if (req.file) {
                const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: "Chat Tradof",
                    resource_type: "auto" // دعم جميع أنواع الملفات
                });
                fileUrl = uploadResponse.secure_url; // حفظ رابط الملف
            }

            // إنشاء رسالة جديدة
            const newMessage = new Chat({
                projectId,
                freelancerId,
                companyId,
                senderId,
                message,
                file: fileUrl
            });

            // حفظ الرسالة في قاعدة البيانات
            const savedMessage = await newMessage.save();

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

            // جلب جميع الرسائل الخاصة بالمشروع
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
