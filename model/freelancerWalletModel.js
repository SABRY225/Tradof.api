const mongoose = require('mongoose');

const freelancerWalletSchema = new mongoose.Schema({
    companyId: { type: String, required: true },
    totalBalance: { type: Number, required: true },
    availableBalance: { type: Number, required: true },
    pendingBalance: { type: Number, required: true },
},{ timestamps: true });

const FreelancerWallet = mongoose.model('FreelancerWallet', freelancerWalletSchema);

module.exports = FreelancerWallet;
