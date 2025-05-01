// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Liên kết với user đã tạo dự án (chính là admin)
  // Điều này quan trọng để xác định quyền sở hữu khi cập nhật/xóa
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Tham chiếu đến User model đã tạo trước đó
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề dự án'],
    trim: true // Xóa khoảng trắng thừa ở đầu và cuối
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả dự án']
  },
  technologies: {
    type: [String], // Mảng các chuỗi, ví dụ: ['Node.js', 'Vue  .js', 'MongoDB']
    default: [] // Giá trị mặc định là mảng rỗng
  },
  link: {
    type: String, // Link đến demo hoặc source code
    trim: true
    // Có thể thêm validation kiểm tra định dạng URL nếu cần
  },
  imageUrl: {
    type: String, // Link đến ảnh minh họa cho dự án
    trim: true
    // Có thể thêm validation kiểm tra định dạng URL nếu cần
  }
}, {
  timestamps: true // Tự động thêm trường createdAt và updatedAt
});

// Tạo và export model 'Project' dựa trên schema vừa định nghĩa
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;