import React, { useState, useEffect } from 'react';

function DashboardTab() {
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        exams: 0,
        questions: 0
    });
    
    const [recentActivities, setRecentActivities] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('week');
    
    useEffect(() => {
        // Simulate API call to fetch dashboard data
        const fetchDashboardData = async () => {
            // In a real application, this would be an API call
            setTimeout(() => {
                setStats({
                    users: 1245,
                    courses: 32,
                    exams: 78,
                    questions: 1650
                });
                
                setRecentActivities([
                    { id: 1, type: 'user', user: 'Nguyễn Văn A', action: 'đã đăng ký tài khoản', time: '10 phút trước' },
                    { id: 2, type: 'exam', user: 'Trần Thị B', action: 'đã hoàn thành bài thi Toán học', time: '30 phút trước' },
                    { id: 3, type: 'result', user: 'Lê Văn C', action: 'đạt 9.5/10 điểm trong bài thi Vật lý', time: '1 giờ trước' },
                    { id: 4, type: 'course', user: 'Admin', action: 'đã thêm khóa học mới: Luyện thi THPT Quốc Gia', time: '3 giờ trước' },
                    { id: 5, type: 'question', user: 'Phạm Thị D', action: 'đã báo cáo lỗi trong câu hỏi #1205', time: '5 giờ trước' },
                ]);
            }, 500);
        };
        
        fetchDashboardData();
    }, []);
    
    const getActivityIcon = (type) => {
        switch(type) {
            case 'user': return 'fas fa-user';
            case 'exam': return 'fas fa-file-alt';
            case 'result': return 'fas fa-chart-bar';
            case 'course': return 'fas fa-book';
            case 'question': return 'fas fa-question-circle';
            default: return 'fas fa-bell';
        }
    };

    // Mock data for the chart
    const chartData = {
        week: [65, 85, 40, 70, 55, 80, 90],
        month: [450, 380, 520, 490, 600, 580, 470, 540, 510, 590, 620, 500],
        year: [3500, 4200, 3800, 4500, 5100, 4800, 5600, 6100, 5800, 6500, 7000, 7500]
    };
    
    const getChartLabels = () => {
        if (chartPeriod === 'week') {
            return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        } else if (chartPeriod === 'month') {
            return ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 
                    'Tuần 7', 'Tuần 8', 'Tuần 9', 'Tuần 10', 'Tuần 11', 'Tuần 12'];
        } else {
            return ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        }
    };

    return (
        <div className="dashboard-content">
            <h1 className="content-title">Tổng quan hệ thống</h1>
            
            {/* Dashboard Stats Cards */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon users-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Tổng người dùng</h3>
                        <p>{stats.users.toLocaleString()}</p>
                        <div className="stat-trend positive">
                            <i className="fas fa-arrow-up"></i> 12% <span>so với tháng trước</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon courses-icon">
                        <i className="fas fa-book"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Khóa học</h3>
                        <p>{stats.courses}</p>
                        <div className="stat-trend positive">
                            <i className="fas fa-arrow-up"></i> 5% <span>so với tháng trước</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon tests-icon">
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Đề thi</h3>
                        <p>{stats.exams}</p>
                        <div className="stat-trend positive">
                            <i className="fas fa-arrow-up"></i> 8% <span>so với tháng trước</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon questions-icon">
                        <i className="fas fa-question-circle"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Câu hỏi</h3>
                        <p>{stats.questions.toLocaleString()}</p>
                        <div className="stat-trend positive">
                            <i className="fas fa-arrow-up"></i> 15% <span>so với tháng trước</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Dashboard Middle Section with Chart and Performance */}
            <div className="dashboard-middle">
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Thống kê người dùng truy cập</h3>
                        <div className="chart-actions">
                            <select 
                                value={chartPeriod} 
                                onChange={(e) => setChartPeriod(e.target.value)}
                            >
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                                <option value="year">Năm nay</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="chart-placeholder">
                        <div className="chart-bars">
                            {chartData[chartPeriod].map((value, index) => (
                                <div 
                                    key={index} 
                                    className="chart-bar" 
                                    style={{ height: `${(value / Math.max(...chartData[chartPeriod])) * 100}%` }}
                                >
                                    <span>{getChartLabels()[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="performance-container">
                    <h3>Hiệu suất hệ thống</h3>
                    
                    <div className="performance-metrics">
                        <div className="performance-metric">
                            <div className="metric-info">
                                <span>Tỷ lệ chuyển đổi</span>
                                <span className="metric-value">78%</span>
                            </div>
                            <div className="metric-bar">
                                <div className="metric-progress" style={{width: '78%', background: 'var(--primary-color)'}}></div>
                            </div>
                        </div>
                        
                        <div className="performance-metric">
                            <div className="metric-info">
                                <span>Thời gian phản hồi</span>
                                <span className="metric-value">92%</span>
                            </div>
                            <div className="metric-bar">
                                <div className="metric-progress" style={{width: '92%', background: 'var(--success-color)'}}></div>
                            </div>
                        </div>
                        
                        <div className="performance-metric">
                            <div className="metric-info">
                                <span>Tỷ lệ hoàn thành bài thi</span>
                                <span className="metric-value">65%</span>
                            </div>
                            <div className="metric-bar">
                                <div className="metric-progress" style={{width: '65%', background: 'var(--warning-color)'}}></div>
                            </div>
                        </div>
                        
                        <div className="performance-metric">
                            <div className="metric-info">
                                <span>Mức độ hài lòng</span>
                                <span className="metric-value">89%</span>
                            </div>
                            <div className="metric-bar">
                                <div className="metric-progress" style={{width: '89%', background: 'var(--primary-light)'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Recent Activities Section */}
            <div className="recent-activities">
                <div className="section-header">
                    <h3>Hoạt động gần đây</h3>
                    <button className="btn-view-all">Xem tất cả</button>
                </div>
                
                <div className="activity-list">
                    {recentActivities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                <i className={getActivityIcon(activity.type)}></i>
                            </div>
                            <div className="activity-details">
                                <p><strong>{activity.user}</strong> {activity.action}</p>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardTab;
