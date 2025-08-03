import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import './TestReview.css';

// Helper function for rendering LaTeX content (same as TestTaking)
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

const TestReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questionsByType, setQuestionsByType] = useState({});    // Fetch exam data and result
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
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
                
                if (!userId) {
                    throw new Error('Bạn cần đăng nhập để xem kết quả bài thi');
                }

                // Fetch result by result ID (not test ID)
                const resultResponse = await axios.get(`/api/tests/result/${id}?userId=${userId}`);
                if (!resultResponse.data.success) {
                    throw new Error(resultResponse.data.message || 'Không thể tải kết quả bài thi');
                }
                
                const resultData = resultResponse.data.result;
                setResult(resultData);
                
                // Use test data from result instead of fetching separately
                // This ensures we get the exact same test that was used when taking the exam
                const examData = resultData.test || resultData.test_id;
                if (!examData) {
                    throw new Error('Không tìm thấy thông tin bài thi trong kết quả');
                }
                
                // Add a debug message to check the structure
                console.log("Test data structure:", {
                    hasTestId: !!resultData.test_id,
                    testIdType: typeof resultData.test_id,
                    testIdIsObject: typeof resultData.test_id === 'object',
                    sections: examData.sections?.length || 0,
                    firstSectionType: examData.sections?.[0]?.type || 'unknown'
                });
                
                // Set the exam data for rendering
                setExam(examData);
                
                // Organize questions by type for the navigation panel
                const qByType = {};
                let questionIndex = 0;
                
                if (!examData.sections || !Array.isArray(examData.sections)) {
                    setError('Không thể hiển thị câu hỏi vì dữ liệu đề thi không đầy đủ');
                    return;
                }
                
                examData.sections.forEach(section => {
                    if (!section) {
                        console.error('Encountered undefined section');
                        return;
                    }
                    
                    const sectionType = section.type || 'unknown';
                    
                    if (!qByType[sectionType]) {
                        qByType[sectionType] = [];
                    }
                    
                    if (!section.questions || !Array.isArray(section.questions)) {
                        return;
                    }
                    
                    section.questions.forEach(question => {
                        if (!question) {
                            return;
                        }
                        
                        // Try to find the matching result from resultData.answers
                        // First check if we have enriched answers with question data
                        let answerResult = resultData.answers.find(a => 
                            a.question && 
                            String(a.question._id) === String(question._id)
                        );
                        
                        // If not found, fall back to matching by question_id
                        if (!answerResult) {
                            answerResult = resultData.answers.find(a => {
                                // Handle both ObjectId and string formats
                                let aQuestionId = a.question_id;
                                if (typeof aQuestionId === 'object' && aQuestionId._id) {
                                    aQuestionId = aQuestionId._id;
                                }
                                
                                const qQuestionId = question._id;
                                
                                // Convert both to strings for comparison
                                const aIdStr = String(aQuestionId);
                                const qIdStr = String(qQuestionId);
                                
                                return aIdStr === qIdStr;
                            });
                        }
                        

                        
                        // Determine the question type (tracnghiem, dungsai, tuluan)
                        // 1. Try to get it from question.type
                        // 2. If not available, use section.type
                        // 3. If neither, infer from question structure
                        let questionType = question.type || section.type;
                        
                        // If we still don't have a type, try to infer it from the question structure
                        if (!questionType) {
                            if (question.options && Array.isArray(question.options) && question.correct_answer !== undefined) {
                                questionType = 'tracnghiem';
                            } else if (question.options && Array.isArray(question.options) && question.answers && Array.isArray(question.answers)) {
                                questionType = 'dungsai';
                            } else {
                                questionType = 'tuluan'; // Default to essay if we can't determine
                            }
                        }
                        
                        // Make sure we have an array for this question type
                        if (!qByType[questionType]) {
                            qByType[questionType] = [];
                        }
                        
                        // Create a complete question object with all necessary data
                        const completeQuestion = {
                            ...question,
                            globalIndex: questionIndex,
                            type: questionType,
                            result: answerResult || null,
                            section_id: section._id
                        };
                        
                        // Add the question to the appropriate type array
                        qByType[questionType].push(completeQuestion);
                        
                        questionIndex++;
                    });
                });
                
                setQuestionsByType(qByType);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu');
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);    const handleBack = () => {
        // Navigate back to the student dashboard with state to activate the results tab
        navigate('/student/dashboard', { state: { activeTab: 'results' } });
    };    const getAllQuestions = () => {
        if (!exam || !exam.sections) return [];
        
        let allQuestions = [];
        
        Object.values(questionsByType).forEach(typeQuestions => {
            allQuestions = [...allQuestions, ...typeQuestions];
        });
        
        return allQuestions;
    };    // Lấy điểm theo từng section từ kết quả
    const getSectionScores = () => {
        if (!result?.section_scores || !exam?.sections) {
            return {};
        }

        const sectionScoreMap = {};
        
        // Create a mapping from section_id to section scores
        const scoreMap = {};
        result.section_scores.forEach(sectionScore => {
            scoreMap[sectionScore.section_id] = sectionScore.score;
        });

        // Map section types to their scores
        exam.sections.forEach(section => {
            if (!section || !section.type) return;
            
            const earnedPoints = scoreMap[section._id] || 0;
            const maxPoints = section.points || 0;
            
            sectionScoreMap[section.type] = {
                earnedPoints: earnedPoints,
                maxPoints: maxPoints
            };
        });

        return sectionScoreMap;
    };

    const renderQuestionStatus = (question) => {
        if (!question || !question.result) return null;
        
        return (
            <div className={`question-status ${question.result.is_correct ? 'correct' : 'incorrect'}`}>
                {question.result.is_correct ? (
                    <span><i className="fas fa-check-circle"></i> Đúng</span>
                ) : (
                    <span><i className="fas fa-times-circle"></i> Sai</span>
                )}
            </div>
        );
    };    const renderAnswers = (question) => {
        if (!question) {
            return null;
        }
        
        // If the answer has embedded question data, prioritize that
        const result = question.result || {};
        const originalQuestion = result.question || question;
        const userAnswer = result.user_answer;
        
        // Check if we have required question data
        if (!originalQuestion.options && question.type === 'tracnghiem') {
            return (
                <div className="answer-section error">
                    <h4>Đáp án (Lỗi dữ liệu)</h4>
                    <div className="answer-content">
                        <div className="no-answer error">
                            <i className="fas fa-exclamation-triangle"></i> Không thể hiển thị đáp án do thiếu dữ liệu
                        </div>
                    </div>
                </div>
            );
        }
        
        if (question.type === 'tracnghiem') {
            // Check if we have options, if not return error message
            if (!originalQuestion.options || !Array.isArray(originalQuestion.options) || originalQuestion.options.length === 0) {
                console.error('Missing or invalid options array for tracnghiem question:', originalQuestion);
                return (
                    <div className="answer-section">
                        <h4>Đáp án</h4>
                        <div className="answer-content">
                            <div className="no-answer">
                                <i className="fas fa-exclamation-triangle"></i> Không thể hiển thị đáp án do thiếu dữ liệu
                            </div>
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="answer-section">
                    <h4>Đáp án</h4>
                    <div className="answer-content">
                        {originalQuestion.options.map((option, idx) => {
                            const isCorrect = idx === parseInt(originalQuestion.correct_answer);
                            const isUserChoice = userAnswer !== undefined && userAnswer !== null && idx === parseInt(userAnswer);
                            
                            let className = 'option';
                            if (isCorrect) {
                                className += ' correct';
                            } else if (isUserChoice) {
                                className += ' incorrect';
                            }
                            
                            return (
                                <div key={idx} className={className}>
                                    <span className="option-label">
                                        {String.fromCharCode(65 + idx)}:
                                    </span>
                                    <span className="option-text">
                                        {renderMixedContent(option)}
                                    </span>                                    {isCorrect && (
                                        <span className="correct-indicator">
                                            <i className="fas fa-check-circle"></i> Đúng
                                        </span>
                                    )}                                    {isUserChoice && !isCorrect && (
                                        <span className="user-choice-indicator">
                                            <i className="fas fa-arrow-left"></i> Bạn chọn
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                        {(userAnswer === undefined || userAnswer === null) && (
                            <div className="no-answer">
                                <i className="fas fa-exclamation-triangle"></i> Bạn chưa trả lời câu này
                            </div>
                        )}
                    </div>
                </div>
            );        } else if (question.type === 'dungsai') {
            // Parse user answers for true/false questions
            const userAnswers = userAnswer ? userAnswer.split(',').map(a => {
                if (a === 'true') return true;
                if (a === 'false') return false;
                return null;
            }) : [];
            
            console.log('True/False question - userAnswer:', userAnswer);
            console.log('Parsed userAnswers:', userAnswers);
            
            const correctAnswers = question.answers || [];
            
            return (
                <div className="answer-section">
                    <h4>Đáp án đúng/sai</h4>
                    <div className="answer-content">
                        {question.options.map((option, idx) => {
                            const correctValue = correctAnswers[idx];
                            const userValue = userAnswers[idx];
                            const isCorrect = userValue === correctValue;
                            
                            return (
                                <div 
                                    key={idx} 
                                    className={`tf-option ${isCorrect ? 'correct' : userValue !== undefined ? 'incorrect' : ''}`}
                                >
                                    <div className="option-text">
                                        <span className="option-label">
                                            {String.fromCharCode(65 + idx)}:
                                        </span>
                                        {renderMixedContent(option)}
                                    </div>
                                    <div className="tf-values">
                                        <div className="correct-value">
                                            <span className="tf-label">Đáp án</span>
                                            <span className={`tf-value correct ${correctValue === true ? 'selected' : ''}`}>
                                                {correctValue === true ? 'Đúng' : 'Sai'}
                                            </span>
                                        </div>
                                        {userValue !== undefined && userValue !== null && (
                                            <div className="user-value">
                                                <span className="tf-label">Bạn chọn</span>
                                                <span className={`tf-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {userValue === true ? 'Đúng' : 'Sai'}
                                                    {isCorrect ? 
                                                        <i className="fas fa-check-circle"></i> : 
                                                        <i className="fas fa-times-circle"></i>
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {(userValue === undefined || userValue === null) && (
                                            <div className="user-value">
                                                <span className="tf-label">Bạn chọn:</span>
                                                <span className="tf-value no-answer">Chưa trả lời</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } else if (question.type === 'tuluan') {
            console.log('Essay question - userAnswer:', userAnswer);
            
            return (
                <div className="answer-comparison essay">
                    <div className="answer-section user-answer">
                        <h4>Đáp án của bạn</h4>
                        <div className="answer-content">
                            <div className="essay-answer">
                                {userAnswer && userAnswer.trim() !== '' ? 
                                    renderMixedContent(userAnswer) : 
                                    <em>Không có bài làm</em>
                                }
                            </div>
                        </div>
                    </div>
                      <div className="answer-section correct-answer">
                        <h4>Đáp án đúng</h4>
                        <div className="answer-content">
                            <div className="essay-answer">
                                {question.correct_answer ? renderMixedContent(question.correct_answer) : <em>Không có đáp án tham khảo</em>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    const renderExplanation = (question) => {
        if (!question || !question.explanation) return null;
        
        return (
            <div className="question-explanation">
                <h4>Giải thích</h4>
                <div className="explanation-content">
                    {renderMixedContent(question.explanation)}
                </div>
            </div>
        );
    };

    const renderCurrentQuestion = () => {
        const questions = getAllQuestions();
        if (!questions || questions.length === 0) {
            return (
                <div className="no-questions-message">
                    <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle"></i> Không có câu hỏi nào để hiển thị. 
                        Điều này có thể do một trong những lý do sau:
                        <ul>
                            <li>Dữ liệu đề thi không được tải đầy đủ</li>
                            <li>Đề thi không có câu hỏi nào</li>
                            <li>Lỗi khi xử lý dữ liệu</li>
                        </ul>
                    </div>
                    <div className="debug-info">
                        <h5>Thông tin debug:</h5>
                        <p>Số section: {exam?.sections?.length || 0}</p>
                        <p>Số loại câu hỏi: {Object.keys(questionsByType).length}</p>
                        <p>Các loại câu hỏi: {Object.keys(questionsByType).join(', ') || 'Không có'}</p>
                        
                        {exam?.sections?.map((section, idx) => (
                            <div key={idx}>
                                <p><strong>Section {idx + 1}</strong>: Type = {section.type || 'không rõ'}, 
                                Số câu hỏi = {section.questions?.length || 0}</p>
                                {section.questions?.slice(0, 2).map((q, qIdx) => (
                                    <p key={qIdx}>-- Question {qIdx + 1}: Type = {q.type || 'không rõ'}, 
                                    ID = {String(q._id).substring(0, 6)}...</p>
                                ))}
                                {section.questions?.length > 2 && <p>...và {section.questions.length - 2} câu hỏi khác</p>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        if (currentQuestion >= questions.length) {
            return <div>Chỉ số câu hỏi nằm ngoài phạm vi</div>;
        }

        const q = questions[currentQuestion];
        if (!q) {
            return <div>Câu hỏi không hợp lệ</div>;
        }
        
        // If the answer has embedded question data, prioritize that for display
        const result = q.result || {};
        const originalQuestion = result.question || q;
        
        return (
            <div className="review-question">
                <div className="question-header">
                    <div className="question-number">
                        Câu {currentQuestion + 1}: {q.type === 'tracnghiem' ? '(Trắc nghiệm)' : q.type === 'dungsai' ? '(Đúng sai)' : '(Tự luận)'}
                    </div>
                    {renderQuestionStatus(q)}
                </div>

                <div className="question-content">
                    <p>{renderMixedContent(originalQuestion.question)}</p>
                    {originalQuestion.image && <img src={originalQuestion.image} alt="Question illustration" className="question-image" />}
                </div>

                {renderAnswers(q)}
                {renderExplanation(originalQuestion)}
            </div>
        );
    };

    // Check if question is answered correctly or incorrectly for navigation highlighting
    const getQuestionStatus = (questionIndex) => {
        const questions = getAllQuestions();
        const q = questions[questionIndex];
        
        if (!q || !q.result) return 'unanswered';
        return q.result.is_correct ? 'correct' : 'incorrect';
    };

    if (loading) {
        return (
            <div className="review-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu bài thi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-error">
                <h3>Có lỗi xảy ra</h3>
                <p>{error}</p>
                <button onClick={handleBack} className="btn-back">Quay lại</button>
            </div>
        );
    }

    if (!exam || !result) {
        return <div>Không tìm thấy bài thi hoặc kết quả</div>;
    }

    return (
        <div className="test-review-container">
            <div className="review-header">
                <div className="review-title">
                    <h2>Xem lại bài thi: {exam.title}</h2>
                    <p>Môn: {exam.subject}</p>
                </div>                <div className="score-summary">
                    <div className="score-box">
                        <div className="score-label">Điểm của bạn</div>
                        <div className="score-value">{result.total_score}</div>
                    </div>
                    <div className="correct-stats">
                        <div className="correct-count">
                            <strong>Số câu đúng:</strong> {result.answers.filter(a => a.is_correct).length}/{result.answers.length}
                        </div>
                        <div className="time-taken">
                            <strong>Thời gian làm bài:</strong> {Math.floor(result.time_taken / 60)} phút {result.time_taken % 60} giây
                        </div>                    </div>
                </div>
                <div className="review-actions">
                    <button className="btn-back" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Quay lại
                    </button>
                </div>
            </div>

            <div className="review-content">
                <div className="review-sidebar">                    <div className="question-navigator">
                        {questionsByType['tracnghiem'] && questionsByType['tracnghiem'].length > 0 && (
                            <>                                <h4>
                                    Câu hỏi trắc nghiệm
                                    {(() => {
                                        const sectionScores = getSectionScores();
                                        const score = sectionScores['tracnghiem'];
                                        return score ? (
                                            <span className="section-score-badge">
                                                {score.earnedPoints}/{score.maxPoints} điểm
                                            </span>
                                        ) : null;
                                    })()}
                                </h4>
                                <div className="question-nav-buttons">
                                    {questionsByType['tracnghiem'].map(q => (
                                        <button
                                            key={q.globalIndex}
                                            className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${getQuestionStatus(q.globalIndex)}`}
                                            onClick={() => setCurrentQuestion(q.globalIndex)}
                                        >
                                            {q.globalIndex + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {questionsByType['dungsai'] && questionsByType['dungsai'].length > 0 && (
                            <>                                <h4>
                                    Câu hỏi đúng sai
                                    {(() => {
                                        const sectionScores = getSectionScores();
                                        const score = sectionScores['dungsai'];
                                        return score ? (
                                            <span className="section-score-badge">
                                                {score.earnedPoints}/{score.maxPoints} điểm
                                            </span>
                                        ) : null;
                                    })()}
                                </h4>
                                <div className="question-nav-buttons">
                                    {questionsByType['dungsai'].map(q => (
                                        <button
                                            key={q.globalIndex}
                                            className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${getQuestionStatus(q.globalIndex)}`}
                                            onClick={() => setCurrentQuestion(q.globalIndex)}
                                        >
                                            {q.globalIndex + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {questionsByType['tuluan'] && questionsByType['tuluan'].length > 0 && (
                            <>                                <h4>
                                    Câu hỏi tự luận
                                    {(() => {
                                        const sectionScores = getSectionScores();
                                        const score = sectionScores['tuluan'];
                                        return score ? (
                                            <span className="section-score-badge">
                                                {score.earnedPoints}/{score.maxPoints} điểm
                                            </span>
                                        ) : null;
                                    })()}
                                </h4>
                                <div className="question-nav-buttons">
                                    {questionsByType['tuluan'].map(q => (
                                        <button
                                            key={q.globalIndex}
                                            className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${getQuestionStatus(q.globalIndex)}`}
                                            onClick={() => setCurrentQuestion(q.globalIndex)}
                                        >
                                            {q.globalIndex + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="legend-section">
                        <h4>Chú thích</h4>
                        <div className="legend-item">
                            <div className="legend-marker correct"></div>
                            <div className="legend-text">Đúng</div>
                        </div>
                        <div className="legend-item">
                            <div className="legend-marker incorrect"></div>
                            <div className="legend-text">Sai</div>
                        </div>
                        <div className="legend-item">
                            <div className="legend-marker unanswered"></div>
                            <div className="legend-text">Không trả lời</div>
                        </div>
                    </div>
                </div>

                <div className="review-main-content">
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
        </div>
    );
};

export default TestReview;
