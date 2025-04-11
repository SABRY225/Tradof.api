const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    user: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
