const express = require('express');
const multer = require('multer');
const { technicalSupportService } = require('../services/technicalSupport');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/:userId', technicalSupportService.getMessages);
router.post('/',upload.single("file"), technicalSupportService.sendMessage);

module.exports = router;