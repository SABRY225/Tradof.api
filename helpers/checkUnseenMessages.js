const Chat = require('../models/chatModel');
const Notification = require('../models/notificationModel');

const checkUnseenMessages = async () => {
    try {
        const chats = await Chat.find({
            'messages.seen': false,
            'messages.notified': false
        });

        for (const chat of chats) {
            let updated = false;

            const unseenMessages = chat.messages.filter(msg => !msg.seen && !msg.notified);

            if (unseenMessages.length > 0) {
                const lastUnseen = unseenMessages[unseenMessages.length - 1];
                const receiverId = lastUnseen.senderId === chat.freelancerId
                    ? chat.companyId
                    : chat.freelancerId;

                const newNotification = await Notification.create({ type:"Message", receiverId, message:"A new message has not been answered" });
                 await newNotification.save();

                // تحديث الرسائل
                chat.messages.forEach(msg => {
                    if (!msg.seen && !msg.notified) {
                        msg.notified = true;
                        updated = true;
                    }
                });

                if (updated) {
                    await chat.save();
                }
            }
        }

        console.log('✅ تم فحص الرسائل غير المقروءة وإرسال التنبيهات.');
    } catch (error) {
        console.error('❌ خطأ أثناء فحص الرسائل:', error.message);
    }
};

module.exports = checkUnseenMessages;
