import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Popconfirm, message, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import './UsersTab.css';

const { Option } = Select;

// Setting base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        admin: 0,
        user: 0
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [form] = Form.useForm();

    // Fetch users from API
    const fetchUsers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/users', {
                params: { 
                    page, 
                    pageSize, 
                    search: searchText, 
                    role: filterRole !== 'all' ? filterRole : undefined 
                }
            });
            
            if (response.data && response.data.users) {
                setUsers(response.data.users);
                setPagination({
                    ...pagination,
                    total: response.data.total || 0,
                    current: page,
                    pageSize: pageSize,
                    pages: response.data.pages || 1
                });
                
                // Update user statistics
                const stats = {
                    total: response.data.total || 0,
                    active: response.data.users.filter(user => user.status === 'active').length,
                    admin: response.data.users.filter(user => user.role === 'admin').length,
                    user: response.data.users.filter(user => user.role === 'user').length
                };
                setUserStats(stats);
                
                console.log('Users loaded successfully:', response.data.users.length);
            } else {
                console.error('Invalid response format:', response.data);
                message.error('Định dạng dữ liệu không hợp lệ');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            message.error('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial data loading
        fetchUsers(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, filterRole]);

    const handleTableChange = (page) => {
        fetchUsers(page, pagination.pageSize);
    };

    const handleRowsPerPageChange = (e) => {
        const newPageSize = parseInt(e.target.value);
        fetchUsers(1, newPageSize);
    };

    const showAddUserModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditUserModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingUser) {
                // Update existing user
                await axios.put(`/api/users/${editingUser._id}`, values);
                toast.success('Cập nhật người dùng thành công');
            } else {
                // Add new user
                await axios.post('/api/users', values);
                toast.success('Thêm người dùng mới thành công');
            }

            setIsModalVisible(false);
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Form submission failed:', error);
            toast.error('Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        setLoading(true);
        try {
            await axios.delete(`/api/users/${userId}`);
            toast.success('Xóa người dùng thành công');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Không thể xóa người dùng');
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
                        <h3>{userStats.total}</h3>
                        <p>Tổng người dùng</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon admin">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{userStats.admin}</h3>
                        <p>Quản trị viên</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon user">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{userStats.user}</h3>
                        <p>Người dùng</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <i className="fas fa-user-check"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{userStats.active}</h3>
                        <p>Người dùng hoạt động</p>
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
                        {searchText && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchText('')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
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
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Xem dạng bảng"
                        >
                            <i className="fas fa-table"></i>
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setViewMode('card')}
                            title="Xem dạng thẻ"
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                    </div>
                    
                    <button className="btn-reload" onClick={() => fetchUsers(1, pagination.pageSize)}>
                        <i className="fas fa-sync-alt"></i> Tải lại
                    </button>
                    
                    <button className="btn-add-user" onClick={showAddUserModal}>
                        <i className="fas fa-plus"></i> Thêm người dùng
                    </button>
                </div>
            </div>
            
            {/* Table View */}
            {viewMode === 'table' && (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
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
                                    <td colSpan="6" className="loading-cell">
                                        <div className="loading-spinner"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-cell">
                                        <div className="empty-state">
                                            <i className="fas fa-user-slash"></i>
                                            <p>Không tìm thấy người dùng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id}>
                                        <td className="user-name-cell">
                                            <div className="user-avatar">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span>{user.name}</span>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.status || 'active'}`}>
                                                {user.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="actions">
                                            <Tooltip title="Sửa thông tin">
                                                <button 
                                                    className="action-btn edit" 
                                                    onClick={() => showEditUserModal(user)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            </Tooltip>
                                            
                                            <Tooltip title="Chi tiết">
                                                <button className="action-btn view">
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            </Tooltip>

                                            <Popconfirm
                                                title="Bạn có chắc chắn muốn xóa người dùng này?"
                                                onConfirm={() => handleDeleteUser(user._id)}
                                                okText="Có"
                                                cancelText="Không"
                                                placement="left"
                                            >
                                                <Tooltip title="Xóa người dùng">
                                                    <button className="action-btn delete">
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
            )}
            
            {/* Card View */}
            {viewMode === 'card' && (
                <div className="users-card-view">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-user-slash"></i>
                            <p>Không tìm thấy người dùng nào</p>
                        </div>
                    ) : (
                        users.map(user => (
                            <div key={user._id} className="user-card">
                                <div className="card-header">
                                    <div className="user-avatar">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-badges">
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                        </span>
                                        <span className={`status-badge ${user.status || 'active'}`}>
                                            {user.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h3 className="user-name">{user.name}</h3>
                                    <p className="user-email">{user.email}</p>
                                    <p className="user-created">
                                        <i className="fas fa-calendar-alt"></i>
                                        Ngày tạo: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="card-footer">
                                    <button 
                                        className="card-btn edit" 
                                        onClick={() => showEditUserModal(user)}
                                        title="Sửa thông tin"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    
                                    <button className="card-btn view" title="Chi tiết">
                                        <i className="fas fa-eye"></i>
                                    </button>

                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                                        onConfirm={() => handleDeleteUser(user._id)}
                                        okText="Có"
                                        cancelText="Không"
                                        placement="left"
                                    >
                                        <button className="card-btn delete" title="Xóa người dùng">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
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
                    Hiển thị {users.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trên tổng số {pagination.total} người dùng
                </div>
            </div>
            
            {/* Improved User Form Modal */}
            {isModalVisible && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingUser ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
                            </h3>
                            <button className="modal-close" onClick={handleCancel}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <Form
                                form={form}
                                layout="vertical"
                                className="user-form"
                            >
                                <div className="form-row">
                                    <Form.Item
                                        name="name"
                                        label="Tên người dùng"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                                        className="form-col"
                                    >
                                        <Input prefix={<i className="fas fa-user"></i>} placeholder="Nhập tên người dùng" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                        className="form-col"
                                    >
                                        <Input prefix={<i className="fas fa-envelope"></i>} placeholder="Nhập địa chỉ email" />
                                    </Form.Item>
                                </div>

                                {!editingUser && (
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                    >
                                        <Input.Password prefix={<i className="fas fa-lock"></i>} placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                )}

                                <div className="form-row">
                                    <Form.Item
                                        name="role"
                                        label="Vai trò"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                                        className="form-col"
                                    >
                                        <Select placeholder="Chọn vai trò">
                                            <Option value="user">Người dùng</Option>
                                            <Option value="admin">Quản trị viên</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="status"
                                        label="Trạng thái"
                                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                        initialValue="active"
                                        className="form-col"
                                    >
                                        <Select placeholder="Chọn trạng thái">
                                            <Option value="active">Hoạt động</Option>
                                            <Option value="inactive">Không hoạt động</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                            </Form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCancel}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        <span>{editingUser ? 'Cập nhật' : 'Thêm mới'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersTab;
