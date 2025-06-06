require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const startGrpcServer = require("./grpcServer");
const { initializeSocket } = require("./socket/initialize");
const {deleteOldPendingDocs,notifyExpiringPackages} = require("./helpers/cleaner");
const MeetingService = require("./services/meetingService");
const checkUnseenMessages = require("./helpers/checkUnseenMessages");
const notifyUpcomingEvents = require("./helpers/notifyUpcomingEvents");
// Run every hour
setInterval(deleteOldPendingDocs, 60 * 60 * 1000); // 1 hour
setInterval(notifyExpiringPackages, 60 * 60 * 1000); // 1 hour
setInterval(checkUnseenMessages, 10 * 60 * 1000); // 1 hour
setInterval(notifyUpcomingEvents, 10*60 * 1000);
MeetingService.initializeCache().catch(console.error);

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
initializeSocket(server); //  WebSocket

const feedbackRoutes = require("./routes/FeedbackRoutes");
const askQuestionRoutes = require("./routes/askQuestionRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const technicalSupportRoutes = require("./routes/technicalSupportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const packageRoutes = require("./routes/packageRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const financialRoutes = require("./routes/financialRoutes");
const meetingResponseRoutes = require("./routes/meetingResponseRoutes");
const translationExamRoutes = require("./routes/translationExamRoutes");


app.use("/api/feedback", feedbackRoutes);
app.use("/api/askQuestion", askQuestionRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/technicalSupport", technicalSupportRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/meeting", meetingResponseRoutes);
app.use("/api/translation-exam", translationExamRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Yasta, I kiss your hand. Focus on the URL and Method.",
  });
});
app.get("/", (req, res) => {
  res.send("Server is running");
});
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// startGrpcServer();
