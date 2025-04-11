const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    typeId: { type: String, required: false },
    orderId: { type: String, required: false },
    status: { type: String, required: false, enum: ['pending', 'paid', 'rejected'] },
},{ timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;