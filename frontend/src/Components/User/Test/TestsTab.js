import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestsTab.css';
import { toast } from 'react-toastify';

function TestsTab() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [searchText, setSearchText] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [testStats, setTestStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0
    });

    // Fetch tests from database
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                // Real API call to backend
                const response = await axios.get('/api/tests');
                
                if (response.data && response.data.tests) {
                    // Map backend test data to component format
                    const mappedTests = response.data.tests.map(test => ({
                        id: test._id,
                        title: test.title,
                        subject: test.subject,
                        // Map difficulty based on numQuestions or other factors
                        difficulty: getDifficultyByQuestionCount(test.numQuestions),
                        // Default status is not_started, will be updated with user progress data
                        status: 'not_started',
                        score: null,
                        questions: test.numQuestions,
                        duration: test.duration || 90,
                        image: getSubjectImage(test.subject),
                        description: test.description || `Đề thi ${test.title} môn ${test.subject} gồm ${test.numQuestions} câu hỏi.`
                    }));
                    
                    // TODO: In a real app, you would fetch user progress data and update status and score accordingly
                    // For each user test attempt, update the corresponding test status and score

                    setTests(mappedTests);
                    
                    // Calculate stats
                    const stats = {
                        total: mappedTests.length,
                        completed: mappedTests.filter(test => test.status === 'completed').length,
                        inProgress: mappedTests.filter(test => test.status === 'in_progress').length,
                        notStarted: mappedTests.filter(test => test.status === 'not_started').length
                    };
                    
                    setTestStats(stats);
                    
                    console.log('Tests loaded successfully:', mappedTests.length);
                } else {
                    console.error('Invalid response format:', response.data);
                    toast.error('Định dạng dữ liệu không hợp lệ');
                }
            } catch (error) {
                console.error('Failed to fetch tests:', error);
                toast.error('Không thể tải danh sách đề thi: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    // Helper function to determine difficulty based on question count
    const getDifficultyByQuestionCount = (count) => {
        if (!count) return 'Trung bình';
        if (count < 30) return 'Dễ';
        if (count > 50) return 'Khó';
        return 'Trung bình';
    };

    // Helper function to get image based on subject
    const getSubjectImage = (subject) => {
        // Default subject images
        const subjectImages = {
            'Toán': 'https://via.placeholder.com/150?text=Toán',
            'Vật lý': 'https://via.placeholder.com/150?text=Lý',
            'Hóa học': 'https://via.placeholder.com/150?text=Hóa',
            'Sinh học': 'https://via.placeholder.com/150?text=Sinh',
            'Ngữ văn': 'https://via.placeholder.com/150?text=Văn',
            'Tiếng Anh': 'https://via.placeholder.com/150?text=Anh',
            'Lịch sử': 'https://via.placeholder.com/150?text=Sử',
            'Địa lý': 'https://via.placeholder.com/150?text=Địa',
            'GDCD': 'https://via.placeholder.com/150?text=GDCD'
        };
        
        return subjectImages[subject] || 'https://via.placeholder.com/150?text=Đề thi';
    };

    // Filter tests based on search and filters
    const filteredTests = tests.filter(test => {
        return (
            (searchText === '' || 
                test.title.toLowerCase().includes(searchText.toLowerCase()) || 
                test.description.toLowerCase().includes(searchText.toLowerCase())) &&
            (filterSubject === 'all' || test.subject === filterSubject) &&
            (filterDifficulty === 'all' || test.difficulty === filterDifficulty) &&
            (filterStatus === 'all' || test.status === filterStatus)
        );
    });

    const handleStartTest = (testId) => {
        console.log(`Starting test with ID: ${testId}`);
        // Navigate to test taking page
        // In a real app you would use react-router here
        // history.push(`/student/tests/${testId}`);
    };
    
    const handleContinueTest = (testId) => {
        console.log(`Continuing test with ID: ${testId}`);
        // Navigate to test taking page with saved progress
        // history.push(`/student/tests/${testId}/continue`);
    };
    
    const handleViewResult = (testId) => {
        console.log(`Viewing results for test ID: ${testId}`);
        // Navigate to test results page
        // history.push(`/student/tests/${testId}/results`);
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'completed':
                return 'Đã hoàn thành';
            case 'in_progress':
                return 'Đang làm';
            case 'not_started':
                return 'Chưa bắt đầu';
            default:
                return 'Không xác định';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'completed':
                return 'status-completed';
            case 'in_progress':
                return 'status-in-progress';
            case 'not_started':
                return 'status-not-started';
            default:
                return '';
        }
    };

    const getDifficultyClass = (difficulty) => {
        switch(difficulty) {
            case 'Dễ':
                return 'difficulty-easy';
            case 'Trung bình':
                return 'difficulty-medium';
            case 'Khó':
                return 'difficulty-hard';
            default:
                return '';
        }
    };

    const renderActionButton = (test) => {
        switch(test.status) {
            case 'completed':
                return (
                    <button className="btn-test-action view-result" onClick={() => handleViewResult(test.id)}>
                        <i className="fas fa-chart-bar"></i> Xem kết quả
                    </button>
                );
            case 'in_progress':
                return (
                    <button className="btn-test-action continue" onClick={() => handleContinueTest(test.id)}>
                        <i className="fas fa-play-circle"></i> Tiếp tục làm
                    </button>
                );
            case 'not_started':
            default:
                return (
                    <button className="btn-test-action start" onClick={() => handleStartTest(test.id)}>
                        <i className="fas fa-edit"></i> Bắt đầu làm bài
                    </button>
                );
        }
    };

    return (
        <div className="tests-tab">
            <h2 className="content-title">Đề thi</h2>

            {/* Stats Section */}
            <div className="test-stats">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{testStats.total}</h3>
                        <p>Tổng số đề thi</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{testStats.completed}</h3>
                        <p>Đã hoàn thành</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon in-progress">
                        <i className="fas fa-spinner"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{testStats.inProgress}</h3>
                        <p>Đang làm</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon not-started">
                        <i className="fas fa-hourglass"></i>
                    </div>
                    <div className="stat-details">
                        <h3>{testStats.notStarted}</h3>
                        <p>Chưa bắt đầu</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="tests-controls">
                <div className="left-controls">
                    <div className="search-box">
                        <i className="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm đề thi..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchText('')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className="right-controls">
                    <div className="filter-container">
                        <select 
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tất cả môn học</option>
                            <option value="Toán">Toán học</option>
                            <option value="Vật lý">Vật lý</option>
                            <option value="Hóa học">Hóa học</option>
                            <option value="Sinh học">Sinh học</option>
                            <option value="Ngữ văn">Ngữ văn</option>
                            <option value="Lịch sử">Lịch sử</option>
                            <option value="Địa lý">Địa lý</option>
                            <option value="Tiếng Anh">Tiếng Anh</option>
                        </select>

                        <select 
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tất cả độ khó</option>
                            <option value="Dễ">Dễ</option>
                            <option value="Trung bình">Trung bình</option>
                            <option value="Khó">Khó</option>
                        </select>

                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="in_progress">Đang làm</option>
                            <option value="not_started">Chưa bắt đầu</option>
                        </select>
                    </div>
                    
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setViewMode('card')}
                            title="Xem dạng thẻ"
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Xem dạng bảng"
                        >
                            <i className="fas fa-table"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Show loading state */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải đề thi...</p>
                </div>
            )}

            {/* No tests found */}
            {!loading && filteredTests.length === 0 && (
                <div className="no-tests">
                    <i className="fas fa-search"></i>
                    <h3>Không tìm thấy đề thi</h3>
                    <p>Vui lòng thử lại với bộ lọc khác.</p>
                </div>
            )}

            {/* Card View */}
            {viewMode === 'card' && !loading && (
                <div className="tests-grid">
                    {filteredTests.map(test => (
                        <div className="test-card" key={test.id}>
                            <div className="test-card-header">
                                <img src={test.image} alt={test.subject} className="test-image" />
                                <div className="test-badges">
                                    <span className={`difficulty-badge ${getDifficultyClass(test.difficulty)}`}>
                                        {test.difficulty}
                                    </span>
                                    <span className={`status-badge ${getStatusClass(test.status)}`}>
                                        {getStatusText(test.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="test-card-body">
                                <h3 className="test-title">{test.title}</h3>
                                <div className="test-info">
                                    <div className="info-item">
                                        <i className="fas fa-book"></i> {test.subject}
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-question-circle"></i> {test.questions} câu hỏi
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-clock"></i> {test.duration} phút
                                    </div>
                                </div>
                                
                                {test.status === 'completed' && (
                                    <div className="test-score">
                                        <span className="score-label">Điểm số:</span>
                                        <span className="score-value">{test.score}</span>
                                        <span className="score-date">
                                            <i className="fas fa-calendar-alt"></i> {test.completedDate}
                                        </span>
                                    </div>
                                )}
                                
                                {test.status === 'in_progress' && (
                                    <div className="test-progress">
                                        <div className="progress-container">
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: `${test.completionPercent}%` }}></div>
                                            </div>
                                            <span className="progress-text">{test.completionPercent}%</span>
                                        </div>
                                    </div>
                                )}
                                
                                <p className="test-description">{test.description}</p>
                            </div>
                            <div className="test-card-footer">
                                {renderActionButton(test)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && !loading && (
                <div className="tests-table-container">
                    <table className="tests-table">
                        <thead>
                            <tr>
                                <th>Tên đề thi</th>
                                <th>Môn học</th>
                                <th>Độ khó</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Điểm số</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.map(test => (
                                <tr key={test.id}>
                                    <td className="test-title-cell">
                                        <div className="test-title-content">
                                            <img src={test.image} alt={test.subject} className="test-mini-image" />
                                            <span>{test.title}</span>
                                        </div>
                                    </td>
                                    <td>{test.subject}</td>
                                    <td>
                                        <span className={`difficulty-badge ${getDifficultyClass(test.difficulty)}`}>
                                            {test.difficulty}
                                        </span>
                                    </td>
                                    <td>{test.duration} phút</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(test.status)}`}>
                                            {getStatusText(test.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {test.status === 'completed' ? (
                                            <span className="score">{test.score}</span>
                                        ) : (
                                            <span className="no-score">-</span>
                                        )}
                                    </td>
                                    <td className="action-cell">
                                        {renderActionButton(test)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TestsTab;
