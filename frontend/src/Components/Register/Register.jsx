import React, { useState } from 'react';
import './Register.css';
import logo from '../../assets/logo.svg';
import { registerUser } from '../../services/UserService';

function Register({ switchToLogin }) {
    const [values, setValues] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        school: '',
        grade: '',
        showPassword: false,
        showConfirmPassword: false
    });
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const handleChange = (prop) => (e) => {
        setValues({ ...values, [prop]: e.target.value });
        if (prop === 'password' || prop === 'confirmPassword') {
            const password = prop === 'password' ? e.target.value : values.password;
            const confirmPassword = prop === 'confirmPassword' ? e.target.value : values.confirmPassword;
            // Kiểm tra lỗi mật khẩu và lỗi xác nhận riêng biệt
            let passErr = '';
            let confirmErr = '';
            if (password.length < 8) {
                passErr = 'Mật khẩu phải có ít nhất 8 ký tự';
            } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
                passErr = 'Mật khẩu phải gồm cả chữ và số';
            }
            if (confirmPassword && password !== confirmPassword) {
                confirmErr = 'Mật khẩu xác nhận không khớp';
            }
            setPasswordError(passErr);
            setConfirmPasswordError(confirmErr);
        }
        if (prop === 'email') {
            const email = e.target.value;
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                setEmailError('Email không hợp lệ');
            } else {
                setEmailError('');
            }
        }
        if (prop === 'name') {
            const name = e.target.value;
            if (/\d/.test(name)) {
                setNameError('Họ và tên không được chứa số');
            } else {
                setNameError('');
            }
        }
        if (prop === 'phone') {
            const phone = e.target.value;
            if (!/^\d{0,10}$/.test(phone)) {
                setPhoneError('Số điện thoại chỉ được chứa số');
            } else if (phone.length === 10 && !/^\d{10}$/.test(phone)) {
                setPhoneError('Số điện thoại không hợp lệ');
            } else {
                setPhoneError('');
            }
        }
    };

    // Lỗi xác nhận mật khẩu
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const toggleShowPassword = (field) => {
        if (field === 'password') {
            setValues({ ...values, showPassword: !values.showPassword });
        } else {
            setValues({ ...values, showConfirmPassword: !values.showConfirmPassword });
        }
    };

    const validatePassword = () => {
        if (values.password.length < 8) {
            return { pass: 'Mật khẩu phải có ít nhất 8 ký tự', confirm: '' };
        }
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(values.password)) {
            return { pass: 'Mật khẩu phải gồm cả chữ và số', confirm: '' };
        }
        if (values.password !== values.confirmPassword) {
            return { pass: '', confirm: 'Mật khẩu xác nhận không khớp' };
        }
        return { pass: '', confirm: '' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!values.username || !values.name || !values.email || !values.password || !values.confirmPassword || !values.phone || !values.school || !values.grade) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Validate trường học
        if (!values.school.trim()) {
            setError('Vui lòng nhập trường học');
            return;
        }

        // Validate họ tên
        if (/\d/.test(values.name)) {
            setNameError('Họ và tên không được chứa số');
            return;
        } else {
            setNameError('');
        }
        // Validate email
        if (!/^\S+@\S+\.\S+$/.test(values.email)) {
            setEmailError('Email không hợp lệ');
            return;
        } else {
            setEmailError('');
        }
        // Validate phone
        if (!/^\d{10}$/.test(values.phone)) {
            setPhoneError('Số điện thoại phải gồm đúng 10 số');
            return;
        } else {
            setPhoneError('');
        }

        const passwordErrObj = validatePassword();
        setPasswordError(passwordErrObj.pass || '');
        setConfirmPasswordError(passwordErrObj.confirm || '');
        if (passwordErrObj.pass || passwordErrObj.confirm) {
            // Không submit nếu lỗi mật khẩu
            return;
        }

        setError('');
        try {
            const data = await registerUser({
                username: values.username,
                name: values.name,
                email: values.email,
                password: values.password,
                phone: values.phone,
                school: values.school,
                grade: values.grade ? Number(values.grade) : undefined
            });
            if (data && (data.message === 'Email đã được sử dụng' || data.message === 'Username đã được sử dụng')) {
                setError(data.message);
                return;
            }
            if (!data.success && data.message) {
                setError(data.message);
                return;
            }
            setError('');
            // Hiển thị thông báo thành công, sau đó chuyển sang login
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            switchToLogin();
        } catch (err) {
            if (err && err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau.');
            }
        }
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
                                <input
                                    type="text"
                                    value={values.username}
                                    onChange={handleChange('username')}
                                    placeholder="Tên đăng nhập"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange('name')}
                                    placeholder="Họ và tên của bạn"
                                    required
                                />
                            </div>
                            {nameError && (
                                <div className="error" style={{ marginTop: 6, marginBottom: 0, textAlign: 'left' }}>{nameError}</div>
                            )}
                        </div>

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
                            {emailError && (
                                <div className="error" style={{ marginTop: 6, marginBottom: 0, textAlign: 'left' }}>{emailError}</div>
                            )}
                        </div>




                        <div className="form-group">
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    value={values.phone}
                                    onChange={handleChange('phone')}
                                    placeholder="Số điện thoại"
                                    maxLength={10}
                                    required
                                />
                            </div>
                            {phoneError && (
                                <div className="error" style={{ marginTop: 6, marginBottom: 0, textAlign: 'left' }}>{phoneError}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    value={values.school}
                                    onChange={handleChange('school')}
                                    placeholder="Trường học"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <select
                                    value={values.grade}
                                    onChange={handleChange('grade')}
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #e1e5eb', fontSize: '16px', color: values.grade ? '#333' : '#aaa' }}
                                >
                                    <option value="" disabled>Chọn khối lớp</option>
                                    <option value="10">Lớp 10</option>
                                    <option value="11">Lớp 11</option>
                                    <option value="12">Lớp 12</option>
                                </select>
                            </div>
                        </div>


                        <div className="form-group">
                            <div className="input-with-icon">
                                {/* <i className="fas fa-lock"></i> */}
                                <input
                                    type={values.showPassword ? "text" : "password"}
                                    value={values.password}
                                    onChange={handleChange('password')}
                                    placeholder="Mật khẩu (ít nhất 8 ký tự, gồm chữ và số)"
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
                            {passwordError && (
                                <div className="error" style={{ marginTop: 6, marginBottom: 0, textAlign: 'left' }}>{passwordError}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                {/* <i className="fas fa-lock"></i> */}
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
                            {confirmPasswordError && (
                                <div className="error" style={{ marginTop: 6, marginBottom: 0, textAlign: 'left' }}>{confirmPasswordError}</div>
                            )}
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
