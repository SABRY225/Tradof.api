const MeetingModel = require("../models/MeetingSchema");

class MeetingService {
  constructor() {
    this.meetings = new Map(); // In-memory cache
    this.userSockets = new Map();
    this.socketUsers = new Map();
  }

  // Create a new meeting
  async createMeeting(meetingId, user, participantUser) {
    try {
      // Check if meeting already exists
      const existingMeeting = await MeetingModel.findOne({ meetingId });
      if (existingMeeting) {
        console.error("Meeting with this ID already exists:", meetingId);
        return false;
      }

      // Create in MongoDB
      const meeting = await MeetingModel.create({
        meetingId,
        participants: [
          { user, socketId: null },
          { user: participantUser, socketId: null },
        ],
      });

      // Update in-memory cache
      if (!this.meetings.has(meetingId)) {
        this.meetings.set(meetingId, new Set());
      }
      this.meetings.get(meetingId).add(user.email);
      this.meetings.get(meetingId).add(participantUser.email);

      return meeting;
    } catch (error) {
      console.error("Error creating meeting:", error);
      return false;
    }
  }

  // Join an existing meeting
  async joinMeeting(meetingId, email, socketId) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) return { success: false, message: "Meeting not found" };

      // Check if user is allowed to join (email is in participants list)
      const isAllowedParticipant = meeting.participants.some(
        (p) => p.user.email === email
      );
      if (!isAllowedParticipant) {
        return {
          success: false,
          message: "User not authorized to join this meeting",
        };
      }

      // Check if participant already exists
      const existingParticipant = meeting.participants.find(
        (p) => p.user.email === email
      );

      if (existingParticipant) {
        await MeetingModel.updateOne(
          { meetingId, "participants.user.email": email },
          {
            $set: {
              "participants.$.socketId": socketId,
            },
          }
        );
      }

      // Set meeting as active since at least one user is connected
      await MeetingModel.updateOne({ meetingId }, { $set: { isActive: true } });

      // Update in-memory cache
      if (!this.meetings.has(meetingId)) {
        this.meetings.set(meetingId, new Set());
      }
      this.meetings.get(meetingId).add(email);

      this.userSockets.set(email, socketId);
      this.socketUsers.set(socketId, email);

      return { success: true };
    } catch (error) {
      console.error("Error joining meeting:", error);
      return { success: false, message: "Error joining meeting" };
    }
  }

  // Leave a meeting
  async leaveMeeting(meetingId, user) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) return;

      // Update MongoDB - set socketId to null instead of removing participant
      await MeetingModel.updateOne(
        { meetingId, "participants.user.email": user.email },
        { $set: { "participants.$.socketId": null } }
      );

      // Check if all participants are disconnected (socketId is null)
      const updatedMeeting = await MeetingModel.findOne({ meetingId });
      const allDisconnected = updatedMeeting.participants.every(
        (p) => p.socketId === null
      );

      if (allDisconnected) {
        await MeetingModel.updateOne(
          { meetingId },
          { $set: { isActive: false } }
        );
      }

      // Update in-memory cache
      if (this.meetings.has(meetingId)) {
        const participants = this.meetings.get(meetingId);
        participants.delete(user.email);
        if (participants.size === 0) {
          this.meetings.delete(meetingId);
        }
      }

      // Clean up user mappings
      const socketId = this.userSockets.get(user.email);
      if (socketId) {
        this.userSockets.delete(user.email);
        this.socketUsers.delete(socketId);
      }
    } catch (error) {
      console.error("Error leaving meeting:", error);
    }
  }

  // Get all participants in a meeting
  async getMeetingParticipants(meetingId) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      return meeting ? meeting.participants.map((p) => p.user) : [];
    } catch (error) {
      console.error("Error getting participants:", error);
      return [];
    }
  }

  // Get socket ID for an email
  getSocketId(email) {
    return this.userSockets.get(email);
  }

  // Get email for a socket ID
  getEmail(socketId) {
    return this.socketUsers.get(socketId);
  }

  // Check if a meeting exists
  async meetingExists(meetingId) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      return !!meeting;
    } catch (error) {
      console.error("Error checking meeting existence:", error);
      return false;
    }
  }

  // Check if a user is in a meeting
  async isUserInMeeting(meetingId, email) {
    try {
      const meeting = await MeetingModel.findOne({
        meetingId,
        "participants.user.email": email,
      });
      return !!meeting;
    } catch (error) {
      console.error("Error checking user in meeting:", error);
      return false;
    }
  }

  // Get all active meetings
  async getAllMeetings() {
    try {
      const meetings = await MeetingModel.find({ isActive: true });
      return meetings.reduce((acc, meeting) => {
        acc[meeting.meetingId] = meeting.participants.map((p) => p.user);
        return acc;
      }, {});
    } catch (error) {
      console.error("Error getting all meetings:", error);
      return {};
    }
  }

  // Initialize in-memory cache from database
  async initializeCache() {
    try {
      const meetings = await MeetingModel.find({ isActive: true });
      meetings.forEach((meeting) => {
        this.meetings.set(meeting.meetingId, new Set());
        meeting.participants.forEach((participant) => {
          if (participant.user && participant.user.email) {
            this.meetings.get(meeting.meetingId).add(participant.user.email);
            this.userSockets.set(participant.user.email, participant.socketId);
            this.socketUsers.set(participant.socketId, participant.user.email);
          }
        });
      });
    } catch (error) {
      console.error("Error initializing cache:", error);
    }
  }

  // Set answer for a participant
  async setAnswer(meetingId, user, answer) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) return false;

      await MeetingModel.updateOne(
        { meetingId, "participants.user.email": user.email },
        { $set: { "participants.$.answer": answer } }
      );

      return true;
    } catch (error) {
      console.error("Error setting answer:", error);
      return false;
    }
  }

  // Get participant's offer
  async getParticipantOffer(meetingId, user) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) return null;

      const participant = meeting.participants.find(
        (p) => p.user.email === user.email
      );
      return participant ? participant.offer : null;
    } catch (error) {
      console.error("Error getting participant offer:", error);
      return null;
    }
  }

  // Get participant's answer
  async getParticipantAnswer(meetingId, user) {
    try {
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) return null;

      const participant = meeting.participants.find(
        (p) => p.user.email === user.email
      );
      return participant ? participant.answer : null;
    } catch (error) {
      console.error("Error getting participant answer:", error);
      return null;
    }
  }
}

module.exports = new MeetingService();
