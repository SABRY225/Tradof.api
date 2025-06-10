const Event = require("../models/eventModel");
const Calendar = require("../models/calenderModel");
const { default: mongoose } = require("mongoose");
const { getTokenFromDotNet } = require("../helpers/getToken");
const { getUserCalendarId } = require("../helpers/getCalenderId");
const { log } = require("@grpc/grpc-js/build/src/logging");
const { v4: uuidv4 } = require("uuid");
const meetingService = require("../services/meetingService");
const { sendMeetingInvitation } = require("../helpers/sendEmail");

const calenderService = {
  createCalender: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const existingCalendar = await Calendar.findOne({ user });
      if (existingCalendar) {
        return res.status(409).json({
          success: false,
          message: "Calendar already exists for this user!",
        });
      }

      const calendar = new Calendar({ user });
      await calendar.save();

      res.status(201).json({
        success: true,
        message: "Calendar created successfully",
        calendar,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  fetchAllEvents: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const calendarId = await getUserCalendarId(user);
      if (!calendarId) {
        return res
          .status(404)
          .json({ success: false, message: "User's calendar not found!" });
      }

      if (!mongoose.Types.ObjectId.isValid(calendarId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid calendar ID" });
      }

      const { day, month, year } = req.query;
      let filter = { calendarId };

      if (year && month && day) {
        // Exact day
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        filter.startDate = { $gte: startDate, $lte: endDate };
      } else if (year && month) {
        // Whole month
        const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        filter.startDate = { $gte: startDate, $lte: endDate };
      } else if (year) {
        // Whole year
        const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        filter.startDate = { $gte: startDate, $lte: endDate };
      }
      // else: no date filter — return all events for the user's calendar
      const events = await Event.find(filter).populate({
        path: "meeting",
        populate: {
          path: "participants",
        },
      });

      if (events.length === 0) {
        return res
          .status(200)
          .json({ success: true, message: "No events found", data: [] });
      }
      // console.log(events);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteEvent: async (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is missing!" });
    }

    const user = await getTokenFromDotNet(token);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token or user not found!" });
    }

    const { eventId } = req.params;

    try {
      const event = await Event.findByIdAndDelete(eventId);
      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }
      res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  addEvent: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const calendarId = await getUserCalendarId(user);
      console.log(req.body);
      const {
        title,
        description,
        startDate,
        endDate,
        people,
        isMeeting,
        participation,
      } = req.body;
      // console.log(req.body);
      if (!mongoose.Types.ObjectId.isValid(calendarId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid calendar ID" });
      }
      const calendar = await Calendar.findById(calendarId);
      if (!calendar) {
        return res
          .status(404)
          .json({ success: false, message: "Calendar not found" });
      }

      if (!title || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Title, startDate, and endDate are required",
        });
      }

      if (isMeeting && !people) {
        return res.status(400).json({
          success: false,
          message: "Meeting must have participating",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate or endDate format",
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "start date must be before end date",
        });
      }

      const overlappingEvent = await Event.findOne({
        calendarId,
        $expr: {
          $and: [
            {
              $eq: [
                { $dayOfYear: "$startDate" },
                { $dayOfYear: new Date(start) },
              ],
            },
            { $eq: [{ $year: "$startDate" }, { $year: new Date(start) }] },
            { $lt: ["$startDate", new Date(end)] },
            { $gt: ["$endDate", new Date(start)] },
          ],
        },
      });

      if (overlappingEvent) {
        return res.status(400).json({
          success: false,
          message: "There is already an event at this time.",
        });
      }
      console.log(participation, user);
      // ✅ إنشاء الحدث
      const event = {
        calendarId,
        title,
        description,
        startDate,
        endDate,
        isMeeting,
        meeting: undefined,
      };

      let meetingId = null;
      if (isMeeting) {
        meetingId = uuidv4(); // Generate unique meeting ID
        const meeting = await meetingService.createMeeting(
          meetingId,
          user,
          participation
        );
        if (meeting) {
          event.meeting = meeting._id;

          try {
            // Send invitation to participant
            await sendMeetingInvitation({
              to: participation.email,
              title,
              description,
              startDate,
              endDate,
              meetingId,
            });
          } catch (emailError) {
            console.error("Error sending meeting invitations:", emailError);
            // Continue with event creation even if email sending fails
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "Can't create meeting, try in another time",
          });
        }
      }
      // console.log(event);

      const createdEvent = await Event.create(event);

      // Populate the meeting data
      const populatedEvent = await Event.findById(createdEvent._id).populate(
        "meeting"
      );

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event: {
          ...populatedEvent.toObject(),
          participation: await meetingService.getMeetingParticipants(meetingId),
          meetingId,
        },
      });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  editEvent: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is missing!" });
      }

      const user = await getTokenFromDotNet(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found!",
        });
      }

      const { eventId } = req.params;
      const { title, description, startDate, endDate } = req.body;

      if (!title || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Title, startDate, and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate or endDate format",
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date",
        });
      }

      const existingEvent = await Event.findById(eventId);
      if (!existingEvent) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      const overlappingEvent = await Event.findOne({
        calendarId: existingEvent.calendarId,
        _id: { $ne: eventId }, // استبعاد الحدث الحالي من البحث
        $or: [
          { startDate: { $lt: end }, endDate: { $gt: start } }, // التحقق من التداخل
        ],
      });

      if (overlappingEvent) {
        return res.status(400).json({
          success: false,
          message: "There is already an event at this time.",
        });
      }

      existingEvent.title = title;
      existingEvent.description = description;
      existingEvent.startDate = startDate;
      existingEvent.endDate = endDate;

      await existingEvent.save();

      res.json({
        success: true,
        message: "Event updated successfully",
        event: existingEvent,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = { calenderService };
