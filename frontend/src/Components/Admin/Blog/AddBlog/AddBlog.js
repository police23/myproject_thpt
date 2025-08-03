import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { addBlog, updateBlog, getBlogById } from '../../../../services/BlogService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AddBlog.css';

function AddBlog() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        title: '',
        topic: '',
        content: '',
        image: null,
        imageUrl: '' // dùng cho preview khi chỉnh sửa
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý thay đổi nội dung rich text CKEditor
    const handleContentChange = (event, editor) => {
        const data = editor.getData();
        setForm((prev) => ({ ...prev, content: data }));
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            getBlogById(id).then(res => {
                if (res.success && res.blog) {
                    setForm({
                        title: res.blog.title || '',
                        topic: res.blog.topic || '',
                        content: res.blog.content || '',
                        image: null,
                        imageUrl: res.blog.image || ''
                    });
                } else {
                    setError('Không tìm thấy blog để chỉnh sửa');
                }
                setLoading(false);
            });
        }
    }, [id]);
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setForm((prev) => ({ ...prev, image: file, imageUrl: file ? URL.createObjectURL(file) : '' }));
    };

    const handleRemoveImage = () => {
        setForm((prev) => ({ ...prev, image: null, imageUrl: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let res;
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('topic', form.topic);
            formData.append('content', form.content);
            if (form.image) {
                formData.append('image', form.image);
            }
            if (id) {
                res = await updateBlog(id, formData);
            } else {
                res = await addBlog(formData);
            }
            if (res.success) {
                toast.success(id ? 'Cập nhật blog thành công!' : 'Thêm blog thành công!', { position: 'top-right', autoClose: 3000 });
                navigate('/admin/blogs');
            } else {
                setError(res.message || (id ? 'Lỗi khi cập nhật blog.' : 'Lỗi khi thêm blog.'));
            }
        } catch (err) {
            setError(id ? 'Lỗi khi cập nhật blog.' : 'Lỗi khi thêm blog.');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        navigate('/admin/blogs', { replace: true });
    };

    return (
        <div className="exam2025-form-modal">
            <div className="exam2025-form-container">
                <div className="exam2025-form-header">
                    <h2>{id ? 'Chỉnh sửa Blog' : 'Thêm Blog Mới'}</h2>
                </div>
                <form className="exam2025-form-body" onSubmit={handleSubmit}>
                    <div className="form-left">
                        <div className="form-left-title">
                            <h3>Thông tin blog</h3>
                        </div>
                        <div className="form-group">
                            <label htmlFor="title">Tiêu đề</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Nhập tiêu đề blog"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="topic">Chủ đề</label>
                            <select
                                id="topic"
                                name="topic"
                                value={form.topic}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn chủ đề</option>

                                <option value="news">Tin tức</option>
                                <option value="tips">Mẹo học tập</option>
                            </select>
                        </div>
                        {/* Bỏ phần trạng thái */}
                        <div className="form-group">
                            <label htmlFor="content">Nội dung</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={form.content}
                                onChange={handleContentChange}
                                config={{
                                    toolbar: [
                                        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo', 'fontColor', 'fontBackgroundColor'
                                    ]
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ảnh blog</label>
                            <div className="upload-image-container">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="blog-image-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                {!(form.imageUrl || form.image) && (
                                    <label htmlFor="blog-image-upload" className="upload-image-btn">
                                        <i className="fas fa-upload"></i> Chọn ảnh
                                    </label>
                                )}
                                {(form.imageUrl || form.image) && (
                                    <div className="image-preview-wrapper">
                                        <img
                                            src={
                                                form.image
                                                    ? URL.createObjectURL(form.image)
                                                    : form.imageUrl
                                                        ? (form.imageUrl.startsWith('http')
                                                            ? form.imageUrl
                                                            : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${form.imageUrl}`)
                                                        : ''
                                            }
                                            alt="Blog Preview"
                                            className="question-image-preview"
                                        />
                                        <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Đã bỏ phần upload ảnh */}
                        {error && <div className="error-message">{error}</div>}
                        {loading && <div className="exam2025-loading">Đang xử lý...</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-confirm" disabled={loading}>
                            {id ? 'Chỉnh sửa' : 'Thêm blog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBlog;
