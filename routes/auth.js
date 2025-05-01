// routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Route đăng nhập
// Method: POST, URL: /api/auth/login
router.post('/login', authController.login);
// <-- Đã xóa route POST /register

module.exports = router;