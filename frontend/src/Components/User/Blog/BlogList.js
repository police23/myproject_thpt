import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlogList.css';
import { useNavigate } from 'react-router-dom';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/blogs');
                if (response.data && response.data.blogs) {
                    setBlogs(response.data.blogs);
                } else {
                    setBlogs([]);
                }
            } catch (error) {
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter(blog => {
        return (
            (searchText === '' || blog.title.toLowerCase().includes(searchText.toLowerCase()))
        );
    });

    // ...existing code...

    const handleViewBlog = (blogId) => {
        navigate(`/blog/${blogId}`);
    };

    return (
        <div className="blogs-tab">
            <h2 className="content-title">Bài viết nổi bật</h2>
            <div className="blogs-controls">
                <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm blog..." 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <button>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải blog...</p>
                </div>
            )}

            {!loading && filteredBlogs.length === 0 && (
                <div className="no-blogs">
                    <i className="fas fa-search"></i>
                    <h3>Không tìm thấy blog</h3>
                    <p>Vui lòng thử lại với từ khóa khác.</p>
                </div>
            )}

            {!loading && (
                <div className="blogs-list-container">
                    {filteredBlogs.map(blog => (
                        <div className="blog-card" key={blog._id}>
                            <div className="blog-image">
                                {blog.image ? (
                                    <img src={blog.image.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${blog.image}` : blog.image} alt="Blog" />
                                ) : (
                                    <span className="no-image">Không có ảnh</span>
                                )}
                            </div>
                            <div className="blog-info">
                                <div className="blog-topic">{blog.topic ? blog.topic.toUpperCase() : 'BLOG'}</div>
                                <div className="blog-title" style={{cursor: 'pointer', color: '#2563eb'}} onClick={() => handleViewBlog(blog._id)}>{blog.title}</div>
                                <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content ? blog.content.slice(0, 120) + (blog.content.length > 120 ? '...' : '') : '' }} />
                                <div className="blog-meta">
                                    <span className="blog-date">{new Date(blog.created_at).toLocaleDateString('vi-VN')}</span>
                                    {/* Nếu muốn thêm tác giả, có thể thêm ở đây */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BlogList;
