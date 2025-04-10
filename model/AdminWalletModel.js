const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
    totalSubscription: { type: Number, required: true,default:0  },
    totalPendingMoney: { type: Number, required: true ,default:0 },
    totalMoneyByFreelancers: { type: Number, required: true,default:0  }
},{ timestamps: true });

const AdminWallet = mongoose.model('AdminWallet', adminWalletSchema);

module.exports = AdminWallet;
