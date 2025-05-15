import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamsTab.css';
import ExamForm2025 from './ExamForm2025';

function ExamsTab() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);

    // Thêm state cho danh sách đề thi
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch danh sách đề thi khi component mount
    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:5000/api/tests') // Sửa lại URL này cho đúng backend
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setExams(data.tests);
                } else {
                    setError('Không lấy được danh sách đề thi');
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Lỗi kết nối server');
                setLoading(false);
            });
    }, []);

    const handleAddExam = () => {
        console.log('ExamsTab: Navigating to new exam form...');
        // Make sure this path matches the nested route in AdminDashboard
        navigate('/admin/dashboard/exams/new');
    };

    const handleEditExam = (examId) => {
        if (!examId) {
            console.error('No exam ID provided for editing');
            return;
        }

        // Log exact path for debugging
        const editPath = `/admin/dashboard/exams/edit/${examId}`;
        console.log(`ExamsTab: Attempting to navigate to: ${editPath}`);

        // Navigate with replace to force a fresh load
        navigate(editPath, { replace: true });

        // Add a fallback in case navigation fails
        setTimeout(() => {
            console.log('Checking if navigation succeeded...');
            if (window.location.pathname !== editPath) {
                console.warn('Navigation might have failed, trying alternative method');
                window.location.href = editPath;
            }
        }, 500);
    };

    const handlePreviewExam = (examId) => {
        if (!examId) {
            console.error('No exam ID provided for preview');
            return;
        }

        const previewPath = `/admin/dashboard/exams/preview/${examId}`;
        console.log(`ExamsTab: Navigating to preview exam: ${previewPath}`);
        navigate(previewPath);
    };

    return (
        <div className="exams-management">
            <h2 className="content-title">Quản lý đề thi</h2>
            <div className="section-header">
                <div className="exams-summary">
                    <div className="summary-item">
                        <span className="summary-value">{exams.length}</span>
                        <span className="summary-label">Tổng đề thi</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">-</span>
                        <span className="summary-label">Đề thi mới tháng này</span>
                    </div>
                </div>
                <button className="btn-add" onClick={handleAddExam}><i className="fas fa-plus"></i> Thêm đề thi</button>
            </div>
            <div className="exams-filter">
                <div className="search-box">
                    <input type="text" placeholder="Tìm kiếm đề thi..." />
                    <button><i className="fas fa-search"></i></button>
                </div>
                <div className="filter-options">
                    <select defaultValue="">
                        <option value="">Tất cả môn</option>
                        <option value="toan">Toán</option>
                        <option value="van">Văn</option>
                        <option value="anh">Tiếng Anh</option>
                    </select>
                    <select defaultValue="">
                        <option value="">Tất cả trạng thái</option>
                        <option value="public">Công khai</option>
                        <option value="draft">Nháp</option>
                    </select>
                </div>
            </div>
            <div className="exams-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đề thi</th>
                            <th>Môn</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>Đang tải...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="6" style={{ color: 'red', textAlign: 'center' }}>{error}</td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>Chưa có đề thi nào</td>
                            </tr>
                        ) : (
                            exams.map((exam, idx) => (
                                <tr key={exam._id}>
                                    <td>{exam._id}</td>
                                    <td>{exam.title}</td>
                                    <td>{exam.subject}</td>
                                    <td>{exam.created_at ? new Date(exam.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>
                                        <span className={`status-badge ${exam.status === 'public' ? 'active' : 'draft'}`}>
                                            {exam.status === 'public' ? 'Công khai' : 'Nháp'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-preview" onClick={() => handlePreviewExam(exam._id)} title="Xem thử đề thi">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="btn-edit" onClick={() => handleEditExam(exam._id)}><i className="fas fa-edit"></i></button>
                                        <button className="btn-delete"><i className="fas fa-trash-alt"></i></button>
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
            {showForm && (
                <ExamForm2025 onClose={() => setShowForm(false)} onSubmit={() => setShowForm(false)} />
            )}
        </div>
    );
}

export default ExamsTab;
