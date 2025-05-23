import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

function Login({ switchToRegister, onLogin }) {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: '',
        password: '',
        rememberMe: false,
        showPassword: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (prop) => (e) => {
        const value = prop === 'rememberMe' ? e.target.checked : e.target.value;
        setValues({ ...values, [prop]: value });
    };

    const toggleShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!values.email || !values.password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email, password: values.password })
            });

            let data = {};
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data.message = await res.text();
            }

            if (!res.ok) {
                setError(data.message || 'Đăng nhập thất bại');
            } else {
                if (typeof onLogin === 'function') {
                    onLogin(data.user);
                } else {
                    console.log('Đăng nhập thành công:', data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            }
        } catch (err) {
            console.error('Lỗi khi đăng nhập:', err);
            setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau.');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-left-panel">
                <div className="login-welcome">
                    <h1>Chào mừng bạn quay trở lại!</h1>
                    <p>Hệ thống luyện thi THPT Quốc gia hàng đầu Việt Nam</p>
                    <div className="welcome-features">
                        <div className="feature-item">
                            <i className="fas fa-book-open"></i>
                            <span>Ngân hàng đề thi phong phú</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-chart-line"></i>
                            <span>Phân tích chi tiết kết quả học tập</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-users"></i>
                            <span>Cộng đồng học tập sôi động</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right-panel">
                <div className="login-form-container">
                    <div className="login-logo">
                        <img src={logo} alt="Logo" />
                        <h2>Đăng nhập</h2>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-with-icon">
                                {/* <i className="fas fa-envelope"></i> */}
                                <input
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange('email')}
                                    placeholder="Địa chỉ email của bạn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                {/* <i className="fas fa-lock"></i> */}
                                <input
                                    type={values.showPassword ? "text" : "password"}
                                    value={values.password}
                                    onChange={handleChange('password')}
                                    placeholder="Mật khẩu của bạn"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={toggleShowPassword}
                                >
                                    <i className={`fas ${values.showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={values.rememberMe}
                                    onChange={handleChange('rememberMe')}
                                />
                                <label htmlFor="rememberMe">Nhớ mật khẩu</label>
                            </div>
                            <button
                                type="button"
                                className="forgot-password-btn"
                                onClick={() => alert("Tính năng quên mật khẩu đang được phát triển")}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 
                                <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</> : 
                                <><i className="fas fa-sign-in-alt"></i> Đăng nhập</>
                            }
                        </button>

                        <div className="register-option">
                            <p>Chưa có tài khoản?
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={switchToRegister}
                                >
                                    Đăng ký ngay
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
