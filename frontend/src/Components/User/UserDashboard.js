import React from 'react';
import './UserDashboard.css';

function UserDashboard({ onLogout }) {
    return (
        <div className="user-dashboard">
            <header className="user-header">
                <div className="user-info">
                    <img src="https://via.placeholder.com/48" alt="User Avatar" className="user-avatar" />
                    <div>
                        <h2>Chào mừng bạn trở lại!</h2>
                        <p>Chúc bạn học tập hiệu quả và đạt kết quả cao.</p>
                    </div>
                </div>
                <button className="user-logout-btn" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
            </header>
            <main className="user-main">
                <section className="user-section">
                    <h3>Khóa học của bạn</h3>
                    <div className="user-courses">
                        <div className="course-card">
                            <h4>Toán THPT</h4>
                            <p>Tiến độ: 70%</p>
                            <button>Xem chi tiết</button>
                        </div>
                        <div className="course-card">
                            <h4>Văn THPT</h4>
                            <p>Tiến độ: 40%</p>
                            <button>Xem chi tiết</button>
                        </div>
                        <div className="course-card">
                            <h4>Tiếng Anh THPT</h4>
                            <p>Tiến độ: 85%</p>
                            <button>Xem chi tiết</button>
                        </div>
                    </div>
                </section>
                <section className="user-section">
                    <h3>Đề thi gần đây</h3>
                    <ul className="user-exams">
                        <li>
                            <span>Toán 2023</span>
                            <span>Điểm: 8.5</span>
                            <button>Xem lại</button>
                        </li>
                        <li>
                            <span>Văn 2023</span>
                            <span>Điểm: 7.0</span>
                            <button>Xem lại</button>
                        </li>
                        <li>
                            <span>Tiếng Anh 2023</span>
                            <span>Điểm: 9.0</span>
                            <button>Xem lại</button>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default UserDashboard;
