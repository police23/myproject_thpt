const blog = require('../models/BlogModel');

exports.getAllBlogs = async () => {
    return await Blog.find().sort({ created_at: -1 });
};

exports.createBlog = async (data) => {
    const blog = new Blog(data);
    return await blog.save();
};

exports.deleteBlog = async (id) => {
    return await Blog.findByIdAndDelete(id);
};



