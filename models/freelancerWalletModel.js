const mongoose = require('mongoose');

const freelancerWalletSchema = new mongoose.Schema({
    freelancerId: { type: String, required: true},
    totalBalance: { type: Number, required: true,default:0 },
    availableBalance: { type: Number, required: true ,default:0 },
    pendingBalance: { type: Number, required: true ,default:0},
},{ timestamps: true });

const FreelancerWallet = mongoose.model('FreelancerWallet', freelancerWalletSchema);

module.exports = FreelancerWallet;
