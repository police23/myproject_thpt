import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import './TestTaking.css';

// Helper function for rendering LaTeX content
function renderMixedContent(content) {
    if (!content) return null;
    
    // Convert to string if not already
    const contentStr = String(content);
    
    // Check if content has LaTeX delimiters ($ signs or other LaTeX markers)
    const hasDelimiters = /\$\$|\$|\\\(|\\\)|\\\[|\\\]/.test(contentStr);
    
    // If no delimiters, render as plain text
    if (!hasDelimiters) {
        return <span>{contentStr}</span>;
    }
    
    try {
        // Split by LaTeX delimiters and render each part appropriately
        const parts = contentStr.split(/(\$.*?\$)/g);
        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                try {
                    // Extract LaTeX content between $ signs
                    const formula = part.substring(1, part.length - 1);
                    return <InlineMath key={index} math={formula} />;
                } catch (error) {
                    console.error("Error rendering LaTeX formula:", error, "Formula:", part);
                    return <span key={index}>{part}</span>;
                }
            }
            // Plain text part
            return <span key={index}>{part}</span>;
        });
    } catch (error) {
        console.error("Error processing mixed content:", error, "Original content:", contentStr);
        return <span>{contentStr}</span>;
    }
}

const TestTaking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [questionsByType, setQuestionsByType] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [questionMap, setQuestionMap] = useState({}); // Add this line to store question ID mappings

    // Fetch exam data
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/tests/${id}`);
                const data = response.data;

                if (!data.success) {
                    throw new Error(data.message || 'Không thể tải thông tin đề thi');
                }

                if (!data.test) {
                    throw new Error('Không tìm thấy đề thi hoặc dữ liệu trả về không hợp lệ');
                }

                // Check test data structure
                const test = data.test;
                
                if (!test.sections || !Array.isArray(test.sections)) {
                    console.error("Dữ liệu sections không hợp lệ:", test.sections);
                    throw new Error('Cấu trúc đề thi không hợp lệ: thiếu phần sections');
                }

                setExam(test);
                setTimeLeft(test.duration * 60);

                // Organize questions by type for the navigation panel
                const qByType = {};
                let questionIndex = 0;
                const qMap = {}; // Create a mapping between index and question ID

                test.sections.forEach(section => {
                    if (!section) {
                        console.warn("Phát hiện section không hợp lệ");
                        return; // Skip invalid section
                    }

                    if (!section.type) {
                        console.warn("Section thiếu thông tin type:", section);
                        return; // Skip section without type
                    }

                    if (!qByType[section.type]) {
                        qByType[section.type] = [];
                    }

                    if (!section.questions || !Array.isArray(section.questions)) {
                        console.warn(`Section ${section.title || 'không tên'} không có questions hợp lệ`);
                        return;
                    }

                    section.questions.forEach(question => {
                        if (!question) return; // Skip null/undefined questions
                        
                        qByType[section.type].push({
                            ...question,
                            globalIndex: questionIndex
                        });
                        
                        // Store the mapping between question index and question ID
                        qMap[questionIndex] = question._id;
                        
                        questionIndex++;
                    });
                });

                setQuestionsByType(qByType);
                setQuestionMap(qMap); // Save the mapping
                setLoading(false);
            } catch (error) {
                console.error("Error fetching exam data:", error);
                setError(error.message || 'Đã xảy ra lỗi khi tải đề thi');
                setLoading(false);
            }
        };

        fetchExamData();
    }, [id]);

    useEffect(() => {
        if (!examStarted || !timeLeft) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinishExam(); // Auto-submit when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeLeft]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startExam = () => {
        setExamStarted(true);
        toast.info("Bài thi đã bắt đầu. Chúc bạn làm bài tốt!");
    };

    const handleAnswerSelection = (questionIdx, answerIdx) => {
        const questionId = questionMap[questionIdx];
        setAnswers({
            ...answers,
            [questionId]: answerIdx
        });
    };

    const handleTFAnswerSelection = (questionIdx, optionIdx, value) => {
        const questionId = questionMap[questionIdx];
        setAnswers({
            ...answers,
            [`${questionId}-${optionIdx}`]: value
        });
    };

    const handleEssayAnswer = (questionIdx, text) => {
        const questionId = questionMap[questionIdx];
        setAnswers({
            ...answers,
            [questionId]: text
        });
    };

    const handleFinishExam = () => {
        setShowConfirmModal(true);
    };

    const cancelFinish = () => {
        setShowConfirmModal(false);
    };    const confirmFinish = async () => {
        setSubmitting(true);
        
        // Stop the timer immediately when finishing the exam
        setExamStarted(false);
        
        try {
            // Get JWT token and userId from localStorage
            let token = null;
            let userId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    token = userObj.token;
                    userId = userObj._id;
                } catch (e) {
                    console.error("Error parsing user data:", e);
                    token = null;
                    userId = null;
                }            }
              // Calculate time spent in seconds (exam duration - time left)
            // Handle cases where timeLeft might be null, undefined, or invalid
            console.log('Debug timeLeft calculation:', {
                timeLeft,
                timeLeftType: typeof timeLeft,
                examDuration: exam?.duration,
                examStarted
            });
            
            let timeSpent;
            if (timeLeft !== null && timeLeft !== undefined && typeof timeLeft === 'number' && timeLeft >= 0) {
                // Normal case: calculate time spent based on remaining time
                timeSpent = exam.duration * 60 - timeLeft;
                console.log('Calculated timeSpent from timeLeft:', timeSpent);
            } else {
                // Fallback cases: timeLeft is invalid, so assume full duration was used
                console.warn('timeLeft is invalid:', timeLeft, 'Using full exam duration as timeSpent');
                timeSpent = exam.duration * 60;
                console.log('Using fallback timeSpent:', timeSpent);
            }
            
            // Ensure timeSpent is within valid bounds
            timeSpent = Math.max(0, Math.min(timeSpent, exam.duration * 60));
            console.log('Final timeSpent after bounds checking:', timeSpent);
            
            // Fix the API call structure
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const response = await axios.post(
                '/api/tests/submitExam', 
                { 
                    examId: id, 
                    answers,
                    userId,
                    timeSpent  // Send the time spent on the exam
                },
                config
            );
            
            if (response.data.success && response.data.result) {
                setResult(response.data.result);
                setShowConfirmModal(false);
                setShowAnswer(true);
                toast.success("Bài thi đã được nộp thành công!");
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra khi nộp bài');
            }
        } catch (error) {
            console.error("Error submitting exam:", error);
            toast.error("Có lỗi xảy ra khi nộp bài: " + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    const handleBack = () => {
        // Navigate back to the student dashboard with state to activate the exams tab
        navigate('/student/dashboard', { state: { activeTab: 'exams' } });
    };

    const getAllQuestions = () => {
        if (!exam || !exam.sections || !Array.isArray(exam.sections)) return [];

        let allQuestions = [];
        exam.sections.forEach(section => {
            if (section && section.questions && Array.isArray(section.questions)) {
                allQuestions = [...allQuestions, ...section.questions];
            }
        });

        return allQuestions;
    };

    const renderCurrentQuestion = () => {
        const questions = getAllQuestions();
        if (!questions || questions.length === 0 || currentQuestion >= questions.length) {
            return <div>Không có câu hỏi</div>;
        }

        const q = questions[currentQuestion];
        if (!q) {
            return <div>Câu hỏi không hợp lệ</div>;
        }

        const questionId = q._id;
        
        return (
            <div className="exam-question">
                <div className="question-header">
                    Câu {currentQuestion + 1}: {q.type === 'tracnghiem' ? '(Trắc nghiệm)' : q.type === 'dungsai' ? '(Đúng sai)' : '(Tự luận)'}
                </div>

                <div className="question-content">
                    <p>{renderMixedContent(q.question)}</p>
                    {q.image && <img src={q.image} alt="Question illustration" className="question-image" />}
                </div>

                {q.type === 'tracnghiem' && (
                    <div className="question-options">
                        {q.options && q.options.map((opt, oidx) => (
                            <div className="option-row" key={oidx}>
                                <label className={`option-label ${answers[questionId] === oidx ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion}`}
                                        checked={answers[questionId] === oidx}
                                        onChange={() => handleAnswerSelection(currentQuestion, oidx)}
                                    />
                                    <span className="option-text">
                                        {String.fromCharCode(65 + oidx)}. {renderMixedContent(opt)}
                                    </span>
                                    {q.optionImages && q.optionImages[oidx] && (
                                        <img src={q.optionImages[oidx]} alt={`Option ${String.fromCharCode(65 + oidx)}`} className="option-image" />
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {q.type === 'dungsai' && (
                    <div className="question-options dungsai-options">
                        {q.options && q.options.map((option, idx) => (
                            <div className="option-row" key={idx}>
                                <div className="option-content">
                                    <p>{String.fromCharCode(65 + idx)}. {renderMixedContent(option)}</p>
                                </div>
                                <div className="true-false-buttons">
                                    <label className={`tf-label ${answers[`${questionId}-${idx}`] === true ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`tf-${currentQuestion}-${idx}`}
                                            checked={answers[`${questionId}-${idx}`] === true}
                                            onChange={() => handleTFAnswerSelection(currentQuestion, idx, true)}
                                        />
                                        Đúng
                                    </label>
                                    <label className={`tf-label ${answers[`${questionId}-${idx}`] === false ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`tf-${currentQuestion}-${idx}`}
                                            checked={answers[`${questionId}-${idx}`] === false}
                                            onChange={() => handleTFAnswerSelection(currentQuestion, idx, false)}
                                        />
                                        Sai
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {q.type === 'tuluan' && (
                    <div className="question-tuluan">
                        <div className="tuluan-answer-container">
                            <input
                                type="number"
                                className="tuluan-answer"
                                placeholder="Nhập đáp số"
                                value={answers[questionId] || ''}
                                onChange={e => handleEssayAnswer(currentQuestion, e.target.value)}
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="exam-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải đề thi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-error">
                <h3>Có lỗi xảy ra</h3>
                <p>{error}</p>
                <button onClick={handleBack} className="btn-back">Quay lại</button>
            </div>
        );
    }

    if (!exam) {
        return <div>Không tìm thấy đề thi</div>;
    }

    return (
        <div className="take-exam-container">
            <div className="exam-header">
                <div className="exam-title">
                    <h2>{exam.title}</h2>
                    <p>Môn: {exam.subject} | Thời gian: {exam.duration} phút</p>
                </div>
                <div className="exam-actions">
                    <button className="btn-back" onClick={handleBack}><i className="fas fa-arrow-left"></i> Quay lại</button>
                </div>
            </div>

            {!examStarted ? (
                <div className="exam-intro">
                    <div className="exam-intro-content">
                        <h3>Thông tin đề thi</h3>
                        <table className="exam-info-table">
                            <tbody>
                                <tr>
                                    <td>Tên đề thi:</td>
                                    <td>{exam.title}</td>
                                </tr>
                                <tr>
                                    <td>Môn học:</td>
                                    <td>{exam.subject}</td>
                                </tr>
                                <tr>
                                    <td>Thời gian:</td>
                                    <td>{exam.duration} phút</td>
                                </tr>
                                <tr>
                                    <td>Số câu hỏi:</td>
                                    <td>{exam.numQuestions} câu</td>
                                </tr>
                                <tr>
                                    <td>Ghi chú:</td>
                                    <td>{exam.note || 'Không có'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="exam-structure">
                            <h4>Cấu trúc đề thi:</h4>
                            <ul>
                                {exam.sections && exam.sections.map((section, idx) => (
                                    <li key={idx}>
                                        {section.title}: {section.questions?.length || 0} câu ({section.type === 'tracnghiem' ? 'Trắc nghiệm' :
                                            section.type === 'dungsai' ? 'Đúng sai' : 'Tự luận'})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="exam-rules">
                            <h4>Hướng dẫn làm bài:</h4>
                            <ul>
                                <li>Nhấn "Bắt đầu làm bài" để vào bài thi</li>
                                <li>Thời gian sẽ được đếm ngược khi bạn bắt đầu</li>
                                {/* <li>Tiến trình làm bài sẽ tự động lưu mỗi phút</li> */}
                                <li>Nhấn "Nộp bài" khi hoàn thành</li>
                            </ul>
                        </div>

                        <div className="exam-start-button">
                            <button onClick={startExam} className="btn-start-exam">
                                <i className="fas fa-play-circle"></i> Bắt đầu làm bài
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="exam-content">
                    <div className="exam-sidebar">
                        <div className="exam-timer">
                            <div className="timer-label">Thời gian còn lại:</div>
                            <div className={`timer-value ${timeLeft < 300 ? 'timer-warning' : ''}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>                        {/* Auto-save progress UI removed */}

                        <div className="question-navigator">
                            {questionsByType['tracnghiem'] && questionsByType['tracnghiem'].length > 0 && (
                                <>
                                    <h4>Câu hỏi trắc nghiệm</h4>
                                    <div className="question-nav-buttons">
                                        {questionsByType['tracnghiem']?.map(q => {
                                            const qid = q._id || q.globalIndex;
                                            const isAnswered = answers[qid] !== undefined && answers[qid] !== null && answers[qid] !== '';
                                            return (
                                                <button
                                                    key={q.globalIndex}
                                                    className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                                                    onClick={() => setCurrentQuestion(q.globalIndex)}
                                                >
                                                    {q.globalIndex + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {questionsByType['dungsai'] && questionsByType['dungsai'].length > 0 && (
                                <>
                                    <h4>Câu hỏi đúng sai</h4>
                                    <div className="question-nav-buttons">
                                        {questionsByType['dungsai']?.map(q => {
                                            // For đúng sai, check if any answer for this question exists and is not empty
                                            const qid = q._id || q.globalIndex;
                                            // Find any answer key that starts with this question's id
                                            const isAnswered = Object.keys(answers).some(key => key.startsWith(`${qid}`) && answers[key] !== undefined && answers[key] !== null && answers[key] !== '');
                                            return (
                                                <button
                                                    key={q.globalIndex}
                                                    className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                                                    onClick={() => setCurrentQuestion(q.globalIndex)}
                                                >
                                                    {q.globalIndex + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {questionsByType['tuluan'] && questionsByType['tuluan'].length > 0 && (
                                <>
                                    <h4>Câu hỏi tự luận</h4>
                                    <div className="question-nav-buttons">
                                        {questionsByType['tuluan']?.map(q => {
                                            // Check both _id and globalIndex for answer mapping
                                            const qid = q._id;
                                            const idx = q.globalIndex;
                                            const isAnswered = (answers[qid] !== undefined && answers[qid] !== null && answers[qid] !== '') || (answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '');
                                            return (
                                                <button
                                                    key={q.globalIndex}
                                                    className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                                                    onClick={() => setCurrentQuestion(q.globalIndex)}
                                                >
                                                    {q.globalIndex + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="finish-exam-section">
                            <button 
                                className="btn-finish-exam"
                                onClick={handleFinishExam}
                            >
                                <i className="fas fa-paper-plane"></i> Nộp bài
                            </button>
                        </div>
                    </div>

                    <div className="exam-main-content">
                        {renderCurrentQuestion()}

                        <div className="question-navigation-buttons">
                            <button
                                className="btn-prev"
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            >
                                <i className="fas fa-arrow-left"></i> Câu trước
                            </button>

                            <button
                                className="btn-next"
                                disabled={currentQuestion === getAllQuestions().length - 1}
                                onClick={() => setCurrentQuestion(prev => Math.min(getAllQuestions().length - 1, prev + 1))}
                            >
                                Câu tiếp <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Xác nhận nộp bài</h3>
                        </div>
                        <div className="modal-body">
                            <p>Bạn có chắc chắn muốn nộp bài thi?</p>
                            <p className="completion-info">
                                Còn {formatTime(timeLeft)} thời gian làm bài.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel" 
                                onClick={cancelFinish}
                                disabled={submitting}
                            >
                                Quay lại làm bài
                            </button>
                            <button 
                                className="btn-confirm" 
                                onClick={confirmFinish}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
                                ) : (
                                    <>Nộp bài</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}            {/* Simple Result Modal */}
            {showAnswer && result && (
                <div className="modal-overlay">
                    <div className="modal-container result-modal">
                        <div className="result-header">
                            <div className="result-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h3>Kết quả bài thi</h3>
                            <p className="exam-title">{exam?.title}</p>
                        </div>                        <div className="result-body">
                            <div className="result-summary">
                                <div className="score-section">
                                    <div className="score-label">Điểm số</div>
                                    <div className="score-value">{result.score}</div>
                                </div>
                                <div className="time-section">
                                    <div className="time-label">Thời gian</div>
                                    <div className="time-value">{formatTime((exam?.duration || 0) * 60 - timeLeft)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="result-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={handleBack}
                            >
                                <i className="fas fa-arrow-left"></i>
                                Quay lại
                            </button>                            <button 
                                className="btn-primary" 
                                onClick={() => navigate(`/student/test-review/${result._id}`, { 
                                    state: { 
                                        result: result,
                                        exam: exam 
                                    } 
                                })}
                            >
                                <i className="fas fa-eye"></i>
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showAnswer === 'review' && result && (
                <div className="modal-overlay">
                    <div className="modal-container review-modal">
                        <div className="modal-header">
                            <h3>Chi tiết đáp án và kết quả</h3>
                        </div>
                        <div className="modal-body review-body">
                            {result.details && result.details.length > 0 ? (
                                <div className="review-list">
                                    {result.details.map((item, idx) => (
                                        <div className="review-question" key={idx}>
                                            <div className="review-q-header">
                                                <b>Câu {idx + 1}:</b> {renderMixedContent(item.question?.question || item.question)}
                                            </div>
                                            <div className="review-q-content">
                                                <div><b>Đáp án của bạn:</b> {renderReviewAnswer(item.question, item.yourAnswer)}</div>
                                                <div><b>Đáp án đúng:</b> {renderReviewAnswer(item.question, item.correctAnswer, true)}</div>
                                                <div><b>Điểm câu này:</b> {item.score}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Không có dữ liệu chi tiết.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-back" onClick={handleBack}>Quay lại danh sách đề thi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default TestTaking;

// Helper to render review answers for different question types
function renderReviewAnswer(question, answer, isCorrect) {
    if (!question) return <span>Không có</span>;
    if (question.type === 'tracnghiem') {
        if (typeof answer === 'number' && question.options && question.options[answer] !== undefined) {
            return <span>{String.fromCharCode(65 + answer)}. {renderMixedContent(question.options[answer])}</span>;
        }
        return <span>{answer !== undefined ? answer : 'Chưa trả lời'}</span>;
    }
    if (question.type === 'dungsai') {
        if (Array.isArray(answer)) {
            return (
                <ul style={{margin:0, paddingLeft:20}}>
                    {answer.map((val, idx) => (
                        <li key={idx}>
                            {String.fromCharCode(65 + idx)}: <span style={{color: isCorrect ? '#2e7d32' : '#1976d2'}}>{val === true ? 'Đúng' : val === false ? 'Sai' : 'Chưa trả lời'}</span>
                        </li>
                    ))}
                </ul>
            );
        }
        return <span>{answer !== undefined ? answer : 'Chưa trả lời'}</span>;
    }
    if (question.type === 'tuluan') {
        return <span>{answer || 'Chưa trả lời'}</span>;
    }
    return <span>{answer !== undefined ? answer : 'Chưa trả lời'}</span>;
}