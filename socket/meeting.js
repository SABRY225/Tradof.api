const MeetingService = require("../services/meetingService");

const meeting = (socket, io) => {
  socket.on("join-room", async ({ roomId, email }) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);

    try {
      // Check if meeting exists
      const meetingExists = await MeetingService.meetingExists(roomId);

      if (!meetingExists) {
        socket.emit("error", { message: "Not Found Meeting" });
        return null;
      }

      if (!(await MeetingService.isUserInMeeting(roomId, email))) {
        socket.emit("error", {
          message: "User not have access for the meeting",
        });
        return null;
      }

      const joinResult = await MeetingService.joinMeeting(
        roomId,
        email,
        socket.id
      );

      if (!joinResult.success) {
        socket.emit("error", {
          message: joinResult.message || "Failed to join meeting",
        });
        return null;
      }

      // Join socket room first
      socket.join(roomId);

      // Get all participants in the room
      const participants = await MeetingService.getMeetingParticipants(roomId);

      const meetingParticipants = participants.map((participant) => ({
        user: participant,
        socketId: MeetingService.getSocketId(participant.email),
      }));
      // Send list of all participants to the new user
      io.to(socket.id).emit("room-joined", {
        user: meetingParticipants.find(
          (participant) => email === participant.user.email
        ),
        roomId,
        participants: meetingParticipants.find(
          (participant) => email !== participant.user.email
        ),
      });

      // Notify others about the new user
      try {
        socket.to(roomId).emit("user-joined", {
          user: meetingParticipants.find(
            (participant) => email === participant.user.email
          ),
          socketId: socket.id,
        });
      } catch (error) {
        socket.emit("error", {
          message: `Error emitting user-joined event:, ${error}`,
        });

        console.error("Error emitting user-joined event:", error);
      }
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("call-user", ({ to, offer }) => {
    const toUser = MeetingService.getEmail(to);
    if (toUser) {
      console.log(`User ${socket.id} calling user ${toUser}`);
      io.to(to).emit("call-incoming", { from: socket.id, offer });
    }
  });

  socket.on("call-accepted", ({ to, answer }) => {
    console.log(`User ${socket.id} accepted call from ${to}`);
    const toUser = MeetingService.getEmail(to);
    if (toUser) {
      io.to(to).emit("call-accepted", { from: socket.id, answer });
    }
  });

  socket.on("peer-negotiation-needed", ({ to, offer }) => {
    console.log(`User ${socket.id} sending peer negotiation needed to ${to}`);
    const toUser = MeetingService.getEmail(to);
    if (toUser) {
      io.to(to).emit("peer-negotiation-needed", {
        from: socket.id,
        offer,
      });
    }
  });

  socket.on("peer-negotiation-needed-done", ({ to, answer }) => {
    console.log(
      `User ${socket.id} sending peer negotiation needed done to ${to}`
    );
    const toUser = MeetingService.getEmail(to);
    if (toUser) {
      io.to(to).emit("peer-negotiation-needed-final", {
        from: socket.id,
        answer,
      });
    }
  });

  socket.on("user-disconnect", async ({ roomId }) => {
    console.log(`User ${socket.id} left`);
    const email = MeetingService.getEmail(socket.id);
    console.log(email);
    if (email) {
      try {
        const user = { email }; // Create minimal user object
        if (await MeetingService.isUserInMeeting(roomId, user)) {
          await MeetingService.leaveMeeting(roomId, user);
          socket.to(roomId).emit("user-left", { user });
          console.log("user left", email);
        }
      } catch (error) {
        console.error("Error in disconnect:", error);
      }
    }
  });
};

module.exports = meeting;
