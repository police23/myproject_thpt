import React, { useState } from 'react';
import './SettingsTab.css';

function SettingsTab() {
    const [activeSettingsTab, setActiveSettingsTab] = useState('system');
    const [formData, setFormData] = useState({
        // System Settings
        siteName: 'Luyện thi THPT Quốc gia',
        siteDescription: 'Hệ thống luyện thi trực tuyến cho kỳ thi THPT Quốc gia',
        siteLogo: null,
        mainColor: '#4361ee',
        secondaryColor: '#4895ef',
        
        // User Settings
        defaultUserRole: 'student',
        allowRegistrations: true,
        requireEmailVerification: true,
        passwordMinLength: 8,
        
        // Email Settings
        smtpServer: 'smtp.example.com',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: '',
        emailFromName: 'Luyện thi THPT',
        emailFromAddress: 'no-reply@luyenthithpt.vn',
        
        // Content Settings
        defaultLanguage: 'vi',
        autoApproveComments: false,
        maxFileUploadSize: 5,
        allowedFileTypes: '.pdf,.doc,.docx,.jpg,.png',
        
        // Security Settings
        enableTwoFactor: false,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        recaptchaEnabled: true
    });
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, this would save settings to the backend
        console.log('Settings saved:', formData);
        // Show success message
        alert('Cài đặt đã được lưu thành công!');
    };
    
    const handleFileChange = (e) => {
        // In a real app, this would handle file uploads
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData({
                ...formData,
                [name]: files[0]
            });
        }
    };
    
    return (
        <div className="settings-container">
            <h1 className="content-title">Cài đặt hệ thống</h1>
            
            <div className="settings-tabs">
                <button 
                    className={`settings-tab-btn ${activeSettingsTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('system')}
                >
                    <i className="fas fa-cog"></i> Hệ thống
                </button>
                <button 
                    className={`settings-tab-btn ${activeSettingsTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('users')}
                >
                    <i className="fas fa-users"></i> Người dùng
                </button>
                <button 
                    className={`settings-tab-btn ${activeSettingsTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('email')}
                >
                    <i className="fas fa-envelope"></i> Email
                </button>
                <button 
                    className={`settings-tab-btn ${activeSettingsTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('content')}
                >
                    <i className="fas fa-file-alt"></i> Nội dung
                </button>
                <button 
                    className={`settings-tab-btn ${activeSettingsTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('security')}
                >
                    <i className="fas fa-shield-alt"></i> Bảo mật
                </button>
            </div>
            
            <div className="settings-content">
                {/* System Settings */}
                {activeSettingsTab === 'system' && (
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-section">
                            <h2 className="section-title">Cài đặt chung</h2>
                            
                            <div className="form-group">
                                <label>Tên trang web</label>
                                <input 
                                    type="text" 
                                    name="siteName" 
                                    value={formData.siteName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Mô tả trang web</label>
                                <textarea 
                                    name="siteDescription" 
                                    value={formData.siteDescription} 
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Logo</label>
                                <div className="file-upload">
                                    <input 
                                        type="file" 
                                        name="siteLogo" 
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                    />
                                    <button type="button" className="btn-upload">
                                        <i className="fas fa-upload"></i> Chọn file
                                    </button>
                                    <span>
                                        {formData.siteLogo ? formData.siteLogo.name : 'Chưa chọn file nào'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="form-group color-picker">
                                <label>Màu chính</label>
                                <input 
                                    type="color" 
                                    name="mainColor" 
                                    value={formData.mainColor} 
                                    onChange={handleInputChange} 
                                />
                                <span>{formData.mainColor}</span>
                            </div>
                            
                            <div className="form-group color-picker">
                                <label>Màu phụ</label>
                                <input 
                                    type="color" 
                                    name="secondaryColor" 
                                    value={formData.secondaryColor} 
                                    onChange={handleInputChange} 
                                />
                                <span>{formData.secondaryColor}</span>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
                
                {/* User Settings */}
                {activeSettingsTab === 'users' && (
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-section">
                            <h2 className="section-title">Cài đặt người dùng</h2>
                            
                            <div className="form-group">
                                <label>Vai trò mặc định cho người dùng mới</label>
                                <select 
                                    name="defaultUserRole" 
                                    value={formData.defaultUserRole} 
                                    onChange={handleInputChange}
                                >
                                    <option value="student">Học sinh</option>
                                    <option value="teacher">Giáo viên</option>
                                    <option value="parent">Phụ huynh</option>
                                </select>
                            </div>
                            
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    id="allowRegistrations" 
                                    name="allowRegistrations" 
                                    checked={formData.allowRegistrations} 
                                    onChange={handleInputChange} 
                                />
                                <label htmlFor="allowRegistrations">
                                    Cho phép đăng ký tài khoản mới
                                </label>
                            </div>
                            
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    id="requireEmailVerification" 
                                    name="requireEmailVerification" 
                                    checked={formData.requireEmailVerification} 
                                    onChange={handleInputChange} 
                                />
                                <label htmlFor="requireEmailVerification">
                                    Yêu cầu xác thực email
                                </label>
                            </div>
                            
                            <div className="form-group">
                                <label>Độ dài tối thiểu của mật khẩu</label>
                                <input 
                                    type="number" 
                                    min="6" 
                                    max="20" 
                                    name="passwordMinLength" 
                                    value={formData.passwordMinLength} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
                
                {/* Email Settings */}
                {activeSettingsTab === 'email' && (
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-section">
                            <h2 className="section-title">Cài đặt email</h2>
                            
                            <div className="form-group">
                                <label>SMTP Server</label>
                                <input 
                                    type="text" 
                                    name="smtpServer" 
                                    value={formData.smtpServer} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>SMTP Port</label>
                                <input 
                                    type="text" 
                                    name="smtpPort" 
                                    value={formData.smtpPort} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>SMTP Username</label>
                                <input 
                                    type="text" 
                                    name="smtpUsername" 
                                    value={formData.smtpUsername} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>SMTP Password</label>
                                <input 
                                    type="password" 
                                    name="smtpPassword" 
                                    value={formData.smtpPassword} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Tên người gửi</label>
                                <input 
                                    type="text" 
                                    name="emailFromName" 
                                    value={formData.emailFromName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Email người gửi</label>
                                <input 
                                    type="email" 
                                    name="emailFromAddress" 
                                    value={formData.emailFromAddress} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="email-templates">
                                <h3>Mẫu email</h3>
                                <div className="template-list">
                                    <div className="template-item">
                                        <span>Email chào mừng</span>
                                        <button type="button" className="btn-edit-template">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <div className="template-item">
                                        <span>Xác nhận đăng ký</span>
                                        <button type="button" className="btn-edit-template">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <div className="template-item">
                                        <span>Đặt lại mật khẩu</span>
                                        <button type="button" className="btn-edit-template">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <div className="template-item">
                                        <span>Thông báo bài thi mới</span>
                                        <button type="button" className="btn-edit-template">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Lưu thay đổi
                            </button>
                            <button type="button" className="btn-test">
                                <i className="fas fa-paper-plane"></i> Gửi email thử nghiệm
                            </button>
                        </div>
                    </form>
                )}
                
                {/* Content Settings */}
                {activeSettingsTab === 'content' && (
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-section">
                            <h2 className="section-title">Cài đặt nội dung</h2>
                            
                            <div className="form-group">
                                <label>Ngôn ngữ mặc định</label>
                                <select 
                                    name="defaultLanguage" 
                                    value={formData.defaultLanguage} 
                                    onChange={handleInputChange}
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">Tiếng Anh</option>
                                </select>
                            </div>
                            
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    id="autoApproveComments" 
                                    name="autoApproveComments" 
                                    checked={formData.autoApproveComments} 
                                    onChange={handleInputChange} 
                                />
                                <label htmlFor="autoApproveComments">
                                    Tự động duyệt các bình luận
                                </label>
                            </div>
                            
                            <div className="form-group">
                                <label>Giới hạn kích thước tệp tải lên (MB)</label>
                                <input 
                                    type="number" 
                                    name="maxFileUploadSize" 
                                    value={formData.maxFileUploadSize} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Định dạng tệp cho phép</label>
                                <input 
                                    type="text" 
                                    name="allowedFileTypes" 
                                    value={formData.allowedFileTypes} 
                                    onChange={handleInputChange} 
                                />
                                <small>Phân cách các định dạng bằng dấu phẩy (.pdf, .doc, ...)</small>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
                
                {/* Security Settings */}
                {activeSettingsTab === 'security' && (
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-section">
                            <h2 className="section-title">Cài đặt bảo mật</h2>
                            
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    id="enableTwoFactor" 
                                    name="enableTwoFactor" 
                                    checked={formData.enableTwoFactor} 
                                    onChange={handleInputChange} 
                                />
                                <label htmlFor="enableTwoFactor">
                                    Bật xác thực hai yếu tố
                                </label>
                            </div>
                            
                            <div className="form-group">
                                <label>Thời gian hết hạn phiên (phút)</label>
                                <input 
                                    type="number" 
                                    name="sessionTimeoutMinutes" 
                                    value={formData.sessionTimeoutMinutes} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Số lần đăng nhập thất bại tối đa</label>
                                <input 
                                    type="number" 
                                    name="maxLoginAttempts" 
                                    value={formData.maxLoginAttempts} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    id="recaptchaEnabled" 
                                    name="recaptchaEnabled" 
                                    checked={formData.recaptchaEnabled} 
                                    onChange={handleInputChange} 
                                />
                                <label htmlFor="recaptchaEnabled">
                                    Bật reCAPTCHA cho trang đăng nhập và đăng ký
                                </label>
                            </div>
                            
                            <div className="security-actions">
                                <button type="button" className="btn-security">
                                    <i className="fas fa-sync-alt"></i> Làm mới khóa API
                                </button>
                                <button type="button" className="btn-security warning">
                                    <i className="fas fa-trash-alt"></i> Xóa tất cả phiên đăng nhập
                                </button>
                                <button type="button" className="btn-security danger">
                                    <i className="fas fa-shield-alt"></i> Khóa trang web
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default SettingsTab;
