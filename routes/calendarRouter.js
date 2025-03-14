const express = require("express");
const { calenderService } = require("../services/calendarService");
const router = express.Router();

router.post('/', calenderService.createCalender);
router.get("/events/:calendarId",calenderService.fetchAllEventes );
router.post('/:calendarId/event',calenderService.addEvent );
router.delete('/event/:eventId', calenderService.deleteEvent);
router.put('/event/:eventId', calenderService.editEvent);

module.exports = router;
