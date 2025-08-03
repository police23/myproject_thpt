import React, { useState, useEffect } from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getUsers, deleteUser, updateUser, toggleUserStatus } from '../../../services/UserService';
import './UserManagement.css';

// Setting base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserManagement() {
    const [allUsers, setAllUsers] = useState([]); // Store all users
    const [displayedUsers, setDisplayedUsers] = useState([]); // Users to display after pagination
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Fetch all users from API (no filtering on backend)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setAllUsers(data.users || []);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Filter users on frontend
    const getFilteredUsers = () => {
        let filtered = allUsers;

        // Apply search filter
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(user => 
                user.name?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.username?.toLowerCase().includes(searchLower)
            );
        }

        // Apply role filter
        if (filterRole && filterRole !== 'all') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        return filtered;
    };

    // Handle pagination on client side
    const updateDisplayedUsers = () => {
        const filteredUsers = getFilteredUsers();
        
        // Update stats based on filtered users
        const stats = {
            total: filteredUsers.length,
            active: filteredUsers.filter(user => Number(user.is_active) === 1).length
        };
        setUserStats(stats);

        // Update pagination total
        setPagination(prev => ({
            ...prev,
            total: filteredUsers.length,
            // Reset to page 1 if current page is beyond total pages
            current: prev.current > Math.ceil(filteredUsers.length / prev.pageSize) ? 1 : prev.current
        }));

        // Get users for current page
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
        setDisplayedUsers(usersToDisplay);
    };

    useEffect(() => {
        // Initial data loading
        fetchUsers();
    }, []);

    useEffect(() => {
        // Update displayed users when data, search, filter, or pagination changes
        updateDisplayedUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUsers, searchText, filterRole, pagination.current, pagination.pageSize]);

    const handleTableChange = (page) => {
        setPagination(prev => ({
            ...prev,
            current: page
        }));
    };

    const handleRowsPerPageChange = (e) => {
        const newPageSize = parseInt(e.target.value);
        setPagination(prev => ({
            ...prev,
            pageSize: newPageSize,
            current: 1 // Reset to first page
        }));
    };

    const handleDeleteUser = async (userId) => {
        setLoading(true);
        try {
            await deleteUser(userId);
            toast.success('Xóa người dùng thành công');
            fetchUsers();
        } catch (error) {
            toast.error('Không thể xóa người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId, currentIsActive) => {
        setLoading(true);
        try {
            await toggleUserStatus(userId, currentIsActive === 1 ? 0 : 1);
            toast.success('Thay đổi trạng thái người dùng thành công');
            fetchUsers();
        } catch (error) {
            toast.error('Không thể thay đổi trạng thái người dùng');
        } finally {
            setLoading(false);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const totalPages = Math.ceil(pagination.total / pagination.pageSize);
        
        // Previous button
        pages.push(
            <button key="prev" className="page-btn" onClick={() => handleTableChange(Math.max(1, pagination.current - 1))}>
                <i className="fas fa-chevron-left"></i>
            </button>
        );
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === pagination.current || 
                i === 1 || 
                i === totalPages || 
                (i >= pagination.current - 1 && i <= pagination.current + 1)) {
                pages.push(
                    <button 
                        key={i} 
                        className={`page-btn ${i === pagination.current ? 'active' : ''}`}
                        onClick={() => handleTableChange(i)}
                    >
                        {i}
                    </button>
                );
            } else if (i === pagination.current - 2 || i === pagination.current + 2) {
                pages.push(<span key={`ellipsis-${i}`}>...</span>);
            }
        }
        
        // Next button
        pages.push(
            <button key="next" className="page-btn" onClick={() => handleTableChange(Math.min(totalPages, pagination.current + 1))}>
                <i className="fas fa-chevron-right"></i>
            </button>
        );
        
        return pages;
    };

    return (
        <div className="users-management">
            <h2 className="content-title">Quản lý người dùng</h2>
            
            {/* Stats Section */}
            <div className="user-stats">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Tổng người dùng</h3>
                        <p>{userStats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <i className="fas fa-user-check"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Người dùng hoạt động</h3>
                        <p>{userStats.active}</p>
                    </div>
                </div>
            </div>
            
            <div className="users-controls">
                <div className="left-controls">
                    <div className="search-box">
                        <i className="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm người dùng..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-dropdown">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="user">Người dùng</option>
                        </select>
                    </div>
                </div>
                
                <div className="right-controls">
                    <button className="btn-reload" onClick={() => fetchUsers()}>
                        <i className="fas fa-sync-alt"></i> Tải lại
                    </button>
                </div>
            </div>
            
            {/* Table View */}
            <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>
                                    <div className="th-content">
                                        <span>Username</span>
                                        <i className="fas fa-sort"></i>
                                    </div>
                                </th>
                                <th>
                                    <div className="th-content">
                                        <span>Tên người dùng</span>
                                        <i className="fas fa-sort"></i>
                                    </div>
                                </th>
                                <th>
                                    <div className="th-content">
                                        <span>Email</span>
                                        <i className="fas fa-sort"></i>
                                    </div>
                                </th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>
                                    <div className="th-content">
                                        <span>Ngày tạo</span>
                                        <i className="fas fa-sort"></i>
                                    </div>
                                </th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="loading-cell">
                                        <div className="loading-spinner"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </td>
                                </tr>
                            ) : displayedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-cell">
                                        <div className="empty-state">
                                            <i className="fas fa-user-slash"></i>
                                            <p>Không tìm thấy người dùng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username || 'N/A'}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${(Number(user.is_active) === 1) ? 'active' : 'inactive'}`}>
                                                {(Number(user.is_active) === 0) ? 'Bị khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="actions">
                                            <Popconfirm
                                                title={`Bạn có chắc chắn muốn ${(Number(user.is_active) === 1) ? 'khóa' : 'mở khóa'} người dùng này?`}
                                                onConfirm={() => handleToggleUserStatus(user._id, Number(user.is_active) || 1)}
                                                okText="Có"
                                                cancelText="Không"
                                                placement="left"
                                                disabled={user.role === 'admin'}
                                            >
                                                <Tooltip title={user.role === 'admin' ? 'Không thể khóa tài khoản admin' : ((Number(user.is_active) === 1) ? 'Khóa người dùng' : 'Mở khóa người dùng')}>
                                                    <button 
                                                        className={`action-btn ${(Number(user.is_active) === 1) ? 'lock' : 'unlock'}`}
                                                        disabled={user.role === 'admin'}
                                                        style={{ opacity: user.role === 'admin' ? 0.5 : 1, cursor: user.role === 'admin' ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        <i className={`fas ${(Number(user.is_active) === 1) ? 'fa-lock' : 'fa-unlock'}`}></i>
                                                    </button>
                                                </Tooltip>
                                            </Popconfirm>
                                            
                                            <Popconfirm
                                                title="Bạn có chắc chắn muốn xóa người dùng này?"
                                                onConfirm={() => handleDeleteUser(user._id)}
                                                okText="Có"
                                                cancelText="Không"
                                                placement="left"
                                                disabled={user.role === 'admin'}
                                            >
                                                <Tooltip title={user.role === 'admin' ? 'Không thể xóa tài khoản admin' : 'Xóa người dùng'}>
                                                    <button 
                                                        className="action-btn delete"
                                                        disabled={user.role === 'admin'}
                                                        style={{ opacity: user.role === 'admin' ? 0.5 : 1, cursor: user.role === 'admin' ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </Tooltip>
                                            </Popconfirm>
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
                    <select 
                        value={pagination.pageSize}
                        onChange={handleRowsPerPageChange}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    <span>/ trang</span>
                </div>
                <div className="pagination">
                    {renderPagination()}
                </div>
                <div className="pagination-info">
                    Hiển thị {displayedUsers.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trên tổng số {pagination.total} người dùng
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
