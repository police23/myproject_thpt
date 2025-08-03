import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewBlog.css';

function ViewBlog() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/blogs/${id}`);
                if (response.data && response.data.blog) {
                    setBlog(response.data.blog);
                } else {
                    setBlog(null);
                }
            } catch (error) {
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="viewblog-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải bài viết...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="viewblog-notfound">
                <h2>Không tìm thấy bài viết</h2>
                <button onClick={() => navigate('/student/blogs')} className="btn-back">Quay lại</button>
            </div>
        );
    }

    const imageUrl = blog.image ? (blog.image.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${blog.image}` : blog.image) : '';

    return (
        <div className="viewblog-container">
            <div className="viewblog-header">
                <button className="btn-back" onClick={() => navigate('/student/blogs')}>&larr; Quay lại</button>
            </div>
            <div className="viewblog-main">
                {imageUrl && (
                    <div className="viewblog-image">
                        <img src={imageUrl} alt="Blog" />
                    </div>
                )}
                <div className="viewblog-info">
                    <div className="viewblog-topic">{blog.topic ? blog.topic.toUpperCase() : 'BLOG'}</div>
                    <h1 className="viewblog-title">{blog.title}</h1>
                    <div className="viewblog-date">{new Date(blog.created_at).toLocaleDateString('vi-VN')}</div>
                    <div className="viewblog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
            </div>
        </div>
    );
}

export default ViewBlog;
