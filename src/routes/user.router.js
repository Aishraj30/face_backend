const express = require('express');
const router = express.Router();
const multer = require('multer');

const { registercontroller } = require('../controller/user.register');
const logincontroller = require('../controller/user.login');

// Use memoryStorage so req.file.buffer is available for ImageKit
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/register', upload.single('image'), registercontroller);
router.post('/login', upload.single('image'), logincontroller);

module.exports = router;
