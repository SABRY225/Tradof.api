const express = require('express');
const { paymentService } = require('../services/financialServices');
const router = express.Router();

router.get('/payment-status/:projectId', paymentService.getStatusProject);
router.get('/projects-company', paymentService.getProjectByCompany);
router.get('/projects-freelancer', paymentService.getProjectByFreelancer);
router.get('/company-statistics/:companyId' ,paymentService.getStatisticsByCompany);
router.get('/freelancer-statistics/:freelancerId' ,paymentService.getStatisticsByFreelancer);
router.get('/admin-statistics' ,paymentService.getStatisticsByAdmin);
router.post('/request-withdrawProfits' ,paymentService.requestWithdrawProfits);
router.patch('/request-withdrawProfits/:requestId' ,paymentService.editStatusRequest);
router.get('/request-withdrawProfits' ,paymentService.getProfitRequests);
// Freelancer or company
router.get('/income-statistics' ,paymentService.getIncomeStatisticsCompany);
module.exports = router;