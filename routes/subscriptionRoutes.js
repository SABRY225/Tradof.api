const express = require("express");
const { subscriptionService } = require("../services/subscriptionService");
const router = express.Router();

router.post("/",subscriptionService.joinSubscription);
router.get("/all-subscriptions",subscriptionService.getSubscriptionByCompany);
router.get("/income-statistics",subscriptionService.getIncomeStatistics);
router.get("/current-subscription/:companyId",subscriptionService.getSubscription);
router.get("/remaining-time/:companyId",subscriptionService.getRemainingTime);

module.exports = router;