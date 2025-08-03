import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { changePassword } from '../../../services/UserService';

function ChangePassword({ user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // States for password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await changePassword(user._id, passwordData.currentPassword, passwordData.newPassword);
            if (response.success) {
                toast.success('Đổi mật khẩu thành công!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setError(response.message || 'Đổi mật khẩu thất bại');
            }
        } catch (err) {
            setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau.');
        }
        setLoading(false);
    };

    return (
        <div className="password-section password-section-center">
            <div className="section-header section-header-center">
                <h3>Đổi mật khẩu</h3>
                <p className="section-description">
                    Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi định kỳ
                </p>
            </div>

            <div className="password-form password-form-center">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <div className="password-input">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button 
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('current')}
                        >
                            <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <div className="password-input">
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                        />
                        <button 
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <div className="password-input">
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <button 
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </div>

                <div className="password-requirements password-requirements-center">
                    <h4>Yêu cầu mật khẩu:</h4>
                    <ul>
                        <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                            <i className={`fas ${passwordData.newPassword.length >= 8 ? 'fa-check' : 'fa-times'}`}></i>
                            Ít nhất 8 ký tự
                        </li>
                        <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                            <i className={`fas ${/[A-Z]/.test(passwordData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                            Ít nhất 1 chữ hoa
                        </li>
                        <li className={/[0-9]/.test(passwordData.newPassword) ? 'valid' : ''}>
                            <i className={`fas ${/[0-9]/.test(passwordData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                            Ít nhất 1 số
                        </li>
                        <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'valid' : ''}>
                            <i className={`fas ${passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'fa-check' : 'fa-times'}`}></i>
                            Mật khẩu xác nhận khớp
                        </li>
                    </ul>
                </div>

                <button 
                    className="change-password-btn"
                    onClick={handleChangePassword}
                    disabled={loading}
                >
                    <i className="fas fa-key"></i>
                    {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </button>
            </div>
        </div>
    );
}

export default ChangePassword;
