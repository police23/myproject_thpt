import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';
import DashboardTab from '../Dashboard/DashboardTab';
import UsersTab from '../Users/UsersTab';
import ExamsTab from '../Exams/ExamsTab';
import AnalyticsTab from '../Analytics/AnalyticsTab';
import SettingsTab from '../Settings/SettingsTab';
import ExamForm2025 from '../Exams/ExamForm2025';
import ExamPreview from '../Exams/ExamPreview';

function AdminLayout({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userList, setUserList] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'user', status: 'active' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'user', status: 'active' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'user', status: 'inactive' },
        { id: 4, name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active' }
    ]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard/users')) return 'users';
        if (path.includes('/admin/dashboard/exams')) return 'exams';
        if (path.includes('/admin/dashboard/analytics')) return 'analytics';
        if (path.includes('/admin/dashboard/settings')) return 'settings';
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
        switch (tab) {
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'users':
                navigate('/admin/dashboard/users');
                break;
            case 'exams':
                navigate('/admin/dashboard/exams');
                break;
            case 'analytics':
                navigate('/admin/dashboard/analytics');
                break;
            case 'settings':
                navigate('/admin/dashboard/settings');
                break;
            default:
                navigate('/admin/dashboard');
        }
        setActiveTab(tab);
    };

    return (
        <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <i className="fas fa-graduation-cap"></i>
                        <h2>Admin Panel</h2>
                    </div>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => handleTabClick('dashboard')}>
                            <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
                        </li>
                        <li className={activeTab === 'users' ? 'active' : ''} onClick={() => handleTabClick('users')}>
                            <i className="fas fa-users"></i> <span>Quản lý người dùng</span>
                        </li>
                        <li className={activeTab === 'exams' ? 'active' : ''} onClick={() => handleTabClick('exams')}>
                            <i className="fas fa-file-alt"></i> <span>Quản lý đề thi</span>
                        </li>
                        <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => handleTabClick('analytics')}>
                            <i className="fas fa-chart-line"></i> <span>Thống kê & Báo cáo</span>
                        </li>
                        <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabClick('settings')}>
                            <i className="fas fa-cog"></i> <span>Cài đặt hệ thống</span>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogoutClick}>
                        <i className="fas fa-sign-out-alt"></i> <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="admin-header">
                    <div className="header-left">
                        <h2 className="current-date">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                    </div>
                    
                    <div className="header-right">
                        <button className="notifications">
                            <i className="fas fa-bell"></i>
                            <span className="badge">3</span>
                        </button>
                        <button className="messages">
                            <i className="fas fa-envelope"></i>
                            <span className="badge">5</span>
                        </button>
                        <div className="admin-profile">
                            <img src="https://via.placeholder.com/40" alt="Admin Avatar" />
                            <div className="admin-info">
                                <span className="admin-name">Admin</span>
                                <span className="admin-role">Super Admin</span>
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
                            <Route path="/" element={<DashboardTab />} />
                            <Route path="/users" element={<UsersTab userList={userList} />} />
                            <Route path="/exams" element={<ExamsTab />} />
                            <Route path="/exams/new" element={<ExamForm2025 isStandalone={true} />} />
                            <Route path="/exams/edit/:id" element={<ExamForm2025 isStandalone={true} />} />
                            <Route path="/exams/preview/:id" element={<ExamPreview />} />
                            <Route path="/analytics" element={<AnalyticsTab />} />
                            <Route path="/settings" element={<SettingsTab />} />
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