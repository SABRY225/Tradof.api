const express = require('express');
const { paymentService } = require('../services/financialServices');
const router = express.Router();

router.get('/payment-status/:projectId', paymentService.getStatusProject);
router.get('/projects-company', paymentService.getProjectByCompany);
module.exports = router;