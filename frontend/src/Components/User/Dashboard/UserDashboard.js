import React, { useState, useEffect, useRef, useMemo } from 'react';
import './UserDashboard.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { useStudyTimeTracker, useStudyDashboard } from '../../../hooks/useStudyTimeTracker';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

function UserDashboard() {
    // Sử dụng custom hooks cho study time tracking
    const { isTracking, todayStudyHours, startTracking, stopTracking } = useStudyTimeTracker();
    const { dashboardData, loading, error, refreshData } = useStudyDashboard(todayStudyHours);
    
    const [stats, setStats] = useState({
        exams: 0,
        timeSpent: 0
    });

    const [recentExams, setRecentExams] = useState([]);
    
    // State cho mục tiêu học tập
    const [selectedBlock, setSelectedBlock] = useState('A');
    const [goals, setGoals] = useState({
        A: { math: '', physics: '', chemistry: '' },
        A1: { math: '', physics: '', english: '' },
        B: { math: '', chemistry: '', biology: '' },
        C: { literature: '', history: '', geography: '' },
        D: { math: '', literature: '', english: '' }
    });
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    
    // State để force refresh biểu đồ mỗi phút
    const [chartRefreshKey, setChartRefreshKey] = useState(0);
    
    // Debug log để theo dõi giá trị todayStudyHours
    console.log('UserDashboard render - todayStudyHours:', todayStudyHours, 'formatted:', `${Math.floor(todayStudyHours)}:${Math.floor((todayStudyHours * 60) % 60).toString().padStart(2, '0')}`);
    console.log('Goals state:', goals, 'selectedBlock:', selectedBlock, 'isEditingGoals:', isEditingGoals);
    
    // Theo dõi thời gian học để refresh biểu đồ mỗi phút
    const previousMinutes = useRef(Math.floor(todayStudyHours * 60));
    
    useEffect(() => {
        const currentMinutes = Math.floor(todayStudyHours * 60);
        if (currentMinutes !== previousMinutes.current) {
            console.log('Study time changed from', previousMinutes.current, 'to', currentMinutes, 'minutes - refreshing chart');
            setChartRefreshKey(prev => prev + 1);
            previousMinutes.current = currentMinutes;
        }
    }, [todayStudyHours]);

    
    // Định nghĩa khối thi và môn học
    const examBlocks = {
        A: { name: 'Khối A', subjects: { math: 'Toán học', physics: 'Vật lý', chemistry: 'Hóa học' } },
        A1: { name: 'Khối A1', subjects: { math: 'Toán học', physics: 'Vật lý', english: 'Tiếng Anh' } },
        B: { name: 'Khối B', subjects: { math: 'Toán học', chemistry: 'Hóa học', biology: 'Sinh học' } },
        C: { name: 'Khối C', subjects: { literature: 'Ngữ văn', history: 'Lịch sử', geography: 'Địa lý' } },
        D: { name: 'Khối D', subjects: { math: 'Toán học', literature: 'Ngữ văn', english: 'Tiếng Anh' } }
    };

    // Hàm xử lý thay đổi mục tiêu
    const handleGoalChange = (subject, value) => {
        console.log('Goal change:', subject, value, 'for block:', selectedBlock);
        setGoals(prev => ({
            ...prev,
            [selectedBlock]: {
                ...prev[selectedBlock],
                [subject]: value
            }
        }));
    };

    // Hàm lưu mục tiêu
    const saveGoals = () => {
        // TODO: Gửi lên server để lưu
        console.log('Saving goals:', goals[selectedBlock]);
        setIsEditingGoals(false);
    };

    // Hàm hủy chỉnh sửa
    const cancelEdit = () => {
        // TODO: Reset về giá trị ban đầu từ server
        setIsEditingGoals(false);
    };

    // Lấy icon cho từng môn học
    const getSubjectIcon = (subject) => {
        const icons = {
            math: 'fas fa-calculator',
            physics: 'fas fa-atom',
            chemistry: 'fas fa-flask',
            biology: 'fas fa-dna',
            literature: 'fas fa-book',
            history: 'fas fa-landmark',
            geography: 'fas fa-globe',
            english: 'fas fa-language'
        };
        return icons[subject] || 'fas fa-book';
    };

    // Lấy màu cho từng môn học
    const getSubjectColor = (subject) => {
        const colors = {
            math: 'math',
            physics: 'physics',
            chemistry: 'chemistry',
            biology: 'biology',
            literature: 'literature',
            history: 'history',
            geography: 'geography',
            english: 'english'
        };
        return colors[subject] || 'math';
    };

    
    const getChartData = useMemo(() => {
        const data = dashboardData.weeklyStats?.map(day => day.hours) || [0, 0, 0, 0, 0, 0, 0];
        console.log('Chart data recalculated:', data, 'refresh key:', chartRefreshKey);
        return data;
    }, [dashboardData.weeklyStats, chartRefreshKey]);
    
    const getChartLabels = useMemo(() => {
        return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    }, []);

    // Chart.js configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y;
                        const hours = Math.floor(value);
                        const minutes = Math.floor((value - hours) * 60);
                        return `${hours}:${minutes.toString().padStart(2, '0')}`;
                    }
                }
            },
            datalabels: {
                display: true,
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: {
                    weight: '600',
                    size: 13,
                },
                formatter: function(value) {
                    const hours = Math.floor(value);
                    const minutes = Math.floor((value - hours) * 60);
                    return `${hours}:${minutes.toString().padStart(2, '0')}`;
                },
                offset: 4,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5, // Thiết lập max value cố định là 5
                grid: {
                    color: 'rgba(230, 235, 245, 0.8)',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 12,
                    },
                    callback: function(value) {
                        const hours = Math.floor(value);
                        const minutes = Math.floor((value - hours) * 60);
                        return `${hours}:${minutes.toString().padStart(2, '0')}`;
                    },
                    stepSize: 1, // Hiển thị từng đơn vị 1 giờ
                },
                border: {
                    display: false,
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 13,
                        weight: '600',
                    }
                },
                border: {
                    display: false,
                }
            }
        },
        elements: {
            bar: {
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                },
                borderSkipped: false,
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        }
    };

    const chartDataConfig = useMemo(() => ({
        labels: getChartLabels,
        datasets: [
            {
                label: 'Giờ học',
                data: getChartData,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#4361ee');
                    gradient.addColorStop(1, '#4895ef');
                    return gradient;
                },
                borderColor: 'transparent',
                borderWidth: 0,
                barThickness: 40,
                maxBarThickness: 50,
                hoverBackgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#3748d4');
                    gradient.addColorStop(1, '#3d7eea');
                    return gradient;
                },
            },
        ],
    }), [getChartData, getChartLabels, chartRefreshKey]);

    return (
        <div className="dashboard-content">
            <h1 className="content-title">Bảng điều khiển</h1>
            
            
            
            <div className="user-content-row single-column">
                <div className="user-section learning-progress full-width">
                    <div className="section-header">
                        <div className="section-title">
                            <h3>Thời gian truy cập trang web tuần này</h3>
                        </div>
                    </div>
                    
                    <div className="learning-stats">
                        <div className="stat-highlight">
                            <span className="stat-value">
                                {(() => {
                                    const totalHours = getChartData.reduce((a, b) => a + b, 0);
                                    const hours = Math.floor(totalHours);
                                    const minutes = Math.floor((totalHours - hours) * 60);
                                    return `${hours}:${minutes.toString().padStart(2, '0')}`;
                                })()}
                            </span>
                            <span className="stat-label">Tổng giờ học</span>
                        </div>
                        <div className="stat-highlight">
                            <span className="stat-value">{Math.floor(todayStudyHours)}:{Math.floor((todayStudyHours * 60) % 60).toString().padStart(2, '0')}</span>
                            <span className="stat-label">Hôm nay</span>
                        </div>
                        <div className="stat-highlight">
                            <span className="stat-value">
                                {(() => {
                                    const avgHours = getChartData.reduce((a, b) => a + b, 0) / getChartData.length;
                                    const hours = Math.floor(avgHours);
                                    const minutes = Math.floor((avgHours - hours) * 60);
                                    return `${hours}:${minutes.toString().padStart(2, '0')}`;
                                })()}
                            </span>
                            <span className="stat-label">Trung bình</span>
                        </div>
                    </div>
                    
                    <div className="chart-container">
                        <div className="chartjs-container">
                            <Bar key={chartRefreshKey} data={chartDataConfig} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
                
            
            <div className="user-section recent-exams-full">
                <div className="section-header">
                    <h3>Mục tiêu của bạn</h3>
                    <div className="goals-actions">
                        {!isEditingGoals ? (
                            <button className="btn-view-all" onClick={() => setIsEditingGoals(true)}>
                                Chỉnh sửa
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="btn-save" onClick={saveGoals}>
                                    Lưu
                                </button>
                                <button className="btn-cancel" onClick={cancelEdit}>
                                    Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Block Selection */}
                <div className="block-selection">
                    <div className="block-selector">
                        <label>Chọn khối thi:</label>
                        <select 
                            value={selectedBlock} 
                            onChange={(e) => setSelectedBlock(e.target.value)}
                            className="block-dropdown"
                        >
                            {Object.entries(examBlocks).map(([key, block]) => (
                                <option key={key} value={key}>{block.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Goals Cards */}
                <div className="goals-container">
                    <div className="goals-list">
                        {Object.entries(examBlocks[selectedBlock].subjects).map(([subjectKey, subjectName]) => (
                            <div key={subjectKey} className="goal-card">
                                <div className="goal-card-header">
                                    <div className={`subject-icon ${getSubjectColor(subjectKey)}`}>
                                        <i className={getSubjectIcon(subjectKey)}></i>
                                    </div>
                                    <div className="subject-name">
                                        <h4>{subjectName}</h4>
                                    </div>
                                </div>
                                
                                <div className="goal-input-section">
                                    <label>Mục tiêu điểm số:</label>
                                    {isEditingGoals ? (
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={goals[selectedBlock][subjectKey] || ''}
                                            onChange={(e) => handleGoalChange(subjectKey, e.target.value)}
                                            placeholder="Nhập điểm mục tiêu (0-10)"
                                            className="goal-input"
                                        />
                                    ) : (
                                        <div className="goal-display">
                                            {goals[selectedBlock][subjectKey] ? (
                                                <span className="goal-score">{goals[selectedBlock][subjectKey]} điểm</span>
                                            ) : (
                                                <span className="goal-empty">Chưa đặt mục tiêu</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
