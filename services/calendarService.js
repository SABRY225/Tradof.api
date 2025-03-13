const Event = require("../model/eventModel");
const Calendar = require("../model/calenderModel");

const calenderService = {
    createCalender: async (req, res) => {
        const { userId } = req.body;
        
        const calendar = new Calendar({ userId });
        
        try {
            await calendar.save();
            res.status(201).json({ message: 'Calendar created successfully', calendar });
        } catch (error) {
            res.status(400).json({ message: 'Error creating calendar', error });
        }
    },
    fetchAllEventes:async (req, res) => {
        const { date } = req.query; 
        
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); 
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); 
        
        try {
            const events = await Event.find({
                startDate: { $gte: startOfDay, $lte: endOfDay },
            });
            
            res.json({ events });
        } catch (error) {
            res.status(400).json({ message: 'Error fetching events', error });
        }
    },
    addEvent:async (req, res) => {
        const { calendarId } = req.params;
        // const { title, description, startDate, endDate, people } = req.body;
        
        // تأكد من أن startDate و endDate هما تواريخ صحيحة
        const event = new Event({
            calendarId,
            ...req.body
        });
        
        try {
            await event.save();
            res.status(201).json({ message: 'Event created successfully', event });
        } catch (error) {
            res.status(400).json({ message: 'Error creating event', error });
        }
    },
    deleteEvent:async (req, res) => {
        const { eventId } = req.params;
        
        try {
            const event = await Event.findByIdAndDelete(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: 'Error deleting event', error });
        }
    },
    editEvent:async (req, res) => {
        const { eventId } = req.params;
        const { title, description, startTime, endTime, people } = req.body;
        
        try {
            const event = await Event.findByIdAndUpdate(
                eventId, 
                { title, description, startTime, endTime, people }, 
                { new: true } // لرجوع الكائن المحدث
            );
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json({ message: 'Event updated successfully', event });
        } catch (error) {
            res.status(400).json({ message: 'Error updating event', error });
        }
    },


};

module.exports = { calenderService };
