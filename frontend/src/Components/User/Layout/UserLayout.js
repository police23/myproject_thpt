import React, { useState } from 'react';
import './UserLayout.css';
import TestsTab from '../Test/TestsTab';

function UserLayout({ onLogout }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        onLogout();
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // In a real app, you might want to use React Router navigation here
    };

    return (
        <div className={`user-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className="user-sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <i className="fas fa-graduation-cap"></i>
                        <h2>Học Sinh THPT</h2>
                    </div>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>
                
                <div className="sidebar-profile">
                    <div className="profile-avatar">
                        <img src="https://via.placeholder.com/50" alt="User Avatar" />
                    </div>
                    <div className="profile-info">
                        <h3>Học sinh</h3>
                        <p>Lớp 12</p>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => handleTabClick('dashboard')}>
                            <i className="fas fa-home"></i> <span>Trang chủ</span>
                        </li>
                        <li className={activeTab === 'exams' ? 'active' : ''} onClick={() => handleTabClick('exams')}>
                            <i className="fas fa-file-alt"></i> <span>Đề thi</span>
                        </li>
                        <li className={activeTab === 'results' ? 'active' : ''} onClick={() => handleTabClick('results')}>
                            <i className="fas fa-chart-line"></i> <span>Kết quả học tập</span>
                        </li>
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleTabClick('profile')}>
                            <i className="fas fa-user"></i> <span>Hồ sơ cá nhân</span>
                        </li>
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogoutClick}>
                        <i className="fas fa-sign-out-alt"></i> <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="user-main-content">
                <header className="user-header">
                    <div className="header-left">
                        <h2 className="welcome-message">
                            Chào mừng bạn trở lại!
                        </h2>
                        <p className="date-display">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="header-right">
                        <button className="notifications">
                            <i className="fas fa-bell"></i>
                            <span className="badge">2</span>
                        </button>
                        <button className="messages">
                            <i className="fas fa-envelope"></i>
                            <span className="badge">3</span>
                        </button>
                    </div>
                </header>

                <div className="content-container">
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-content">
                            <div className="dashboard-stats">
                                <div className="stat-card">
                                    <div className="stat-icon exams-icon">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>Đề thi đã làm</h3>
                                        <p>12</p>
                                        <div className="stat-trend positive">
                                            <i className="fas fa-arrow-up"></i>
                                            <span>5 trong tuần này</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon score-icon">
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>Điểm trung bình</h3>
                                        <p>8.2</p>
                                        <div className="stat-trend positive">
                                            <i className="fas fa-arrow-up"></i>
                                            <span>0.5 so với tháng trước</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon time-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>Thời gian học</h3>
                                        <p>24h</p>
                                        <div className="stat-trend positive">
                                            <i className="fas fa-arrow-up"></i>
                                            <span>5h so với tuần trước</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="user-content-row">
                                <section className="user-section recent-exams">
                                    <div className="section-header">
                                        <h3>Đề thi gần đây</h3>
                                        <button className="btn-view-all">Xem tất cả</button>
                                    </div>
                                    <div className="user-exams-container">
                                        <table className="user-exams-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên đề thi</th>
                                                    <th>Môn học</th>
                                                    <th>Điểm số</th>
                                                    <th>Ngày làm</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Đề thi THPT QG 2023</td>
                                                    <td>Toán</td>
                                                    <td><span className="score">8.5</span></td>
                                                    <td>15/06/2023</td>
                                                    <td><button className="btn-review">Xem lại</button></td>
                                                </tr>
                                                <tr>
                                                    <td>Đề thi THPT QG 2023</td>
                                                    <td>Văn</td>
                                                    <td><span className="score">7.0</span></td>
                                                    <td>16/06/2023</td>
                                                    <td><button className="btn-review">Xem lại</button></td>
                                                </tr>
                                                <tr>
                                                    <td>Đề thi THPT QG 2023</td>
                                                    <td>Tiếng Anh</td>
                                                    <td><span className="score">9.0</span></td>
                                                    <td>17/06/2023</td>
                                                    <td><button className="btn-review">Xem lại</button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                            
                            <div className="user-content-row">
                                <section className="user-section recommended">
                                    <div className="section-header">
                                        <h3>Đề xuất cho bạn</h3>
                                    </div>
                                    <div className="recommended-items">
                                        <div className="recommended-card">
                                            <div className="rec-icon"><i className="fas fa-file-alt"></i></div>
                                            <div className="rec-content">
                                                <h4>Bộ đề Toán học 2024</h4>
                                                <p>20 đề thi thử THPT QG môn Toán học mới nhất</p>
                                                <button>Làm ngay</button>
                                            </div>
                                        </div>
                                        <div className="recommended-card">
                                            <div className="rec-icon"><i className="fas fa-file-alt"></i></div>
                                            <div className="rec-content">
                                                <h4>Bộ đề Hóa học 2024</h4>
                                                <p>20 đề thi thử THPT QG môn Hóa học mới nhất</p>
                                                <button>Làm ngay</button>
                                            </div>
                                        </div>
                                        <div className="recommended-card">
                                            <div className="rec-icon"><i className="fas fa-graduation-cap"></i></div>
                                            <div className="rec-content">
                                                <h4>Lớp luyện thi chuyên đề</h4>
                                                <p>Tham gia lớp học nhóm cùng giáo viên giỏi</p>
                                                <button>Đăng ký</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="exams-content">
                            <TestsTab />
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="results-content">
                            <h2 className="content-title">Kết quả học tập</h2>
                            <p>Nội dung trang kết quả học tập sẽ hiển thị ở đây.</p>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-content">
                            <h2 className="content-title">Hồ sơ cá nhân</h2>
                            <p>Nội dung trang hồ sơ sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Xác nhận đăng xuất</h3>
                        </div>
                        <div className="modal-body">
                            <p>Bạn có chắc chắn muốn đăng xuất?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={cancelLogout}>Hủy</button>
                            <button className="btn-confirm" onClick={confirmLogout}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserLayout;
