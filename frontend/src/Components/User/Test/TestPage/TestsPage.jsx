import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestsPage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function TestsTab() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');    const [filterStatus, setFilterStatus] = useState('all');
    const [testStats, setTestStats] = useState({
        total: 0,
        completed: 0,
        notStarted: 0
    });

    // Fetch tests from database
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);            try {
                // Get user data
                let userId = null;
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const userObj = JSON.parse(userStr);
                        userId = userObj._id;
                    } catch (e) {
                        console.error("Error parsing user data:", e);
                    }
                }

                // Fetch tests and user results in parallel
                const [testsResponse, resultsResponse] = await Promise.all([
                    axios.get('/api/tests'),
                    userId ? axios.get(`/api/tests/results?userId=${userId}`) : Promise.resolve({ data: { results: [] } })
                ]);
                
                if (testsResponse.data && testsResponse.data.tests) {
                    // Create a map of test results by test_id for quick lookup
                    const resultsByTestId = {};
                    if (resultsResponse.data && resultsResponse.data.results) {
                        resultsResponse.data.results.forEach(result => {
                            const testId = result.test_id?._id || result.test_id;
                            if (testId) {
                                // Keep only the most recent result for each test
                                if (!resultsByTestId[testId] || new Date(result.created_at) > new Date(resultsByTestId[testId].created_at)) {
                                    resultsByTestId[testId] = result;
                                }
                            }
                        });
                    }

                    // Map backend test data to component format
                    const mappedTests = testsResponse.data.tests.map(test => {
                        const userResult = resultsByTestId[test._id];
                        
                        return {
                            id: test._id,
                            title: test.title,
                            subject: test.subject,
                            // Determine status based on whether user has completed this test
                            status: userResult ? 'completed' : 'not_started',
                            score: userResult ? userResult.total_score : null,
                            questions: test.numQuestions,
                            duration: test.duration || 90,
                            description: test.description || `Đề thi ${test.title} môn ${test.subject} gồm ${test.numQuestions} câu hỏi.`,
                            completedDate: userResult ? new Date(userResult.created_at).toLocaleDateString('vi-VN') : null,
                            resultId: userResult ? userResult._id : null
                        };
                    });

                    setTests(mappedTests);
                      // Calculate stats
                    const stats = {
                        total: mappedTests.length,
                        completed: mappedTests.filter(test => test.status === 'completed').length,
                        notStarted: mappedTests.filter(test => test.status === 'not_started').length
                    };
                    
                    setTestStats(stats);
                      console.log('Tests loaded successfully:', mappedTests.length);
                } else {
                    console.error('Invalid response format:', testsResponse.data);
                    toast.error('Định dạng dữ liệu không hợp lệ');
                }
            } catch (error) {
                console.error('Failed to fetch tests:', error);
                toast.error('Không thể tải danh sách đề thi: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchTests();    }, []);

    // Filter tests based on search and filters
    const filteredTests = tests.filter(test => {
        return (
            (searchText === '' || 
                test.title.toLowerCase().includes(searchText.toLowerCase()) || 
                test.description.toLowerCase().includes(searchText.toLowerCase())) &&
            (filterSubject === 'all' || test.subject === filterSubject) &&
            (filterStatus === 'all' || test.status === filterStatus)
        );
    });

    const handleStartTest = (testId) => {
        console.log(`Starting test with ID: ${testId}`);
        // Navigate to test taking page with updated path
        navigate(`/student/test-taking/${testId}`);
    };
    
    const handleContinueTest = (testId) => {
        console.log(`Continuing test with ID: ${testId}`);
        // Navigate to test taking page with updated path
        navigate(`/student/test-taking/${testId}`);
    };
      const handleViewResult = (test) => {
        console.log(`Viewing results for test:`, test);
        // Navigate to test review page using resultId
        if (test.resultId) {
            navigate(`/student/test-review/${test.resultId}`);
        } else {
            toast.error('Không tìm thấy kết quả bài thi');
        }
    };const getStatusText = (status) => {
        switch(status) {
            case 'completed':
                return 'Đã hoàn thành';
            case 'not_started':
                return 'Chưa làm';
            default:
                return 'Không xác định';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'completed':
                return 'status-completed';
            case 'not_started':
                return 'status-not-started';
            default:
                return '';
        }
    };    const renderActionButton = (test) => {
        switch(test.status) {
            case 'completed':
                return (
                    <div className="action-buttons">
                        <button className="btn-test-action retry" onClick={() => handleStartTest(test.id)}>
                            <i className="fas fa-redo"></i> Làm lại bài thi
                        </button>
                        <button className="btn-test-action view-result secondary" onClick={() => handleViewResult(test)}>
                            <i className="fas fa-chart-bar"></i> Xem kết quả
                        </button>
                    </div>
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
            <h2 className="content-title">Đề thi</h2>            {/* Stats Section */}
            <div className="test-stats">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="stat-details">
                        <p>Tổng số đề thi</p>
                        <h3>{testStats.total}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-details">
                        <p>Đã hoàn thành</p>
                        <h3>{testStats.completed}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon not-started">
                        <i className="fas fa-hourglass"></i>
                    </div>
                    <div className="stat-details">
                        <p>Chưa làm</p>
                        <h3>{testStats.notStarted}</h3>
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
                        </select>                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="not_started">Chưa làm</option>
                        </select>
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

            {/* Table View */}
            {!loading && (
                <div className="tests-table-container">
                    <table className="tests-table">                        <thead>
                            <tr>
                                <th>Tên đề thi</th>
                                <th>Môn học</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Điểm số</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>                            {filteredTests.map(test => (
                                <tr key={test.id}>
                                    <td className="test-title-cell">
                                        <div className="test-title-content">
                                            <span>{test.title}</span>
                                        </div>
                                    </td>
                                    <td>{test.subject}</td>
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
