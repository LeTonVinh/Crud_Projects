// middleware/errorHandler.js
const dotenv = require('dotenv');
dotenv.config(); // Load biến môi trường (cần NODE_ENV)

/**
 * Middleware xử lý các request đến route không được định nghĩa (404 Not Found)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404); // Set status 404
  next(error); // Chuyển lỗi này đến errorHandler tiếp theo
};


/**
 * Middleware xử lý lỗi tập trung
 * Phải có 4 tham số (err, req, res, next) để Express nhận diện
 */
const errorHandler = (err, req, res, next) => {
  // Lấy statusCode từ response nếu đã được set trước đó, hoặc từ lỗi, mặc định là 500
  let statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;
  let message = err.message || 'Lỗi Server Nội bộ';

  // === Xử lý các loại lỗi cụ thể ===

  // Lỗi Mongoose CastError (sai định dạng ObjectId) -> Chuyển thành 404 Not Found
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Không tìm thấy tài nguyên`; // Thông báo chung chung hơn
  }

  // Lỗi Mongoose ValidationError -> 400 Bad Request
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(el => el.message);
    message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
  }

  // Lỗi Mongoose Duplicate Key (code 11000) -> 400 Bad Request
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Giá trị '<span class="math-inline">\{err\.keyValue\[field\]\}' của trường '</span>{field}' đã tồn tại.`;
  }

  // === Phân biệt môi trường ===
  // Trong môi trường production, ẩn chi tiết lỗi 500 và stack trace
  let responseBody = {
    message: message,
  };

  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack; // Chỉ thêm stack trace khi ở development
  } else if (statusCode === 500) {
     // Với lỗi 500 ở production, dùng thông báo chung chung hơn
     responseBody.message = 'Server đang gặp sự cố. Vui lòng thử lại sau.';
  }


  // Gửi response lỗi về client
  res.status(statusCode).json(responseBody);
};

module.exports = { errorHandler, notFound };