const { getTokenFromDotNet } = require("../helpers/getToken");
const Notification = require("../models/notificationModel");
const SettingNotification = require("../models/SettingNotificationModel");

const notificationService = {
  sendNotification: async (req, res) => {
    try {
      const token = req.headers["authorization"];

      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const { type, receiverId, message, description } = req.body;
      if (!type || !receiverId || !message) {
        return res.status(400).json({
          success: false,
          message: "Type and sender and message are required!",
        });
      }

      const newNotification = new Notification({
        type,
        receiverId,
        message,
        description,
      });
      await newNotification.save();

      res.status(201).json({
        success: true,
        message: "Notification sent successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  SettingNotification: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const { companyId, sendEmail, alertOffers, messageChat } = req.body;

      if (
        sendEmail === undefined ||
        alertOffers === undefined ||
        messageChat === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "sendEmail, alertOffers, and messageChat are required!",
        });
      }

      const filter = { "user.id": user.id };
      const update = {
        user,
        sendEmail,
        alertOffers,
        messageChat,
      };
      const options = { new: true, upsert: true };
      const updatedSetting = await SettingNotification.findOneAndUpdate(
        filter,
        update,
        options
      );

      res.status(200).json({
        success: true,
        message: "Notification setting updated successfully",
        data: updatedSetting,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getSettingNotification: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }
      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const settingNotification = await SettingNotification.findOne({
        "user.id": user.id,
      });
      if (!settingNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification setting not found",
        });
      }
      // console.log(settingNotification);
      res.status(200).json({
        success: true,
        data: {
          alertOffers: settingNotification.alertOffers,
          messageChat: settingNotification.messageChat,
          sendEmail: settingNotification.sendEmail,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = { notificationService };
