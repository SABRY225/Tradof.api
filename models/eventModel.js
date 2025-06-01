const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  calendarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Calendar",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: function () {
      return this.isMeeting === false;
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notifiedBeforeStart: {
    type: Boolean,
    default: false
  },
  isMeeting: {
    type: Boolean,
    default: false,
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meeting",
    required: function () {
      return this.isMeeting === true;
    },
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
