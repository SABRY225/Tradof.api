const socketIo = require("socket.io");
const Chat = require("../model/chatModel");

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

        socket.on("getMessages", async (projectId) => {
            await handleGetMessages(socket, projectId);
        });
        
        socket.on("getNotifications", async (userId) => {
            await handleGetNotifications(socket, userId);
        });

        socket.on("seenNotification", async (notificationId) => {
            await handleSeenNotification(socket, notificationId);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
}

async function handleSendMessage(io, data) {
    const { projectId, freelancerId, companyId, senderId, message } = data;

    try {
        const newMessage = new Chat({
            projectId,
            freelancerId,
            companyId,
            senderId,
            message,
        });

        const savedMessage = await newMessage.save();

        io.emit("newMessage", {
            projectId: savedMessage.projectId,
            freelancerId: savedMessage.freelancerId,
            companyId: savedMessage.companyId,
            senderId: savedMessage.senderId,
            message: savedMessage.message,
            timestamp: savedMessage.timestamp.getTime(),
        });
    } catch (error) {
        console.error("Error saving message:", error);
    }
}

async function handleGetMessages(socket, projectId) {
    try {
        const messages = await Chat.find({ projectId }).sort({ timestamp: 1 });

        socket.emit(
            "messagesList",
            messages.map((msg) => ({
                message: msg.message,
                senderId: msg.senderId,
                file: msg.file,
                timestamp: msg.timestamp.getTime(),
            }))
        );
    } catch (error) {
        console.error("Error fetching messages:", error);
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
