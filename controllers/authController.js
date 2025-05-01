// controllers/authController.js
const asyncHandler = require('express-async-handler'); // <-- Import
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- HÀM ĐĂNG NHẬP (CẬP NHẬT VỚI ASYNC HANDLER) ---
const login = asyncHandler(async (req, res) => { // <-- Bao bọc hàm
  const { username, password } = req.body;

  // Kiểm tra dữ liệu đầu vào: Nếu thiếu -> set status và throw Error
  if (!username || !password) {
    res.status(400); // Đặt mã lỗi Bad Request
    throw new Error('Vui lòng cung cấp username và password'); // Ném lỗi
  }

  // Tìm người dùng bằng username trong DB
  const user = await User.findOne({ username: username });

  // Nếu không tìm thấy user hoặc mật khẩu không khớp -> set status và throw Error
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); // Đặt mã lỗi Unauthorized
    throw new Error('Username hoặc password không đúng'); // Ném lỗi
  }

  // Tạo JWT (logic này không đổi)
  const payload = { userId: user._id, username: user.username };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, secret, options);

  // Trả về token thành công
  res.status(200).json({
    message: 'Đăng nhập thành công!',
    token: token,
    user: { id: user._id, username: user.username, name: user.name }
  });

  // Không cần try...catch ở đây nữa, asyncHandler sẽ xử lý lỗi bất đồng bộ (vd: lỗi DB)
});

module.exports = { login };