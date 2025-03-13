const express = require('express');
const multer = require("multer");
const { chatService } = require('../services/chatService');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/:projectId', chatService.getMessages);
router.post('/:projectId',upload.single("file"), chatService.sendMessages);
module.exports = router;