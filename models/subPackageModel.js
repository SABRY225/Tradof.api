const mongoose = require('mongoose');

const subPackageSchema = new mongoose.Schema({
    packageId: {
       type:mongoose.Schema.Types.ObjectId,
       ref: 'Package',
    },
    company: {
        type: Object,
        required: true
    },
    startSub: { type: Date, required: true },
    status:{type:String,required: true,enum: ['pending', 'accepted'],default:"pending"},
},{ timestamps: true });

const SubPackage = mongoose.model('SubPackage', subPackageSchema);

module.exports = SubPackage;
