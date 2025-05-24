const Chat = require("../models/chatModel");

async function handleSendMessage(io, socket, data) {
  try {
    const { projectId, freelancerId, companyId, senderId, message } = data;

    if (!projectId || !freelancerId || !companyId || !senderId || !message) {
      console.error("Validation Error: Missing required fields");
      return socket.emit("error", { message: "Missing required fields" });
    }

    // ✅ التحقق من أن `projectId`, `freelancerId`, `companyId`, و `senderId` معرفات MongoDB صحيحة
    const isUUID = (id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      );
    const isNumericId = (id) => Number.isInteger(Number(id));

    // console.log(projectId, freelancerId, companyId, senderId);
    if (
      !isNumericId(projectId) &&
      ![freelancerId, companyId, senderId].every(isUUID)
    ) {
      console.error("Validation Error: Invalid UUID format");
      return socket.emit("error", { message: "Invalid ID format" });
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      console.error("Validation Error: Message cannot be empty");
      return socket.emit("error", { message: "Message cannot be empty" });
    }

    let chat = await Chat.findOne({ projectId, freelancerId, companyId });
    console.log(chat, projectId, freelancerId, companyId);
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
    socket.emit("error", { message: "Server error while sending message" });
  }
}

async function handleGetMessages(socket, { projectId, userId }) {
  try {
    const isUUID = (id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      );
    const isNumericId = (id) => Number.isInteger(Number(id));
    // console.log(projectId, userId);
    if (!projectId || !userId) {
      return socket.emit("error", { message: "Missing projectId or userId" });
    }

    if (!isNumericId(projectId)) {
      return socket.emit("error", { message: "❌ Invalid projectId format" });
    }
    if (!isUUID(userId)) {
      return socket.emit("error", { message: "❌ Invalid userId format" });
    }

    const chat = await Chat.findOne({
      projectId,
      $or: [{ freelancerId: userId }, { companyId: userId }],
    });

    // console.log(chat, userId, projectId);
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
        timestamp: msg.timestamp ? msg.timestamp.getTime() : Date.now(),
      }))
    );

    if (updated) io.emit("messagesSeen", { projectId, seen: true });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    socket.emit("error", {
      message: "❌ Server error while fetching messages",
      detail: error.message,
    });
  }
}

module.exports = (socket, io) => {
  socket.on("sendMessage", async (data) => {
    await handleSendMessage(io, socket, data);
  });

  socket.on("getMessages", async ({ projectId, userId }) => {
    return await handleGetMessages(socket, { projectId, userId });
  });
};
