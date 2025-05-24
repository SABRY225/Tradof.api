const MeetingModel = require("../models/MeetingSchema");
const Event = require("../models/eventModel");
const { sendMeetingResponseNotification } = require("../helpers/sendEmail");

class MeetingResponseService {
  async handleMeetingResponse(meetingId, participantEmail, response) {
    try {
      // Find the meeting
      const meeting = await MeetingModel.findOne({ meetingId });
      if (!meeting) {
        throw new Error("Meeting not found");
      }

      // Find the participant
      const participant = meeting.participants.find(
        (p) => p.user.email === participantEmail
      );
      if (!participant) {
        throw new Error("Participant not found in meeting");
      }

      // Find the meeting creator (first participant)
      const creator = meeting.participants[0].user;

      // Find the event to get the meeting title
      const event = await Event.findOne({ meeting: meeting._id });
      if (!event) {
        throw new Error("Event not found");
      }

      // Update participant's response in the meeting
      await MeetingModel.updateOne(
        { meetingId, "participants.user.email": participantEmail },
        { $set: { "participants.$.response": response } }
      );

      // Send notification to the meeting creator
      await sendMeetingResponseNotification({
        to: creator.email,
        title: event.title,
        participantName: participant.user.name || participant.user.email,
        response: response,
      });

      return { success: true, message: `Meeting ${response} successfully` };
    } catch (error) {
      console.error("Error handling meeting response:", error);
      throw error;
    }
  }
}

module.exports = new MeetingResponseService();
