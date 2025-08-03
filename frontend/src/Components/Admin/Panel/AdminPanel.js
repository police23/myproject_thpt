import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './AdminPanel.css';
import Dashboard from '../Dashboard/AdminDashboard';
import AddBlog from '../Blog/AddBlog/AddBlog';
import UserManagement from '../Users/UserManagement';
import TestManagement from '../Tests/TestManagement/TestManagement';
import AddTest from '../Tests/AddTest/AddTest';
import TestPreview from '../Tests/TestPreview/TestPreview';
import BlogManagement from '../Blog/BlogManagement/BlogManagement';
import AccountSettings from '../AccountSettings/AccountSettings';
function AdminLayout({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/admin/users')) return 'users';
        if (path.includes('/admin/tests')) return 'tests';
        if (path.includes('/admin/blogs')) return 'blogs';
        if (path.includes('/admin/settings')) return 'settings';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab());

    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [location.pathname]);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 800);
    }, []);

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
        switch (tab) {
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'users':
                navigate('/admin/users');
                break;
            case 'tests':
                navigate('/admin/tests');
                break;
            case 'blogs':
                navigate('/admin/blogs');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            default:
                navigate('/admin/dashboard');
        }
        setActiveTab(tab);
    };

    const isAddTestOrPreviewPage = (
        location.pathname === '/admin/tests/new' ||
        location.pathname.startsWith('/admin/tests/edit') ||
        location.pathname.startsWith('/admin/tests/preview')
    );

    return (
        <div className="admin-dashboard">
            {!isAddTestOrPreviewPage && (
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="logo">
                            <i className="fas fa-graduation-cap"></i>
                            <h2>Admin Panel</h2>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <ul>
                            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => handleTabClick('dashboard')}>
                                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
                            </li>
                            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => handleTabClick('users')}>
                                <i className="fas fa-users"></i> <span>Quản lý người dùng</span>
                            </li>
                            <li className={activeTab === 'tests' ? 'active' : ''} onClick={() => handleTabClick('tests')}>
                                <i className="fas fa-file-alt"></i> <span>Quản lý đề thi</span>
                            </li>
                            <li className={activeTab === 'blogs' ? 'active' : ''} onClick={() => handleTabClick('blogs')}>
                                <i className="fas fa-blog"></i> <span>Quản lý blog</span>
                            </li>
                            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabClick('settings')}>
                                <i className="fas fa-cog"></i> <span>Cài đặt tài khoản</span>
                            </li>
                        </ul>
                    </nav>
                    <div className="sidebar-footer">
                        <button className="logout-button" onClick={handleLogoutClick}>
                            <i className="fas fa-sign-out-alt"></i> <span>Đăng xuất</span>
                        </button>
                    </div>
                </aside>
            )}

            <main className="main-content" style={isAddTestOrPreviewPage ? { marginLeft: 0 } : {}}>
                <header className="admin-header">
                    <div className="header-left">
                        <h2 className="current-date">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                    </div>
                    <div className="header-right">
                        <div className="admin-profile">
                            <div className="admin-info">
                                <span className="admin-name">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-container">
                    {loading ? (
                        <div className="loading-spinner-container">
                            <div className="loading-spinner"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={<Navigate to="/admin/blogs" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/users" element={<UserManagement />} />
                            <Route path="/tests" element={<TestManagement />} />
                            <Route path="/tests/new" element={<AddTest isStandalone={true} />} />
                            <Route path="/tests/edit/:id" element={<AddTest isStandalone={true} />} />
                            <Route path="/tests/preview/:id" element={<TestPreview />} />
                            <Route path="/blogs/*" element={<BlogManagement />} />
                            <Route path="/blogs/new" element={<AddBlog />} />
                            <Route path="/settings" element={<AccountSettings />} />
                            <Route path="*" element={<Navigate to="/admin/blogs" replace />} />
                        </Routes>
                    )}
                </div>
            </main>

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
                            <button className="btn-confirm" onClick={confirmLogout}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminLayout;