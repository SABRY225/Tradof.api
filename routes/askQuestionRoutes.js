const express = require("express");
const router = express.Router();
const { askedQuestionsService } = require("../services/askedQuestionsService");

router.post("/", askedQuestionsService.createQuestion);
router.delete("/:questionId", askedQuestionsService.deleteQuestion);
router.get("/search", askedQuestionsService.searchQuestion);
router.patch("/:id", askedQuestionsService.answerQuestion);
router.patch("/:id/update-answer", askedQuestionsService.updateAnswer);
router.get("/unanswered", askedQuestionsService.getUnansweredQuestions);

module.exports = router;
