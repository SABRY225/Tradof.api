const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    freelancerId: { type: String, required: true },
    companyId: { type: String, required: true },
    messages: { type: [messageSchema], default: [] }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
