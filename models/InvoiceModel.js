const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["Subscription", "Withdraw Profits","Pay Project"],
    },
    user: {
        type: Object,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    pFinancialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PFinancial",
    required: false
    },
    subPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubPackage",
    required: false
    },
    withdrawProfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WithdrawProfit",
    required: false
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
