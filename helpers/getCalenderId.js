const Calendar = require("../model/calenderModel");


async function getUserCalendarId(user) {
    try {
        const calendar = await Calendar.findOne({ "user.id": user.id });
        if (!calendar) {
            return  "No calendar found for this user!" ;
        }
        return calendar._id ;
    } catch (error) {
        console.error("Error getting calendar ID:", error);
    }
}

module.exports = { getUserCalendarId };
