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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
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

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
