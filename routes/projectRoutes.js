const express = require('express');
const router = express.Router();
const {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware'); // <-- Import middleware

// Route lấy tất cả dự án (công khai, không cần đăng nhập)
router.route('/').get(getAllProjects);

// Route lấy chi tiết một dự án (công khai, không cần đăng nhập)
router.route('/:id').get(getProjectById);

// Route tạo dự án mới (YÊU CẦU ĐĂNG NHẬP)
// Middleware 'protect' sẽ chạy trước 'createProject'
router.route('/').post(protect, createProject);

// Route cập nhật và xóa dự án (YÊU CẦU ĐĂNG NHẬP)
// Middleware 'protect' sẽ chạy trước 'updateProject' và 'deleteProject'
router.route('/:id')
  .put(protect, updateProject)    // Cập nhật dự án
  .delete(protect, deleteProject); // Xóa dự án

module.exports = router;
    