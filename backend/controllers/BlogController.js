const Blog = require('../models/BlogModel');
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog không tồn tại' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ created_at: -1 });
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createBlog = async (req, res) => {
    try {
        const { title, content, topic } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const blog = new Blog({ title, content, topic, image: imageUrl });
        await blog.save();
        // Gửi thông báo realtime cho tất cả user
        const { sendNotificationToAll } = require('../socket');
        sendNotificationToAll({
            title: 'Blog mới',
            content: `Blog mới "${blog.title}" đã được đăng!`
        });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { title, content, topic } = req.body;
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const updateData = { title, content, topic };
        if (imageUrl !== undefined) {
            updateData.image = imageUrl;
        }
        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog không tồn tại' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await Blog.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
