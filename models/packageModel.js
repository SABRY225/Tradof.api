const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    durationInMonths:{
        type: Number,
        required: true,
        min: 1,
        max: 12
    }
},{ timestamps: true });

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
