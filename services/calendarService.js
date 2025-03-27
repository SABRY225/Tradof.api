const Event = require("../model/eventModel");
const Calendar = require("../model/calenderModel");
const { default: mongoose } = require("mongoose");
const { getTokenFromDotNet } = require("../helpers/getToken");
const { getUserCalendarId } = require("../helpers/getCalenderId");
const { log } = require("@grpc/grpc-js/build/src/logging");

const calenderService = {
    createCalender: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const existingCalendar = await Calendar.findOne({ user });
            if (existingCalendar) {
                return res.status(409).json({ success: false, message: 'Calendar already exists for this user!' });
            }
    
            const calendar = new Calendar({ user });
            await calendar.save();
    
            res.status(201).json({ success: true, message: 'Calendar created successfully', calendar });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    fetchAllEvents: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const calendarId = await getUserCalendarId(user);
            if (!calendarId) {
                return res.status(404).json({ success: false, message: "User's calendar not found!" });
            }
    
            if (!mongoose.Types.ObjectId.isValid(calendarId)) {
                return res.status(400).json({ success: false, message: "Invalid calendar ID" });
            }
    
            const { day, month, year } = req.query;
            if (!day || !month || !year) {
                return res.status(400).json({ success: false, message: 'Day, month, and year are required' });
            }
    
            const startOfDay = new Date(year, month - 1, day);
            startOfDay.setHours(0, 0, 0, 0);
    
            const endOfDay = new Date(year, month - 1, day);
            endOfDay.setHours(23, 59, 59, 999);
    
            const events = await Event.find({
                calendarId: calendarId,
                startDate: { $gte: startOfDay, $lte: endOfDay },
            });
    
            if (events.length === 0) {
                return res.status(200).json({ success: true, message: "No events found for this date", data: [] });
            }
    
            res.status(200).json({ success: true, data: events });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteEvent:async (req, res) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is missing!' });
        }

        const user = await getTokenFromDotNet(token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
        }

        const { eventId } = req.params;
        
        try {
            const event = await Event.findByIdAndDelete(eventId);
            if (!event) {
                return res.status(404).json({success: false, message: 'Event not found' });
            }
            res.json({success: true, message: 'Event deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message:error.message });
        }
    },
    addEvent: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const calendarId = await getUserCalendarId(user);
            
            const { title, description, startDate, endDate } = req.body;
    
            if (!mongoose.Types.ObjectId.isValid(calendarId)) {
                return res.status(400).json({ success: false, message: "Invalid calendar ID" });
            }
            const calendar = await Calendar.findById(calendarId);
            if (!calendar) {
                return res.status(404).json({ success: false, message: "Calendar not found" });
            }
    
            if (!title || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: "Title, startDate, and endDate are required" });
            }
    
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid startDate or endDate format" });
            }
    
            if (start >= end) {
                return res.status(400).json({ success: false, message: "start date must be before end date" });
            }
            const overlappingEvent = await Event.findOne({
                calendarId,
                $or: [
                    { startDate: { $lt: end }, endDate: { $gt: start } } 
                ]
            });
    
            if (overlappingEvent) {
                return res.status(400).json({
                    success: false,
                    message: "There is already an event at this time."
                });
            }

    
            // ✅ إنشاء الحدث
            const event = new Event({
                calendarId,
                title,
                description,
                startDate,
                endDate
            });
    
            await event.save();
    
            res.status(201).json({ success: true, message: 'Event created successfully', event });
    
        } catch (error) {
            console.error("Error creating event:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    },    
    editEvent: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const { eventId } = req.params;
            const { title, description, startDate, endDate } = req.body;
    
            if (!title || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: "Title, startDate, and endDate are required" });
            }
    
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid startDate or endDate format" });
            }
    
            if (start >= end) {
                return res.status(400).json({ success: false, message: "Start date must be before end date" });
            }
    
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ success: false, message: "Event not found" });
            }
    
            const overlappingEvent = await Event.findOne({
                calendarId: existingEvent.calendarId,
                _id: { $ne: eventId }, // استبعاد الحدث الحالي من البحث
                $or: [
                    { startDate: { $lt: end }, endDate: { $gt: start } } // التحقق من التداخل
                ]
            });
    
            if (overlappingEvent) {
                return res.status(400).json({
                    success: false,
                    message: "There is already an event at this time."
                });
            }
    
            existingEvent.title = title;
            existingEvent.description = description;
            existingEvent.startDate = startDate;
            existingEvent.endDate = endDate;
    
            await existingEvent.save();
    
            res.json({ success: true, message: "Event updated successfully", event: existingEvent });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }    
};

module.exports = { calenderService };
