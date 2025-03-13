const express = require("express");
const { calenderService } = require("../services/calendarService");
const router = express.Router();


router.get("/events",calenderService.fetchAllEventes );
router.post('/', calenderService.createCalender);
router.post('/:calendarId/event',calenderService.addEvent );
router.delete('/event/:eventId', calenderService.deleteEvent);
router.put('/event/:eventId', calenderService.editEvent);

module.exports = router;
