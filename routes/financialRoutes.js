const express = require('express');
const { financialService } = require('../services/financialServices');
const router = express.Router();

router.get('/payment-status/:projectId', financialService.getStatusProject);
router.get('/projects-company', financialService.getProjectByCompany);
router.get('/projects-freelancer', financialService.getProjectByFreelancer);
router.get('/company-statistics/:companyId' ,financialService.getStatisticsByCompany);
router.get('/freelancer-statistics/:freelancerId' ,financialService.getStatisticsByFreelancer);
router.get('/admin-statistics' ,financialService.getStatisticsByAdmin);
router.post('/request-withdrawProfits' ,financialService.requestWithdrawProfits);
router.patch('/request-withdrawProfits/:requestId' ,financialService.editStatusRequest);
router.get('/request-withdrawProfits' ,financialService.getProfitRequests);
// Freelancer or company
router.get('/income-statistics' ,financialService.getIncomeStatisticsCompany);
router.get("/invoices", financialService.getUserInvoices);

module.exports = router;