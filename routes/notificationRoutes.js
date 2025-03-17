const express = require("express");
const router = express.Router();

// إرسال إشعار باستخدام REST API
router.post("/send", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const savedNotification = await notification.save();
    res.status(201).json({ success: true, notification: savedNotification });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Failed to send notification" });
  }
});

module.exports = router;
