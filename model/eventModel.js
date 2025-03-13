const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    calendarId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Calendar',
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    people: [{
        fullName: { type: String, required: true },
        image: { type: String, required: true },
        email: { type: String, required: true }
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
