const mongoose = require('mongoose');

const settingNotificationSchema = new mongoose.Schema({
    user: {type: Object,required: false},
    companyId: {type: String,required: false},
    sendEmail: { type: Boolean, required: false, default: 0},
    alertOffers: { type: Boolean, required: false, default: 0},
    messageChat: { type: Boolean, required: false, default: 0},
},{ timestamps: true });

const SettingNotification = mongoose.model('SettingNotification', settingNotificationSchema);

module.exports = SettingNotification;
