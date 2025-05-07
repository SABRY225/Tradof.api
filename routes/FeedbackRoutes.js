const express = require('express');
const { feedbackService } = require('../services/feedbackService');
const router = express.Router();

router.get('/', feedbackService.getFeedbacks);
router.post('/', feedbackService.sendFeedback);
router.patch('/approve/:feedbackId', feedbackService.approveFeedback);
router.patch('/dany/:feedbackId', feedbackService.danyFeedback);
module.exports = router;