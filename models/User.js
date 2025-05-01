// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập username'],
    unique: true, // Username phải là duy nhất
    trim: true // Bỏ khoảng trắng thừa
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'] // Nên có yêu cầu độ dài tối thiểu
  },
  // Bạn có thể thêm các trường khác nếu muốn (ví dụ: name, email, ...)
  name: {
     type: String,
     trim: true
  }
}, {
  timestamps: true // Tự động thêm trường createdAt và updatedAt
});

// Middleware (hook) của Mongoose: Tự động hash mật khẩu TRƯỚC KHI lưu user
userSchema.pre('save', async function (next) {
  // Chỉ hash mật khẩu nếu nó được thay đổi (hoặc là user mới)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10); // Tạo salt
    this.password = await bcrypt.hash(this.password, salt); // Hash mật khẩu với salt
    next();
  } catch (error) {
    next(error); // Báo lỗi nếu có vấn đề khi hash
  }
});

// Thêm một phương thức vào schema để so sánh mật khẩu nhập vào với mật khẩu đã hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;