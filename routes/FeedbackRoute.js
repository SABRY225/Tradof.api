const express = require('express');
const { feedbackService } = require('../services/feedbackService');
const router = express.Router();

router.get('/', feedbackService.getFeedbacks);
router.post('/', feedbackService.sendFeedback);
router.delete('/:feedbackId', feedbackService.deleteFeedback);
module.exports = router;