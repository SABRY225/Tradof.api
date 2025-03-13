const express = require("express");
const router = express.Router();
const { askedQuestionsService } = require("../services/askedQuestionsService");

router.post("/", askedQuestionsService.createQuestion);
router.delete("/:questionId", askedQuestionsService.deleteQuestion);
router.get("/search", askedQuestionsService.searchQuestion);
router.put("/:id/answer", askedQuestionsService.answerQuestion);
router.get("/unanswered", askedQuestionsService.getUnansweredQuestions);

module.exports = router;
