const mongoose = require('mongoose');

const PFinancialSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true
    },
    company: {
        type: Object,
        required: true
    },
    freelancerId: {
        type: String,
        required: true
    },
    budget: { type: Number, required: true },
    deliveryTime: { type: String, required: false },
    paymentStatus: { type: String, required: true, enum: ['pending', 'paid', 'rejected'] },
    paymentDate: { type: Date, required: false },
},{ timestamps: true });

const PFinancial = mongoose.model('PFinancial', PFinancialSchema);

module.exports = PFinancial;
