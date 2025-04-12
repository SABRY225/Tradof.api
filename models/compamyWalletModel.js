const mongoose = require('mongoose');

const companyWalletSchema = new mongoose.Schema({
    companyId: { type: String, required: true },
    totalBalance: { type: Number, required: true,default:0  },
    previousBalance: { type: Number, required: true ,default:0 },
    pendingBalance: { type: Number, required: true,default:0  }
},{ timestamps: true });

const CompanyWallet = mongoose.model('CompanyWallet', companyWalletSchema);

module.exports = CompanyWallet;
