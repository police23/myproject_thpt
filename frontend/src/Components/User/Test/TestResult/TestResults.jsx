import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './TestResults.css';

const TestResults = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        subject: 'all',
        timeRange: 'all',
        sort: 'newest'
    });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedTestHistory, setSelectedTestHistory] = useState([]);
    const [expandedTests, setExpandedTests] = useState(new Set());

    // Fetch results data
    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                
                // Get user data for authorization
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    throw new Error('Bạn cần đăng nhập để xem kết quả');
                }
                
                const userObj = JSON.parse(userStr);
                const config = { 
                    headers: { Authorization: `Bearer ${userObj.token}` }
                };
                
                console.log('User ID:', userObj._id);
                console.log('Sending request to /api/tests/results with token:', userObj.token ? 'Token exists' : 'No token');
                
                // Add userId as a query parameter for extra safety
                const response = await axios.get(`/api/tests/results?userId=${userObj._id}`, config);
                
                console.log('Results API full response:', response);
                
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Không thể tải kết quả bài thi');
                }
                
                const resultsData = response.data.results || [];
                console.log('Received results count:', resultsData.length);
                
                if (resultsData.length === 0) {
                    setResults([]);
                    setFilteredResults([]);
                    setSubjects([]);
                    setLoading(false);
                    return;
                }
                
                // Process and enrich the data
                const processedResults = await Promise.all(
                    resultsData.map(async (result) => {
                        // Fetch test details if not already included
                        let testDetails = result.test_id;
                        if (!testDetails || typeof testDetails === 'string') {
                            try {
                                const testResponse = await axios.get(`/api/tests/${result.test_id}`);
                                testDetails = testResponse.data.test;
                            } catch (err) {
                                console.error('Error fetching test details:', err);
                                testDetails = { title: 'Không xác định', subject: 'Không xác định' };
                            }
                        }
                        
                        // Format date without date-fns - use start_date if available, fallback to created_at
                        const dateToFormat = result.start_date || result.created_at;
                        const date = new Date(dateToFormat);
                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        
                        return {
                            ...result,
                            test: testDetails,
                            formattedDate
                        };
                    })
                );
                
                setResults(processedResults);
                setFilteredResults(processedResults);
                
                // Extract unique subjects
                const uniqueSubjects = [...new Set(processedResults.map(r => r.test.subject))];
                setSubjects(uniqueSubjects);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching results:", error);
                console.error("Error response data:", error.response?.data);
                setError(error.message || 'Đã xảy ra lỗi khi tải kết quả');
                setLoading(false);
                toast.error("Không thể tải dữ liệu kết quả bài thi: " + (error.response?.data?.message || error.message));
            }
        };
        
        fetchResults();
    }, []);

    // Apply filters when changed
    useEffect(() => {
        if (results.length === 0) return;
        
        let filtered = [...results];
        
        // Apply subject filter
        if (filters.subject !== 'all') {
            filtered = filtered.filter(r => r.test.subject === filters.subject);
        }
        
        // Apply time range filter
        if (filters.timeRange !== 'all') {
            const now = new Date();
            const cutoffDate = new Date();
            
            switch (filters.timeRange) {
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    break;
            }
            
            filtered = filtered.filter(r => new Date(r.created_at) >= cutoffDate);
        }
        
        // Apply sorting
        switch (filters.sort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'score_high':
                filtered.sort((a, b) => b.total_score - a.total_score);
                break;
            case 'score_low':
                filtered.sort((a, b) => a.total_score - b.total_score);
                break;
            default:
                break;
        }
        
        setFilteredResults(filtered);
        
    }, [filters, results]);

    // Group results by test for display
    const getDisplayResults = () => {
        // Always use grouped view
        // Group by test_id
        const grouped = {};
        filteredResults.forEach(result => {
            const testId = result.test._id;
            if (!grouped[testId]) {
                grouped[testId] = [];
            }
            grouped[testId].push(result);
        });

        // Convert to array with latest result as representative
        return Object.values(grouped).map(attempts => {
            // Sort by start_date (earliest first for correct attempt numbering)
            const sortedAttempts = attempts.sort((a, b) => new Date(a.start_date || a.created_at) - new Date(b.start_date || b.created_at));
            const latestAttempt = sortedAttempts[sortedAttempts.length - 1]; // Get the latest attempt for display
            
            // Ensure each attempt has its own formatted date and attempt number
            const attemptsWithFormattedDates = sortedAttempts.map((attempt, index) => {
                if (!attempt.formattedDate) {
                    const date = new Date(attempt.start_date || attempt.created_at);
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    return { ...attempt, formattedDate, attemptNumber: index + 1 };
                }
                return { ...attempt, attemptNumber: index + 1 };
            });
            
            return {
                ...latestAttempt,
                attemptCount: attempts.length,
                allAttempts: attemptsWithFormattedDates
            };
        });
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };    // Handle expanding/collapsing test history
    const toggleTestExpansion = (testId) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(testId)) {
            newExpanded.delete(testId);
        } else {
            newExpanded.add(testId);
        }
        setExpandedTests(newExpanded);
    };

    // Navigate to detailed result view
    const viewResultDetail = (resultId) => {
        navigate(`/student/test-review/${resultId}`);
    };

    // Handle error retry
    const handleRetry = () => {
        setLoading(true);
        setError(null);
        // This will trigger the useEffect to fetch data again
    };

    if (loading) {
        return (
            <div className="results-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu kết quả...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="results-error">
                <h3>Có lỗi xảy ra</h3>
                <p>{error}</p>
                <button onClick={handleRetry} className="btn-retry">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="test-results-container">
            <div className="results-header">
                <div className="results-title">
                    <h2>Kết quả các bài thi đã làm</h2>
                    <p>
                        Tổng số: <strong>{filteredResults.length}</strong> bài thi
                    </p>
                </div>
            </div>

            <div className="results-filters">
                <div className="filter-group">
                    <label htmlFor="subject">Môn học:</label>
                    <select 
                        id="subject" 
                        name="subject" 
                        value={filters.subject} 
                        onChange={handleFilterChange}
                    >
                        <option value="all">Tất cả môn học</option>
                        {subjects.map((subject, index) => (
                            <option key={index} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="timeRange">Thời gian:</label>
                    <select 
                        id="timeRange" 
                        name="timeRange" 
                        value={filters.timeRange} 
                        onChange={handleFilterChange}
                    >
                        <option value="all">Tất cả thời gian</option>
                        <option value="week">7 ngày qua</option>
                        <option value="month">30 ngày qua</option>
                        <option value="quarter">3 tháng qua</option>
                        <option value="year">1 năm qua</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="sort">Sắp xếp:</label>
                    <select 
                        id="sort" 
                        name="sort" 
                        value={filters.sort} 
                        onChange={handleFilterChange}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="score_high">Điểm cao nhất</option>
                        <option value="score_low">Điểm thấp nhất</option>
                    </select>
                </div>
            </div>

            <div className="results-table-container">
                {getDisplayResults().length > 0 ? (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Tên đề thi</th>
                                <th>Môn học</th>
                                <th>Điểm (Cao nhất)</th>
                                <th>Ngày thi (Gần nhất)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {getDisplayResults().map((result, index) => {
                                const correctAnswers = result.answers?.filter(a => a.is_correct)?.length || 0;
                                const totalQuestions = result.answers?.length || 0;
                                
                                let displayInfo;
                                if (result.attemptCount > 1) {
                                    // For multiple attempts, show best score
                                    const bestScore = Math.max(...result.allAttempts.map(a => a.total_score || 0));
                                    displayInfo = {
                                        score: bestScore,
                                        attemptInfo: result.attemptCount,
                                        showHistoryButton: true
                                    };
                                } else {
                                    // For single attempt
                                    displayInfo = {
                                        score: result.total_score,
                                        attemptInfo: result.attemptCount || 1,
                                        showHistoryButton: false
                                    };
                                }
                                return (
                                    <>
                                        <tr key={result._id}>
                                            <td>{result.test.title}</td>
                                            <td>{result.test.subject}</td>
                                            <td>
                                                <div className="score-bubble">
                                                    {displayInfo.score}
                                                </div>
                                            </td>
                                            <td>{result.formattedDate}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {displayInfo.showHistoryButton ? (
                                                        <button 
                                                            className="btn-expand" 
                                                            onClick={() => toggleTestExpansion(result.test._id)}
                                                        >
                                                            <i className={`fas fa-chevron-${expandedTests.has(result.test._id) ? 'up' : 'down'}`}></i>
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn-view-result" 
                                                            onClick={() => viewResultDetail(result._id)}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Expanded history rows */}
                                        {expandedTests.has(result.test._id) && result.allAttempts && 
                                            result.allAttempts.map((attempt, attemptIndex) => {
                                                const correctAnswers = attempt.answers?.filter(a => a.is_correct)?.length || 0;
                                                const totalQuestions = attempt.answers?.length || 0;
                                                
                                                return (
                                                    <tr key={`${result._id}-attempt-${attemptIndex}`} className="expanded-row">
                                                        <td className="expanded-cell">
                                                            <span className="expanded-indicator">└─</span>
                                                            Lần {attempt.attemptNumber || (attemptIndex + 1)}
                                                        </td>
                                                        <td></td>
                                                        <td>
                                                            <div className="score-bubble small">
                                                                {attempt.total_score}
                                                            </div>
                                                        </td>
                                                        <td>{attempt.formattedDate}</td>
                                                        <td>
                                                            <button 
                                                                className="btn-view-result small" 
                                                                onClick={() => viewResultDetail(attempt._id)}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-results">
                        <p>Không có kết quả nào phù hợp với bộ lọc.</p>
                        <button 
                            className="btn-reset-filters"
                            onClick={() => setFilters({
                                subject: 'all',
                                timeRange: 'all',
                                sort: 'newest'
                            })}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestResults;
