import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function getBlogs() {
    try {
        const res = await axios.get(`${API_URL}/api/blogs`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server', blogs: [] };
    }
}

export async function addBlog(blogData) {
    try {
        const res = await axios.post(`${API_URL}/api/blogs`, blogData);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function deleteBlog(blogId) {
    try {
        const res = await axios.delete(`${API_URL}/api/blogs/${blogId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function updateBlog(blogId, blogData) {
    try {
        const res = await axios.put(`${API_URL}/api/blogs/${blogId}`, blogData);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function getBlogById(blogId) {
    try {
        const res = await axios.get(`${API_URL}/api/blogs/${blogId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server', blog: null };
    }
}
