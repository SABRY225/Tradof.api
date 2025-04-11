const express = require('express');
const { paymentService } = require('../services/paymentServices');
const router = express.Router();

// Webhook to handle payment results from Paymob
router.post('/callback',paymentService.callBack);
router.post("/subscription",paymentService.joinSubscription);
router.post("/pay-project",paymentService.payProject);
router.post("/finish-project",paymentService.payProject);
module.exports = router;
