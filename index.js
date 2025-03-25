require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const startGrpcServer = require("./grpcServer");
const { initializeSocket } = require("./utils/socket");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
initializeSocket(server); //  WebSocket

const feedbackRoutes = require("./routes/FeedbackRoute");
const askQuestionRoutes = require("./routes/askQuestionRoute");
const calendarRoutes = require("./routes/calendarRouter");
const technicalSupportRoutes = require("./routes/technicalSupportRouter");
const notificationRoutes = require("./routes/notificationRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

app.use("/api/feedback", feedbackRoutes);
app.use("/api/askQuestion", askQuestionRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/technicalSupport", technicalSupportRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/token", tokenRoutes);  

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// startGrpcServer();
