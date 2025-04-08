const mongoose = require('mongoose');

const withdrawProfitSchema = new mongoose.Schema({
    freelancerId: {
        type: String,
        required: true
    },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, required: true, enum: ['pending', 'paid', 'rejected'],default: 'pending'},
    paymentDate: { type: Date, required: false },
    orderStuty: { type: String,required: true,enum: ['pending', 'accepted'],default: 'pending'},
},{ timestamps: true });

const WithdrawProfit = mongoose.model('WithdrawProfit', withdrawProfitSchema);

module.exports = WithdrawProfit;
