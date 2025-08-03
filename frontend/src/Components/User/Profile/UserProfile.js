import React, { useState, useEffect } from 'react';
import './UserProfile.css';
// Đã gộp ProfileInfo vào file này, không cần import nữa
import ChangePassword from './ChangePassword';
import { uploadAvatar, updateUser } from '../../../services/UserService';

import { toast } from 'react-toastify';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        school: '',
        grade: '',
        avatar: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        // Lấy thông tin user từ localStorage hoặc API
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
        }
    }, []);

    // Khi user thay đổi, cập nhật profileData
    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                school: user.school || '',
                grade: user.grade || '12',
                avatar: user.avatar || ''
            });
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            let avatarUrl = user.avatar || '';
            if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
                avatarUrl = `${API_URL}${avatarUrl}`;
            }
            setAvatarPreview(avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=120`);
        }
    }, [user]);
    // Xử lý chọn file avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProfileSave = async () => {
        if (!profileData.username || !profileData.name || !profileData.email) {
            toast.error('Vui lòng nhập đầy đủ username, tên và email');
            return;
        }

        setLoading(true);
        try {
            let avatarUrl = profileData.avatar;
            // Nếu có file avatar mới, upload lên server
            if (avatarFile) {
                const token = localStorage.getItem('token');
                const uploadData = await uploadAvatar(user._id, avatarFile, token);
                if (uploadData.avatarUrl) {
                    avatarUrl = uploadData.avatarUrl;
                } else {
                    toast.error(uploadData.message || 'Upload avatar thất bại');
                }
            }

            const token = localStorage.getItem('token');
            const responseData = await updateUser(user._id, { ...profileData, avatar: avatarUrl });
            if (responseData.success) {
                const updatedUser = { ...user, ...profileData, avatar: avatarUrl };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditMode(false);
                setAvatarFile(null);
                toast.success('Cập nhật thông tin thành công!');
            } else {
                toast.error(responseData.message || 'Không thể cập nhật thông tin');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        if (user) {
            setProfileData({
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                school: user.school || '',
                grade: user.grade || '12',
                avatar: user.avatar || ''
            });
            let avatarUrl = user.avatar || '';
            if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
                avatarUrl = `http://localhost:5000${avatarUrl}`;
            }
            setAvatarPreview(avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=120`);
            setAvatarFile(null);
        }
        setEditMode(false);
    };

    if (!user) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    return (
        <div className="user-profile">
            <div className="profile-header">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-large">
                        <img 
                            src={avatarPreview}
                            alt="User Avatar" 
                        />
                        {editMode ? (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="avatar-upload-input"
                                    onChange={handleAvatarChange}
                                />
                                <label htmlFor="avatar-upload-input" className="avatar-edit-btn" style={{ cursor: 'pointer' }}>
                                    <i className="fas fa-camera"></i>
                                </label>
                            </>
                        ) : (
                            <button className="avatar-edit-btn" disabled>
                                <i className="fas fa-camera"></i>
                            </button>
                        )}
                    </div>
                    <div className="profile-basic-info">
                        <h2>{user.name}</h2>
                        <p className="user-role">{user.role === 'admin' ? 'Quản trị viên' : `Lớp ${user.grade || '12'}`}</p>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <i className="fas fa-user"></i>
                        Thông tin cá nhân
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <i className="fas fa-lock"></i>
                        Đổi mật khẩu
                    </button>
                </div>

                <div className="profile-tab-content">
                    {activeTab === 'profile' && (
                        <div className="profile-info-section">
                            <div className="section-header">
                                <h3>Thông tin cá nhân</h3>
                                {!editMode ? (
                                    <button className="edit-btn" onClick={() => setEditMode(true)}>
                                        <i className="fas fa-edit"></i>
                                        Chỉnh sửa
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            <i className="fas fa-times"></i>
                                            Hủy
                                        </button>
                                        <button 
                                            className="save-btn" 
                                            onClick={handleProfileSave}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-save"></i>
                                            {loading ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => handleProfileChange('username', e.target.value)}
                                            disabled={!editMode}
                                            required
                                            placeholder="Tên đăng nhập"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và tên</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => handleProfileChange('name', e.target.value)}
                                            disabled={!editMode}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => handleProfileChange('email', e.target.value)}
                                            disabled={!editMode}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                                            disabled={!editMode}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Lớp</label>
                                        <select
                                            value={profileData.grade}
                                            onChange={(e) => handleProfileChange('grade', e.target.value)}
                                            disabled={!editMode}
                                        >
                                            <option value="10">Lớp 10</option>
                                            <option value="11">Lớp 11</option>
                                            <option value="12">Lớp 12</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Trường học</label>
                                        <input
                                            type="text"
                                            value={profileData.school}
                                            onChange={(e) => handleProfileChange('school', e.target.value)}
                                            disabled={!editMode}
                                            placeholder="Tên trường học"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <ChangePassword user={user} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;