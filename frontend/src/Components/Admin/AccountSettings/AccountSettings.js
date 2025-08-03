

import React, { useState, useEffect } from 'react';

import { updateEmail, changePassword } from '../../../services/UserService';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import './AccountSettings.css';



function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');


  // Lấy userId thực tế từ context
  const userId = user?.id || user?._id || '';

  // Khi user thay đổi, cập nhật email
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Hàm lưu email
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setEmailMessage('');
    try {
      const res = await updateEmail(userId, email);
      if (res.success) {
        setEmailMessage('Cập nhật email thành công!');
        toast.success('Cập nhật email thành công!', { position: 'top-right', autoClose: 5000 });
        // Cập nhật email mới vào context
        updateUser({ ...user, email });
      } else {
        setEmailMessage(res.message || 'Cập nhật email thất bại!');
        toast.error(res.message || 'Cập nhật email thất bại!', { position: 'top-right', autoClose: 5000 });
      }
    } catch (err) {
      setEmailMessage('Cập nhật email thất bại!');
      toast.error('Cập nhật email thất bại!', { position: 'top-right', autoClose: 5000 });
    }
  };

  // Hàm lưu mật khẩu
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (!currentPassword) {
      setPasswordMessage('Vui lòng nhập mật khẩu hiện tại');
      toast.error('Vui lòng nhập mật khẩu hiện tại', { position: 'top-right', autoClose: 5000 });
      return;
    }
    if (!password) {
      setPasswordMessage('Vui lòng nhập mật khẩu mới');
      toast.error('Vui lòng nhập mật khẩu mới', { position: 'top-right', autoClose: 5000 });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage('Mật khẩu xác nhận không khớp!');
      toast.error('Mật khẩu xác nhận không khớp!', { position: 'top-right', autoClose: 5000 });
      return;
    }
    try {
      const res = await changePassword(userId, currentPassword, password);
      if (res && res.message && (res.message.includes('không đúng') || res.message.includes('ít nhất'))) {
        setPasswordMessage(res.message);
        toast.error(res.message, { position: 'top-right', autoClose: 5000 });
        return;
      }
      if (res && res.success === false) {
        setPasswordMessage(res.message || 'Đổi mật khẩu thất bại!');
        toast.error(res.message || 'Đổi mật khẩu thất bại!', { position: 'top-right', autoClose: 5000 });
        return;
      }
      setPasswordMessage('Đổi mật khẩu thành công!');
      toast.success('Đổi mật khẩu thành công!', { position: 'top-right', autoClose: 5000 });
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage('Đổi mật khẩu thất bại!');
      toast.error('Đổi mật khẩu thất bại!', { position: 'top-right', autoClose: 5000 });
    }
  };

  return (
    <div className="account-settings-container minimal">
      <h2 className="settings-title">Cài đặt tài khoản</h2>
      <form className="account-settings-form" onSubmit={handleSaveEmail} autoComplete="off">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
        </div>
        {/* {emailMessage && <div className="form-message">{emailMessage}</div>} */}
        <div className="save-btn-wrapper">
          <button type="submit" className="save-btn">Lưu email</button>
        </div>
      </form>
      <form className="account-settings-form" onSubmit={handleSavePassword} autoComplete="off">
        <div className="form-group current-password-group">
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" autoComplete="current-password" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu mới</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Để trống nếu không đổi" autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Để trống nếu không đổi" autoComplete="new-password" />
        </div>
        {/* {passwordMessage && <div className="form-message">{passwordMessage}</div>} */}
        <div className="save-btn-wrapper">
          <button type="submit" className="save-btn">Lưu mật khẩu</button>
        </div>
      </form>
    </div>
  );
}

export default AccountSettings;
