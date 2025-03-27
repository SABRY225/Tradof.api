const express = require("express");
const { calenderService } = require("../services/calendarService");
const router = express.Router();

router.post('/', calenderService.createCalender);
router.get("/events",calenderService.fetchAllEvents);
router.post('/event',calenderService.addEvent );
router.delete('/:eventId', calenderService.deleteEvent);
router.patch('/:eventId', calenderService.editEvent);

module.exports = router;
