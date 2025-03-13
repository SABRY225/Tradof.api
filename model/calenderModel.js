const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
