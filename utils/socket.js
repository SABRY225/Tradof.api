const socketIo = require("socket.io");
const Chat = require("../models/chatModel");

function initializeSocket(server) {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("sendMessage", async (data) => {
            await handleSendMessage(io, data);
        });

        socket.on("getMessages", async (projectId, userId) => {
            await handleGetMessages(socket, projectId,userId);
        });
        
        socket.on("getNotifications", async (userId) => {
            await handleGetNotifications(socket, projectId,userId);
        });

        socket.on("seenNotification", async (notificationId) => {
            await handleSeenNotification(socket, notificationId);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
}

const mongoose = require("mongoose");

async function handleSendMessage(io, data) {
    try {
        const { projectId, freelancerId, companyId, senderId, message } = data;

        // ✅ التحقق من القيم المطلوبة
        if (!projectId || !freelancerId || !companyId || !senderId || !message) {
            return console.error("Validation Error: Missing required fields");
        }

        // ✅ التحقق من أن `projectId`, `freelancerId`, `companyId`, و `senderId` معرفات MongoDB صحيحة
        // if (![projectId, freelancerId, companyId, senderId].every(mongoose.Types.ObjectId.isValid)) {
        //     return console.error("Validation Error: Invalid ObjectId format");
        // }

        // ✅ رفض الرسائل الفارغة أو التي تحتوي فقط على مسافات
        if (typeof message !== "string" || message.trim().length === 0) {
            return console.error("Validation Error: Message cannot be empty");
        }

        let chat = await Chat.findOne({ projectId, freelancerId, companyId });

        if (!chat) {
            chat = new Chat({
                projectId,
                freelancerId,
                companyId,
                messages: [],
            });
        }

        const newMessage = {
            senderId,
            message: message.trim(),
            seen: false,
            timestamp: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        io.emit("newMessage", {
            projectId: chat.projectId,
            freelancerId: chat.freelancerId,
            companyId: chat.companyId,
            senderId: newMessage.senderId,
            message: newMessage.message,
            seen: newMessage.seen,
            timestamp: newMessage.timestamp.getTime(),
        });
    } catch (error) {
        console.error("Error saving message:", error.message);
    }
}

async function handleGetMessages(socket, { projectId, userId }) {
    try {
        if (!projectId || !userId) {
            return socket.emit("error", { message: "Missing projectId or userId" });
        }
        if (![projectId, userId].every(mongoose.Types.ObjectId.isValid)) {
            return socket.emit("error", { message: "Invalid ObjectId format" });
        }

        const chat = await Chat.findOne({ projectId });

        if (!chat) {
            return socket.emit("messagesList", []);
        }

        let updated = false;
        chat.messages.forEach((msg) => {
            if (msg.senderId !== userId && !msg.seen) {
                msg.seen = true;
                updated = true;
            }
        });

        if (updated) await chat.save();

        socket.emit(
            "messagesList",
            chat.messages.map((msg) => ({
                message: msg.message,
                senderId: msg.senderId,
                seen: msg.seen,
                timestamp: msg.timestamp.getTime(),
            }))
        );

        if (updated) io.emit("messagesSeen", { projectId, seen: true });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        socket.emit("error", { message: "Error fetching messages" });
    }
}

async function handleSeenNotification(socket, notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { seen: true });
  
      socket.emit("notificationSeen", { notificationId, seen: true });
    } catch (error) {
      console.error("Error updating notification:", error);
      socket.emit("error", { message: "Error updating notification" });
    }
}
  
async function handleGetNotifications(socket, userId) {
    try {
      const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
  
      const unseenCount = await Notification.countDocuments({ userId, seen: false });
  
      socket.emit("notificationsList", {
        notifications,
        unseenCount, 
      });
  
    } catch (error) {
      console.error("Error fetching notifications:", error);
      socket.emit("error", { message: "Error fetching notifications" });
    }
}

module.exports = { initializeSocket };
