const Event = require("../model/eventModel");
const Calendar = require("../model/calenderModel");
const { default: mongoose } = require("mongoose");

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
    // fetchAllEventes: async (req, res) => {
    //     const { day, month, year } = req.query;
    //     const{calendarId}=req.params;
       
    //     console.log(calendarId);
        
    //     if (!calendarId) {
    //         return res.status(400).json({ message: 'Calendar ID is required' });
    //     }
    //     if (!day || !month || !year) {
    //         return res.status(400).json({ message: 'Day, month, and year are required' });
    //     }
    
    //     // تحويل calendarId إلى ObjectId باستخدام new
    //     let parsedCalendarId;
    //     try {
    //         parsedCalendarId = new mongoose.Types.ObjectId(calendarId);
    //     } catch (error) {
    //         return res.status(400).json({ message: 'Invalid Calendar ID format', error });
    //     }
    //     console.log(parsedCalendarId);
    
    //     // إنشاء تاريخ البداية والنهاية بناءً على اليوم، الشهر، والسنة المرسل
    //     const startOfDay = new Date(year, month - 1, day); // month - 1 لأن الشهر يبدأ من 0 في JavaScript
    //     startOfDay.setHours(0, 0, 0, 0); // ضبط الساعة عند بداية اليوم
    
    //     const endOfDay = new Date(year, month - 1, day); 
    //     endOfDay.setHours(23, 59, 59, 999); // ضبط الساعة عند نهاية اليوم
    
    // try {
    //     const events = await Event.aggregate([
    //         {
    //             $match: {
    //                 // تحويل ObjectId إلى نص ومقارنته بـ calendarId
    //                 $expr: { 
    //                     $eq: [{ $toString: "$calendarId" }, calendarId]
    //                 }
    //             },
                
    //         }
    //     ]);

    //     console.log(events);
        
        
    //     // استخراج اليوم والشهر والسنة من تواريخ الأحداث في قاعدة البيانات
    //     const filteredEvents = events.filter(event => {
    //         const eventStartDate = new Date(event.startTime); 
    //         const eventDay = eventStartDate.getDate();
    //         const eventMonth = eventStartDate.getMonth() + 1; // الشهر يبدأ من 0 في JavaScript لذا نضيف 1
    //         const eventYear = eventStartDate.getFullYear();
            
    //         console.log(eventStartDate);
    //         console.log(eventDay);
    //         console.log(eventMonth);
    //         console.log(eventYear);
    //         // مقارنة التاريخ المدخل مع تاريخ الحدث
    //         return eventDay == day && eventMonth == month && eventYear == year;
    //     });
    
    //         res.json({ filteredEvents });
    //     } catch (error) {
    //         res.status(400).json({ message: 'Error fetching events', error });
    //     }
    // },
    fetchAllEventes: async (req, res) => {
        const { day, month, year } = req.query;
        const{calendarId}=req.params;
        // تحقق من وجود calendarId ووجود اليوم، الشهر، والسنة
        if (!calendarId) {
            return res.status(400).json({ message: 'Calendar ID is required' });
        }
        if (!day || !month || !year) {
            return res.status(400).json({ message: 'Day, month, and year are required' });
        }
    
        // تحويل calendarId إلى ObjectId باستخدام new
        let parsedCalendarId;
        try {
            parsedCalendarId = new mongoose.Types.ObjectId(calendarId);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid Calendar ID format', error });
        }
    
        // إنشاء تاريخ البداية والنهاية بناءً على اليوم، الشهر، والسنة المرسل
        const startOfDay = new Date(year, month - 1, day); // month - 1 لأن الشهر يبدأ من 0 في JavaScript
        startOfDay.setHours(0, 0, 0, 0); // ضبط الساعة عند بداية اليوم
    
        const endOfDay = new Date(year, month - 1, day); 
        endOfDay.setHours(23, 59, 59, 999); // ضبط الساعة عند نهاية اليوم
    
        try {
            const events = await Event.find({
                calendarId: parsedCalendarId, // تحديد الـ calendarId
                startTime: { $gte: startOfDay, $lte: endOfDay }, // مقارنة فقط مع التاريخ
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
