// controllers/projectController.js
const asyncHandler = require('express-async-handler'); // Xử lý lỗi async
const Project = require('../models/Project'); // Import Project model
const mongoose = require('mongoose');
/**
 * @desc    Tạo một dự án mới
 * @route   POST /api/projects
 * @access  Private (Yêu cầu đăng nhập - Admin)
 */
const createProject = asyncHandler(async (req, res) => {
  // Lấy dữ liệu từ request body
  const { title, description, technologies, link, imageUrl } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !description) {
    res.status(400); // Bad Request
    throw new Error('Tiêu đề và Mô tả dự án là bắt buộc.');
  }

  // Tạo đối tượng dự án mới
  const project = new Project({
    title,
    description,
    technologies: Array.isArray(technologies) ? technologies : [], // Đảm bảo technologies là mảng
    link,
    imageUrl,
    user: req.user._id // Lấy ID của admin từ req.user (được gắn bởi middleware 'protect')
  });

  // Lưu dự án vào database
  const createdProject = await project.save();

  // Trả về dự án vừa tạo với status 201 Created
  res.status(201).json(createdProject);
});

/**
 * @desc    Lấy tất cả các dự án
 * @route   GET /api/projects
 * @access  Public (Ai cũng xem được)
 */
const getAllProjects = asyncHandler(async (req, res) => {
  // Tìm tất cả các dự án trong DB, sắp xếp theo ngày tạo mới nhất trước
  const projects = await Project.find({}).sort({ createdAt: -1 });
  res.status(200).json(projects);
});

/**
 * @desc    Lấy thông tin chi tiết một dự án bằng ID
 * @route   GET /api/projects/:id
 * @access  Public (Ai cũng xem được)
 */
const getProjectById = asyncHandler(async (req, res) => {
  const projectId = req.params. id; // Lấy ID từ URL parameter

  // Kiểm tra xem ID có hợp lệ không (Mongoose sẽ tự throw CastError nếu sai định dạng)
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400);
      throw new Error('ID dự án không hợp lệ.');
  }

  const project = await Project.findById(projectId);

  if (project) {
    res.status(200).json(project);
  } else {
    // Nếu không tìm thấy project với ID đó
    res.status(404); // Not Found
    throw new Error('Không tìm thấy dự án.');
    // Middleware errorHandler sẽ bắt lỗi này
  }
});

/**
 * @desc    Cập nhật thông tin một dự án
 * @route   PUT /api/projects/:id
 * @access  Private (Yêu cầu đăng nhập - Admin)
 */
const updateProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { title, description, technologies, link, imageUrl } = req.body;

   // Kiểm tra xem ID có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new Error('ID dự án không hợp lệ.');
  }

  // Tìm dự án cần cập nhật
  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new Error('Không tìm thấy dự án.');
  }

  // ---- KIỂM TRA QUYỀN SỞ HỮU ----
  // Đảm bảo rằng người dùng đang thực hiện request chính là người đã tạo dự án này
  // So sánh ID user trong project với ID user từ middleware 'protect'
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden - Không có quyền
    throw new Error('Bạn không có quyền chỉnh sửa dự án này.');
  }
  // ---- KẾT THÚC KIỂM TRA ----

  // Cập nhật các trường của dự án với dữ liệu mới từ request body
  // Nếu trường nào không được gửi lên thì giữ nguyên giá trị cũ
  project.title = title || project.title;
  project.description = description || project.description;
  project.technologies = Array.isArray(technologies) ? technologies : project.technologies;
  project.link = link !== undefined ? link : project.link; // Cho phép cập nhật link rỗng
  project.imageUrl = imageUrl !== undefined ? imageUrl : project.imageUrl; // Cho phép cập nhật imageUrl rỗng

  // Lưu lại thay đổi vào database
  const updatedProject = await project.save();
  res.status(200).json(updatedProject);
});

/**
 * @desc    Xóa một dự án
 * @route   DELETE /api/projects/:id
 * @access  Private (Yêu cầu đăng nhập - Admin)
 */
const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

   // Kiểm tra xem ID có hợp lệ không
   if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new Error('ID dự án không hợp lệ.');
  }

  // Tìm dự án cần xóa
  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new Error('Không tìm thấy dự án.');
  }

  // ---- KIỂM TRA QUYỀN SỞ HỮU ----
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden
    throw new Error('Bạn không có quyền xóa dự án này.');
  }
  // ---- KẾT THÚC KIỂM TRA ----

  // Thực hiện xóa dự án
  await project.deleteOne(); // Hoặc dùng: await Project.findByIdAndDelete(projectId);

  res.status(200).json({ message: 'Dự án đã được xóa thành công.' });
});

// Export các hàm controller để sử dụng trong file routes
module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};