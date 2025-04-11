const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
