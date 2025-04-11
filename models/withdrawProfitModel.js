const mongoose = require('mongoose');

const withdrawProfitSchema = new mongoose.Schema({
    freelancer: {
        type: Object,
        required: true
    },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, required: true, enum: ['pending', 'paid', 'rejected'],default: 'pending'},
    paymentDetails:{
        type: Object,
        required: true
    }
},{ timestamps: true });

const WithdrawProfit = mongoose.model('WithdrawProfit', withdrawProfitSchema);

module.exports = WithdrawProfit;
