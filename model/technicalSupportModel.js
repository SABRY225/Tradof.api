const mongoose = require('mongoose');

const technicalSupportSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    adminId:{ type: String, required: true },
    senderId: { type: String, required: true },
    message: { type: String, required: true },
    file: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

const TechnicalSupport = mongoose.model('TechnicalSupport', technicalSupportSchema);

module.exports = TechnicalSupport;
