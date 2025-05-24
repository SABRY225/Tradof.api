const socketIo = require("socket.io");
const chatting = require("./chatting");
const notification = require("./notification");
const meeting = require("./meeting");
const MeetingService = require("../services/meetingService");

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

    chatting(socket, io);
    notification(socket, io);
    meeting(socket, io);

    socket.on("disconnect", async () => {
      console.log(`User ${socket.id} disconnected`);
    });
  });
}

module.exports = { initializeSocket };
