const { getTokenFromDotNet } = require("../helpers/getToken");
const Notification = require("../models/notificationModel");
const SettingNotification = require("../models/SettingNotificationModel");

const notificationService = {
  sendNotification: async (req, res) => {
    try {
    
      const { type, receiverId, message, description } = req.body;
      if (!type || !receiverId || !message) {
        return res.status(400).json({
          success: false,
          message: "Type and receiver and message are required!",
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
      if (!user.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const {sendEmail, alertOffers, messageChat } = req.body;

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

      const filter =  { user };
      const update = { sendEmail, alertOffers, messageChat };
      const options = { new: true, upsert: true }; // upsert = create if not exists

      const updatedSetting = await SettingNotification.findOneAndUpdate(
        filter,
        update,
        options
      );

      updatedSetting.save();

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
      res.status(200).json({
        success: true,
        data: {
          alertOffers: settingNotification.alertOffers?1:0,
          messageChat: settingNotification.messageChat?1:0,
          sendEmail: settingNotification.sendEmail?1:0,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = { notificationService };
