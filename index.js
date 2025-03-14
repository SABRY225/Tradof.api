const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const startGrpcServer = require("./grpcServer");
const Chat = require("./model/chatModel");

require("dotenv").config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*", // أو ضع رابط الفرونت إند الفعلي
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   },
//   transports: ["websocket", "polling"], // تأكد من دعم WebSocket
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("sendMessage", async (data) => {
//     const { projectId, freelancerId, companyId, senderId, message } = data;

//     try {
//       // console.log("📩 Received message data:", data);

//       const newMessage = new Chat({
//         projectId,
//         freelancerId,
//         companyId,
//         senderId,
//         message
//       });
//       const savedMessage = await newMessage.save();
//       // console.log("✅ Message saved:", savedMessage);

//       io.emit("newMessage", {
//         projectId: savedMessage.projectId,
//         freelancerId: savedMessage.freelancerId,
//         companyId: savedMessage.companyId,
//         senderId: savedMessage.senderId,
//         message: savedMessage.message,
//         timestamp: savedMessage.timestamp.getTime()
//       });

//     } catch (error) {
//       console.error("Error saving message:", error);
//     }
//   });

//   // استماع لحدث getMessages
//   socket.on("getMessages", async (projectId) => {
//     try {
//       const messages = await Chat.find({ projectId }).sort({ timestamp: 1 });

//       socket.emit("messagesList", messages.map((msg) => ({
//         message: msg.message,
//         senderId: msg.senderId,
//         file: msg.file,
//         timestamp: msg.timestamp.getTime(),
//       })));

//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       socket.emit("error", { message: "Error fetching messages" });
//     }
//   });

//   // التعامل مع قطع الاتصال
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/chat", require("./routes/chatRoute"));
app.use("/api/feedback", require("./routes/FeedbackRoute"));
app.use("/api/askQuestion", require("./routes/askQuestionRoute"));
app.use("/api/calendar", require("./routes/calendarRouter"));
app.use("/api/technicalSupport", require("./routes/technicalSupport"));

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

startGrpcServer();
