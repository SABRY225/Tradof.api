const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["Technical Support", "Offer","Payment", "Message", "Calendar", "Report"],
    },
    receiverId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    seen: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
