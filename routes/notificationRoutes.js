const express = require("express");
const { notificationService } = require("../services/notificationService");
const router = express.Router();

router.get("/setting",notificationService.getSettingNotification);
router.post("/send",notificationService.sendNotification);
router.patch("/setting",notificationService.SettingNotification);

module.exports = router;
  