// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Dùng để bắt lỗi async
const User = require('../models/User'); // Import User model để tìm user

/**
 * Middleware để bảo vệ các route yêu cầu xác thực JWT
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Kiểm tra header 'Authorization'
  // Token thường được gửi dưới dạng 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Tách lấy phần token (bỏ 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 3. Xác thực và giải mã token bằng secret key
      // Nếu token không hợp lệ hoặc hết hạn, jwt.verify sẽ ném lỗi
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Lấy thông tin user từ Database dựa vào ID trong payload của token
      // Chúng ta tìm lại user trong DB để đảm bảo user đó vẫn tồn tại
      // và lấy thông tin mới nhất (trừ mật khẩu)
      // decoded.userId là tên trường chúng ta đã đặt khi tạo token ở authController.js
      req.user = await User.findById(decoded.userId).select('-password');

      // Kiểm tra lại nếu user không tồn tại trong DB (có thể đã bị xóa)
      if (!req.user) {
         res.status(401); // Unauthorized
         throw new Error('Người dùng không tồn tại.');
      }

      // 5. Gắn thông tin user vào đối tượng request (req.user)
      // Để các route handler phía sau có thể truy cập thông tin người dùng đã xác thực
      // Ví dụ: biết ai đang thực hiện hành động tạo bài viết.

      // 6. Cho phép request đi tiếp tới route handler kế tiếp
      next();

    } catch (error) {
      // Xử lý lỗi nếu token không hợp lệ, hết hạn, hoặc có lỗi khác
      console.error('Lỗi xác thực token:', error); // Log lỗi ra console để debug
      res.status(401); // Đặt mã lỗi Unauthorized
      if (error.name === 'TokenExpiredError') {
         throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      } else if (error.name === 'JsonWebTokenError') {
         throw new Error('Token không hợp lệ.');
      } else {
         throw new Error('Xác thực thất bại.'); // Lỗi chung
      }
    }
  }

  // Nếu không tìm thấy token trong header 'Authorization'
  if (!token) {
    res.status(401); // Đặt mã lỗi Unauthorized
    throw new Error('Không có quyền truy cập, yêu cầu đăng nhập.');
  }
});

// Export middleware để có thể sử dụng ở các file routes khác
module.exports = { protect };