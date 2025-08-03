import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword({ onBack }) {
    const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP, 3: đặt lại mật khẩu
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setOtpSent(true);
            setStep(2);
        } catch (err) {
            setError(err?.response?.data?.message || 'Không gửi được OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/verify-otp', { email, otp });
            setOtpVerified(true);
            setStep(3);
        } catch (err) {
            setError(err?.response?.data?.message || 'OTP không hợp lệ');
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { email, newPassword });
            setStep(1);
            setEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setOtpSent(false);
            setOtpVerified(false);
            alert('Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.');
            if (onBack) onBack();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không đặt lại được mật khẩu');
        }
        setLoading(false);
    };

    return (
        <form className="login-form" onSubmit={
            step === 1 ? handleForgotPassword :
            step === 2 ? handleVerifyOtp :
            handleResetPassword
        }>
            {error && <div className="error">{error}</div>}
            {step === 1 && (
                <>
                    <div className="form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</> : 'Gửi mã OTP'}
                    </button>
                    <button type="button" className="link-button" onClick={onBack}>
                        Quay lại đăng nhập
                    </button>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="form-group">
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="Nhập mã OTP vừa nhận"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Đang xác thực...</> : 'Xác thực OTP'}
                    </button>
                    <button type="button" className="link-button" onClick={() => setStep(1)}>
                        Quay lại nhập email
                    </button>
                </>
            )}
            {step === 3 && (
                <>
                    <div className="form-group">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Xác nhận mật khẩu mới"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Đang đặt lại...</> : 'Đặt lại mật khẩu'}
                    </button>
                </>
            )}
        </form>
    );
}

export default ForgotPassword;
