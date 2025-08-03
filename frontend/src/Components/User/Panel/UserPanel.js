import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TestsTab from '../Test/TestPage/TestsPage';
import TestResults from '../Test/TestResult/TestResults';
import UserProfile from '../Profile/UserProfile';
import UserDashboard from '../Dashboard/UserDashboard';
import BlogList from '../Blog/BlogList.js';
import { useLocation, useNavigate } from 'react-router-dom';
import './UserPanel.css';
function UserLayout({ onLogout }) {
    // Xóa 1 thông báo theo index
    const handleDeleteNotification = (idx) => {
        setNotifications(prev => {
            const updated = prev.filter((_, i) => i !== idx);
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
    };
    // Lấy thông tin user từ localStorage
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Xử lý đường dẫn avatar
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    let avatarUrl = user && user.avatar ? user.avatar : 'https://via.placeholder.com/50';
    if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
        avatarUrl = `${API_URL}${avatarUrl}`;
    }
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    // Notification state
    const [notifications, setNotifications] = useState(() => {
        // Lấy từ localStorage nếu có
        try {
            const saved = localStorage.getItem('notifications');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    // Lưu danh sách id thông báo đã đọc
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        try {
            const saved = localStorage.getItem('readNotificationIds');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [showDropdown, setShowDropdown] = useState(false);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        if (!showDropdown) return;
        const handleClickOutside = (e) => {
            // Nếu click vào dropdown hoặc nút chuông thì không đóng
            if (
                e.target.closest('.notification-dropdown') ||
                e.target.closest('.notifications')
            ) {
                return;
            }
            setShowDropdown(false);
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);
    // Socket.io notification integration
    useEffect(() => {
        const socket = io(API_URL);
        if (user && user._id) {
            socket.emit('join', user._id);
        }
        socket.on('notification', (data) => {
            const withTime = {
                ...data,
                time: data.time || data.createdAt || new Date().toISOString(),
                _id: data._id || (data.time || data.createdAt || new Date().toISOString()) // dùng _id hoặc time làm id
            };
            setNotifications(prev => {
                const updated = [withTime, ...prev];
                localStorage.setItem('notifications', JSON.stringify(updated));
                return updated;
            });
            // Không thêm vào readNotificationIds, nên sẽ là chưa đọc
        });
        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Khi xóa thông báo hoặc đăng xuất, có thể clear localStorage nếu muốn

    // Determine active tab from URL
    const getTabFromPath = (pathname) => {
        if (pathname.endsWith('/dashboard')) return 'dashboard';
        if (pathname.endsWith('/exams')) return 'exams';
        if (pathname.endsWith('/results')) return 'results';
        if (pathname.endsWith('/blogs')) return 'blogs';
        if (pathname.endsWith('/profile')) return 'profile';
        return 'dashboard';
    };
    const activeTab = getTabFromPath(location.pathname);

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

    // Điều hướng khi click tab, đồng bộ URL
    const handleTabClick = (tab) => {
        let path = '/student/dashboard';
        if (tab === 'exams') path = '/student/exams';
        else if (tab === 'results') path = '/student/results';
        else if (tab === 'profile') path = '/student/profile';
        else if (tab === 'blogs') path = '/student/blogs';
        navigate(path);
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
                        <img src={avatarUrl} alt="User Avatar" />
                    </div>
                    <div className="profile-info">
                        <h3>{user ? user.name : 'Học sinh'}</h3>
                        <p>{user ? `Lớp ${user.grade || 12}` : 'Lớp 12'}</p>
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
                        <li className={activeTab === 'blogs' ? 'active' : ''} onClick={() => handleTabClick('blogs')}>
                            <i className="fas fa-blog"></i> <span>Blog</span>
                        </li>
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleTabClick('profile')}>
                            <i className="fas fa-user"></i> <span>Thông tin tài khoản</span>
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
                    
                    <div className="header-right" style={{ position: 'relative' }}>
                        <button className="notifications" onClick={() => {
                            setShowDropdown(!showDropdown);
                            // Đánh dấu tất cả thông báo là đã đọc
                            const allIds = notifications.map(n => n._id || (n.time || n.createdAt));
                            setReadNotificationIds(allIds);
                            localStorage.setItem('readNotificationIds', JSON.stringify(allIds));
                        }}>
                            <i className="fas fa-bell"></i>
                            {(() => {
                                const unreadCount = notifications.filter(n => !readNotificationIds.includes(n._id || (n.time || n.createdAt))).length;
                                return unreadCount > 0 ? <span className="badge">{unreadCount}</span> : null;
                            })()}
                        </button>
                        {showDropdown && (
                            <div
                                className="notification-dropdown"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="notification-dropdown-header">Thông báo</div>
                                {notifications.length === 0 ? (
                                    <div className="no-notification">Không có thông báo mới</div>
                                ) : (
                                    <ul className="notification-list">
                                        {notifications.map((n, idx) => {
                                            const time = n.time || n.createdAt || new Date();
                                            const dateObj = new Date(time);
                                            const dateStr = dateObj.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                            const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                            const blogId = n.blogId;
                                            const testId = n.testId;
                                            const isBlog = !!blogId;
                                            const isTest = !!testId;
                                            let itemClass = 'notification-item';
                                            if (isBlog) itemClass += ' blog';
                                            else if (isTest) itemClass += ' test';
                                            return (
                                                <li
                                                    key={idx}
                                                    tabIndex={isBlog || isTest ? 0 : -1}
                                                    role={isBlog || isTest ? 'button' : undefined}
                                                    className={itemClass}
                                                    onClick={isBlog ? (e) => { setShowDropdown(false); navigate(`/blog/${blogId}`); }
                                                        : isTest ? (e) => { setShowDropdown(false); navigate(`/test/${testId}`); }
                                                        : undefined}
                                                    onKeyDown={isBlog ? (e) => { if (e.key === 'Enter' || e.key === ' ') { setShowDropdown(false); navigate(`/blog/${blogId}`); } }
                                                        : isTest ? (e) => { if (e.key === 'Enter' || e.key === ' ') { setShowDropdown(false); navigate(`/test/${testId}`); } }
                                                        : undefined}
                                                >
                                                    <div className="notification-icon">
                                                        {isBlog ? (
                                                            <i className="fas fa-blog"></i>
                                                        ) : isTest ? (
                                                            <i className="fas fa-file-alt"></i>
                                                        ) : (
                                                            <i className="fas fa-bell"></i>
                                                        )}
                                                    </div>
                                                    <div className="notification-content">
                                                        <div className="notification-title">{n.title}</div>
                                                        <div className="notification-body">{n.content}</div>
                                                        <div className="notification-time">
                                                            <i className="fas fa-clock"></i>
                                                            <span>{timeStr} - {dateStr}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="notification-delete-btn"
                                                        title="Xóa thông báo"
                                                        onClick={e => { e.stopPropagation(); handleDeleteNotification(idx); }}
                                                        tabIndex={0}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="content-container">
                    {activeTab === 'dashboard' && <UserDashboard />}
                    {activeTab === 'exams' && (
                        <div className="exams-content">
                            <TestsTab />
                        </div>
                    )}
                    {activeTab === 'results' && (
                        <div className="results-content">
                            <TestResults />
                        </div>
                    )}
                    {activeTab === 'blogs' && (
                        <div className="blogs-content">
                            <BlogList />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-content">
                            <UserProfile />
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
