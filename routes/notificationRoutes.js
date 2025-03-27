const express = require("express");
const { notificationService } = require("../services/notificationService");
const router = express.Router();

router.post("/send",notificationService.sendNotification);

module.exports = router;
