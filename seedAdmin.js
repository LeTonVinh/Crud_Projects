// backend/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Đường dẫn tới model User
const connectDB = require('./config/db'); // Sử dụng hàm kết nối đã tạo

dotenv.config(); // Load các biến từ file .env

// Lấy thông tin admin từ biến môi trường
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminUsername || !adminPassword) {
  console.error('Lỗi: Vui lòng đặt ADMIN_USERNAME và ADMIN_PASSWORD trong file .env');
  process.exit(1); // Thoát nếu thiếu thông tin
}

const seedAdminUser = async () => {
  // Kết nối tới cơ sở dữ liệu
  await connectDB();

  try {
    // 1. Kiểm tra xem admin user với username này đã tồn tại chưa
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log(`Tài khoản Admin với username '${adminUsername}' đã tồn tại.`);
    } else {
      // 2. Nếu chưa tồn tại, tạo admin user mới
      // Mongoose 'pre save' hook trong User model sẽ tự động hash mật khẩu
      const adminUser = new User({
        username: adminUsername,
        password: adminPassword,
        // Bạn có thể thêm các trường khác ở đây nếu model User có, ví dụ:
        name: 'Administrator',
        
      });

      await adminUser.save(); // Lưu vào DB

      console.log(`Tài khoản Admin '${adminUsername}' đã được tạo thành công!`);
      console.log('Bạn có thể dùng tài khoản này để đăng nhập qua /api/auth/login.');
    }
  } catch (error) {
    console.error('Lỗi xảy ra trong quá trình tạo tài khoản Admin:', error);
  } finally {
    // 3. Luôn ngắt kết nối DB sau khi hoàn thành hoặc gặp lỗi
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB.');
    process.exit(); // Thoát script
  }
};

// Chạy hàm để tạo admin
seedAdminUser();