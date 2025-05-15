import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.svg';
// Thêm useNavigate để điều hướng
import { useNavigate } from 'react-router-dom';

function Login({ switchToRegister, onLogin, loginAsAdmin }) {
    const navigate = useNavigate(); // Hook để điều hướng
    const [values, setValues] = useState({
        email: '',
        password: '',
        rememberMe: false,
        showPassword: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('');
    const [dbStatus, setDbStatus] = useState('');

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
            const res = await fetch('http://localhost:5000/api/login', {
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
                // Nếu onLogin được cung cấp, gọi nó - UI sẽ được cập nhật thông qua context/state
                if (typeof onLogin === 'function') {
                    onLogin(data.user);
                } else {
                    console.log('Đăng nhập thành công:', data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // KHÔNG cần alert và navigate ở đây nữa, App.js sẽ xử lý
                    // Chuyển hướng sẽ được xử lý tự động bởi useEffect trong App.js
                }
            }
        } catch (err) {
            console.error('Lỗi thực tế khi đăng nhập:', err);
            setError('Có lỗi xảy ra khi xử lý phản hồi từ máy chủ.');
        }
        setLoading(false);
    };

    // Hàm kiểm tra kết nối server
    const checkServer = async () => {
        setServerStatus('Đang kiểm tra...');
        try {
            const res = await fetch('http://localhost:5000/api/ping');
            if (res.ok) {
                setServerStatus('Kết nối server thành công!');
            } else {
                setServerStatus('Không kết nối được server!');
            }
        } catch (err) {
            setServerStatus('Không kết nối được server!');
        }
    };

    // Hàm kiểm tra database
    const checkDatabase = async () => {
        setDbStatus('Đang kiểm tra...');
        try {
            const res = await fetch('http://localhost:5000/api/debug');
            if (res.ok) {
                const data = await res.json();
                setDbStatus(`Database: ${data.dbConnected ? 'Kết nối OK' : 'KO kết nối'}, Users: ${data.usersInDB}`);
            } else {
                setDbStatus('Không kiểm tra được database!');
            }
        } catch (err) {
            setDbStatus('Lỗi khi kiểm tra database!');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left-panel">
                <div className="login-welcome">
                    <h1>Chào mừng bạn quay trở lại!</h1>
                    <p>Hệ thống luyện thi THPT Quốc gia hàng đầu Việt Nam</p>
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
                                <i className="fas fa-envelope"></i>
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
                                <i className="fas fa-lock"></i>
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
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>

                        {/* Button demo để đăng nhập nhanh vào trang admin */}
                        <button
                            type="button"
                            className="demo-button"
                            onClick={loginAsAdmin}
                        >
                            Demo: Đăng nhập với quyền Admin
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

                    <button
                        type="button"
                        style={{ marginBottom: 10 }}
                        onClick={checkServer}
                    >
                        Kiểm tra kết nối server
                    </button>
                    {serverStatus && <div style={{ color: serverStatus.includes('thành công') ? 'green' : 'red' }}>{serverStatus}</div>}

                    <button
                        type="button"
                        style={{ marginBottom: 10 }}
                        onClick={checkDatabase}
                    >
                        Kiểm tra database
                    </button>
                    {dbStatus && <div style={{ color: dbStatus.includes('OK') ? 'green' : 'red' }}>{dbStatus}</div>}
                </div>
            </div>
        </div>
    );
}

export default Login;
