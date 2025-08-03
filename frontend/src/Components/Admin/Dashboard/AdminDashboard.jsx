import React, { useEffect, useState } from 'react';
import { getStats } from '../../../services/StatsService';
import StatsChart from './StatsChart';
import './AdminDashboard.css';

function AdminDashboard() {


    const [stats, setStats] = useState([
        {
            icon: 'fas fa-users users-icon',
            label: 'Người dùng',
            value: 0,
            trend: '+0%',
            trendType: 'positive',
        },
        {
            icon: 'fas fa-clipboard-check courses-icon',
            label: 'Lượt làm bài',
            value: 0,
            trend: '+0%',
            trendType: 'positive',
        },
        {
            icon: 'fas fa-chart-line questions-icon',
            label: 'Lượt truy cập',
            value: 0,
            trend: '+0%',
            trendType: 'positive',
        },
    ]);
    const [topUsers, setTopUsers] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [selectedType, setSelectedType] = useState('results'); // default: lượt làm bài

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats([
                    {
                        icon: 'fas fa-users users-icon',
                        label: 'Người dùng',
                        value: data.userCount || 0,
                        trend: '+0%',
                        trendType: 'positive',
                    },
                    {
                        icon: 'fas fa-clipboard-check courses-icon',
                        label: 'Lượt làm bài',
                        value: data.resultCount || 0,
                        trend: '+0%',
                        trendType: 'positive',
                    },
                    {
                        icon: 'fas fa-chart-line questions-icon',
                        label: 'Lượt truy cập',
                        value: data.visitCount || 0,
                        trend: '+0%',
                        trendType: 'positive',
                    },
                ]);
                // Debug: log topUsers avatar values
                if (Array.isArray(data.topUsers)) {
                    data.topUsers.forEach((user, idx) => {
                        console.log(`TopUser[${idx}].avatar:`, user.avatar);
                    });
                }
                setTopUsers(data.topUsers || []);
                setChartData(Array.isArray(data.chartData) ? data.chartData : []);
            } catch (err) {
                setChartData([]);
                // Có thể hiển thị thông báo lỗi ở đây nếu muốn
            }
        };
        fetchStats();
    }, []);





    return (
        <div className="dashboard-page">
            <h1 className="content-title">Bảng điều khiển quản trị</h1>
            {/* Quick Stats */}
            <div className="dashboard-stats">
                {stats.map((stat, idx) => (
                    <div className="stat-card" key={idx}>
                        <div className={`stat-icon ${stat.icon.split(' ')[2]}`}> 
                            <i className={stat.icon}></i>
                        </div>
                        <div className="stat-details">
                            <h3>{stat.label}</h3>
                            <p>{stat.value.toLocaleString()}</p>
                            <div className={`stat-trend ${stat.trendType}`}>
                                <i className={stat.trendType === 'positive' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                                {stat.trend}
                                <span>so với tuần trước</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-middle" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
                {/* Chart Overview */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Thống kê tổng quan</h3>
                        <div className="chart-actions" style={{ display: 'flex', gap: 10 }}>
                            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                                <option value="results">Lượt làm bài</option>
                                <option value="visits">Lượt truy cập</option>
                                <option value="users">Người dùng mới</option>
                            </select>
                            {/* Chỉ hiển thị 7 ngày qua, bỏ combobox chọn mốc thời gian */}
                        </div>
                    </div>
                    <StatsChart data={Array.isArray(chartData) ? chartData : []} type={selectedType} />
                </div>

                {/* Top 5 active users */}
                <div className="performance-container">
                    <div className="section-header">
                        <h3>Top 5 người dùng tích cực</h3>
                    </div>
                    <ul className="activity-list">
                        {topUsers.length === 0 ? (
                            <li className="activity-item" style={{alignItems: 'center', color: '#adb5bd'}}>
                                Không có dữ liệu
                            </li>
                        ) : (
                            topUsers.map((user, idx) => (
                                <li className="activity-item" key={idx} style={{alignItems: 'center'}}>
                                    <div className="activity-icon" style={{background: '#e0e7ff', color: '#3b5bdb', width: 40, height: 40}}>
                                    <img
                                        src={
                                            user.avatar
                                                ? user.avatar.startsWith('http')
                                                    ? user.avatar
                                                    : 'http://localhost:5000' + user.avatar
                                                : 'https://i.pravatar.cc/40?u=' + (user.userId || idx)
                                        }
                                        alt={user.name || 'Ẩn danh'}
                                        style={{width: 32, height: 32, borderRadius: '50%'}}
                                    />
                                    </div>
                                    <div className="activity-details" style={{flex: 1}}>
                                        <p style={{fontWeight: 600, marginBottom: 2}}>{user.name || 'Ẩn danh'}</p>
                                        <span className="activity-time">{user.count} lượt làm bài</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>


        </div>
    );
}

export default AdminDashboard;
