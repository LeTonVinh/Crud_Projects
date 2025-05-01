// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Import hàm kết nối DB
const authRoutes = require('./routes/auth'); // Import auth routes
const projectRoutes = require('./routes/projectRoutes'); // Import project routes


// Import các middleware xử lý lỗi từ file errorHandler.js
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load biến môi trường từ file .env (quan trọng cho PORT, MONGO_URI, JWT_SECRET, NODE_ENV)
dotenv.config();

// Thực hiện kết nối tới cơ sở dữ liệu MongoDB
connectDB();

// Khởi tạo ứng dụng Express
const app = express();

// --- Các Middlewares cơ bản ---
// Cho phép các request từ tên miền khác (Cross-Origin Resource Sharing)
app.use(cors());
// Parse request body dưới dạng JSON
app.use(express.json());
// Parse request body dưới dạng URL-encoded
app.use(express.urlencoded({ extended: true }));


// --- Định nghĩa các API Routes ---
// Route cơ bản để kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.send('Chào mừng đến với API trang web cá nhân!');
});

// Sử dụng các route liên quan đến xác thực (ví dụ: /api/auth/login)
app.use('/api/auth', authRoutes);

// (Bạn sẽ thêm các route cho CRUD dự án, bài viết,... ở đây sau này)
// Ví dụ:
// const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);


// --- Middlewares Xử lý Lỗi ---
// 1. Middleware xử lý route không tồn tại (404 Not Found)
//    Phải được đặt SAU tất cả các route API của bạn và TRƯỚC middleware errorHandler.
app.use(notFound);

// 2. Middleware xử lý lỗi tập trung (Error Handler)
//    Phải là middleware CUỐI CÙNG được đăng ký trong ứng dụng Express.
app.use(errorHandler);


// --- Khởi động Server ---
// Lấy PORT từ biến môi trường, nếu không có thì dùng 3000
const PORT = process.env.PORT || 3000;
// Lấy môi trường hoạt động (development hoặc production)
const environment = process.env.NODE_ENV || 'development';

// Lắng nghe kết nối trên PORT đã định nghĩa
app.listen(PORT, () => {
  console.log(`Server backend đang chạy trên port ${PORT} ở chế độ ${environment}`);
});