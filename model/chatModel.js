const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    freelancerId: { type: String, required: true },
    companyId: { type: String, required: true },
    senderId: { type: String, required: true },
    message: { type: String, required: true },
    file: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
