const Notification = require("../models/notificationModel");


async function handleSeenNotification(socket, notificationId) {
  try {
    await Notification.findByIdAndUpdate(notificationId, { seen: true });

    socket.emit("notificationSeen", { notificationId, seen: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    socket.emit("error", { message: "Error updating notification" });
  }
}

async function handleGetNotifications(socket, userId) {
  try {
    console.log(userId);
    const notifications = await Notification.find({ receiverId: userId }).sort({
      timestamp: -1,
    });

    const unseenCount = await Notification.countDocuments({
      receiverId: userId,
      seen: false,
    });

    socket.emit("notificationsList", {
      notifications,
      unseenCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    socket.emit("error", { message: "Error fetching notifications" });
  }
}

module.exports = (socket, io) => {
  socket.on("getNotifications", async ({ userId }) => {
    await handleGetNotifications(socket, userId);
  });

  socket.on("seenNotification", async (notificationId) => {
    await handleSeenNotification(socket, notificationId);
  });
};
