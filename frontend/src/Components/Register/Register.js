import React, { useState } from 'react';
import './Register.css';
import logo from '../../assets/logo.svg';

function Register({ switchToLogin }) {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
    });
    const [error, setError] = useState('');

    const handleChange = (prop) => (e) => {
        setValues({ ...values, [prop]: e.target.value });
    };

    const toggleShowPassword = (field) => {
        if (field === 'password') {
            setValues({ ...values, showPassword: !values.showPassword });
        } else {
            setValues({ ...values, showConfirmPassword: !values.showConfirmPassword });
        }
    };

    const validatePassword = () => {
        if (values.password.length < 6) {
            return 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (values.password !== values.confirmPassword) {
            return 'Mật khẩu xác nhận không khớp';
        }
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Kiểm tra các trường đã được nhập đầy đủ
        if (!values.name || !values.email || !values.password || !values.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Kiểm tra mật khẩu
        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setError('');
        // TODO: Gửi request đăng ký tới backend ở đây
        alert(`Đăng ký với email: ${values.email}`);
    };

    return (
        <div className="register-container">
            <div className="register-left-panel">
                <div className="register-welcome">
                    <h1>Bắt đầu hành trình học tập của bạn!</h1>
                    <p>Đăng ký để truy cập đầy đủ các khóa học và tài liệu luyện thi THPT Quốc gia</p>
                </div>
            </div>

            <div className="register-right-panel">
                <div className="register-form-container">
                    <div className="register-logo">
                        <img src={logo} alt="Logo" />
                        <h2>Đăng ký tài khoản</h2>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-with-icon">
                                <i className="fas fa-user"></i>
                                <input
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange('name')}
                                    placeholder="Họ và tên của bạn"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => toggleShowPassword('password')}
                                >
                                    <i className={`fas ${values.showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <i className="fas fa-lock"></i>
                                <input
                                    type={values.showConfirmPassword ? "text" : "password"}
                                    value={values.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => toggleShowPassword('confirm')}
                                >
                                    <i className={`fas ${values.showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="register-button">Đăng ký</button>

                        <div className="login-option">
                            <p>Đã có tài khoản?
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={switchToLogin}
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
