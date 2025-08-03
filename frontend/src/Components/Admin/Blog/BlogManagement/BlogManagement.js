import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BlogManagement.css';

function BlogManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch danh sách blog khi component mount
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const { getBlogs } = await import('../../../../services/BlogService');
            const data = await getBlogs();
            if (data.success && Array.isArray(data.blogs)) {
                setBlogs(data.blogs);
                setError(null);
            } else {
                setBlogs([]);
                setError('Không lấy được danh sách blog');
            }
        } catch (err) {
            setBlogs([]);
            setError('Lỗi kết nối server');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleAddBlog = () => {
        navigate('/admin/blogs/new');
    };

    const handleEditBlog = (blogId) => {
        if (!blogId) return;
        const editPath = `/admin/blogs/edit/${blogId}`;
        navigate(editPath, { replace: true });
        setTimeout(() => {
            if (window.location.pathname !== editPath) {
                window.location.href = editPath;
            }
        }, 500);
    };

    const handlePreviewBlog = (blogId) => {
        if (!blogId) return;
        navigate(`/admin/blogs/preview/${blogId}`);
    };

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa blog này?')) {
            try {
                const { deleteBlog } = await import('../../../../services/BlogService');
                const data = await deleteBlog(blogId);
                if (data.success) {
                    toast.success('Xóa blog thành công', { position: "top-right", autoClose: 5000 });
                    fetchBlogs();
                } else {
                    toast.error(`Xóa blog thất bại: ${data.message || 'Lỗi không xác định'}`, { position: "top-right", autoClose: 5000 });
                }
            } catch (err) {
                toast.error('Không thể kết nối tới server', { position: "top-right", autoClose: 5000 });
            }
        }
    };

    return (
        <div className="blogs-management">
            <h2 className="content-title">Quản lý Blog</h2>
            <div className="section-header">
                <div className="blog-stats">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <i className="fas fa-blog"></i>
                        </div>
                        <div className="stat-details">
                            <h3>Tổng số blog</h3>
                            <p>{blogs.length}</p>
                        </div>
                    </div>
                </div>
                <button className="btn-add" onClick={handleAddBlog}><i className="fas fa-plus"></i> Thêm blog</button>
            </div>
            <div className="blogs-filter">
                <div className="search-box">
                    <input type="text" placeholder="Tìm kiếm blog..." />
                    <button><i className="fas fa-search"></i></button>
                </div>
                <div className="filter-options">
                    <select defaultValue="">
                        <option value="">Tất cả chủ đề</option>
                        <option value="education">Giáo dục</option>
                        <option value="news">Tin tức</option>
                        <option value="tips">Mẹo học tập</option>
                    </select>
                    <select defaultValue="">
                        <option value="">Tất cả trạng thái</option>
                        <option value="public">Công khai</option>
                        <option value="draft">Nháp</option>
                    </select>
                </div>
            </div>
            <div className="blogs-table">
                <table>
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Chủ đề</th>
                            <th>Ngày tạo</th>
                            {/* <th>Trạng thái</th> */}
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Đang tải...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="5" style={{ color: 'red', textAlign: 'center' }}>{error}</td>
                            </tr>
                        ) : blogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có blog nào</td>
                            </tr>
                        ) : (
                            blogs.map((blog) => (
                                <tr key={blog._id}>
                                    <td>
                                        {blog.image ? (
                                            <img
                                                src={blog.image.startsWith('http') ? blog.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${blog.image}`}
                                                alt="Blog"
                                                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', background: '#f3f3f3' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#bbb', fontSize: '13px' }}>Không có ảnh</span>
                                        )}
                                    </td>
                                    <td>{blog.title}</td>
                                    <td>{blog.topic}</td>
                                    <td>{blog.created_at ? new Date(blog.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                    {/* Bỏ cột trạng thái */}
                                    <td className="actions">
                                        <button className="btn-edit" onClick={() => handleEditBlog(blog._id)}><i className="fas fa-edit"></i></button>
                                        <button className="btn-delete" onClick={() => handleDeleteBlog(blog._id)}><i className="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                <div className="rows-per-page">
                    <span>Hiển thị:</span>
                    <select defaultValue="10">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    <span>/ trang</span>
                </div>
                <div className="pagination">
                    <button className="page-btn"><i className="fas fa-chevron-left"></i></button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    );
}

export default BlogManagement;
