const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Technical Support', 'Offer', 'Message','Calendar','Report'],
    },
    userId: {
        type: String, required: true
    },
    message: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    link:{
        type: String, required: true
    },
    timestamp: {
        type: Date, default: Date.now
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
