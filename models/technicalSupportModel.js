const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    file: { type: String, trim: false },
    timestamp: { type: Date, default: Date.now }
});

const technicalSupportSchema = new mongoose.Schema({
    user: { type: Object, required: true },
    admin:{ type: String, required: true },
    messages: [messageSchema]
},{ timestamps: true });

const TechnicalSupport = mongoose.model('TechnicalSupport', technicalSupportSchema);

module.exports = TechnicalSupport;
