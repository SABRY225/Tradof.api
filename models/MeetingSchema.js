const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  user: {
    type: Object,
    required: true,
  },
  socketId: {
    type: String,
    default: null,
  },
  offer: {
    type: Object,
    default: null,
  },
  answer: {
    type: Object,
    default: null,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [participantSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

// Index for faster queries
meetingSchema.index({ meetingId: 1 });
meetingSchema.index({ "participants.user.email": 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
