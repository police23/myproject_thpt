import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ExamPreview.css';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const ExamPreview = () => {
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

    // Fetch exam data
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/tests/${id}`);
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Không thể tải thông tin đề thi');
                }

                setExam(data.test);

                // Set initial time based on exam duration
                setTimeLeft(data.test.duration * 60);

                // Organize questions by type for the navigation panel
                const qByType = {};
                let questionIndex = 0;

                data.test.sections.forEach(section => {
                    if (!qByType[section.type]) {
                        qByType[section.type] = [];
                    }

                    section.questions.forEach(question => {
                        qByType[section.type].push({
                            ...question,
                            globalIndex: questionIndex++
                        });
                    });
                });

                setQuestionsByType(qByType);
                setLoading(false);
            } catch (error) {
                setError(error.message || 'Đã xảy ra lỗi khi tải đề thi');
                setLoading(false);
            }
        };

        fetchExamData();
    }, [id]);

    // Timer countdown when exam is started
    useEffect(() => {
        if (!examStarted || !timeLeft) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
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
    };

    const handleAnswerSelection = (questionIdx, answerIdx) => {
        setAnswers({
            ...answers,
            [questionIdx]: answerIdx
        });
    };

    const handleTFAnswerSelection = (questionIdx, optionIdx, value) => {
        setAnswers({
            ...answers,
            [`${questionIdx}-${optionIdx}`]: value
        });
    };

    const handleBack = () => {
        navigate('/admin/dashboard/exams');
    };

    const getAllQuestions = () => {
        if (!exam) return [];

        let allQuestions = [];
        exam.sections.forEach(section => {
            allQuestions = [...allQuestions, ...section.questions];
        });

        return allQuestions;
    };

    const renderCurrentQuestion = () => {
        const questions = getAllQuestions();
        if (questions.length === 0 || currentQuestion >= questions.length) {
            return <div>Không có câu hỏi</div>;
        }

        const q = questions[currentQuestion];

        return (
            <div className="exam-question">
                <div className="question-header">
                    Câu {currentQuestion + 1}: {q.type === 'tracnghiem' ? '(Trắc nghiệm)' : q.type === 'dungsai' ? '(Đúng sai)' : '(Tự luận)'}
                </div>

                <div className="question-content">
                    <p>{q.question}</p>
                    {q.image && <img src={q.image} alt="Question illustration" className="question-image" />}
                </div>

                {q.type === 'tracnghiem' && (
                    <div className="question-options">
                        {q.options && q.options.map((option, idx) => (
                            <div className="option-row" key={idx}>
                                <label className={`option-label ${answers[currentQuestion] === idx ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion}`}
                                        checked={answers[currentQuestion] === idx}
                                        onChange={() => handleAnswerSelection(currentQuestion, idx)}
                                    />
                                    <span className="option-text">
                                        {String.fromCharCode(65 + idx)}. {option}
                                    </span>
                                    {q.optionImages && q.optionImages[idx] && (
                                        <img src={q.optionImages[idx]} alt={`Option ${String.fromCharCode(65 + idx)}`} className="option-image" />
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
                                    <p>{String.fromCharCode(65 + idx)}. {option}</p>
                                </div>
                                <div className="true-false-buttons">
                                    <label className={`tf-label ${answers[`${currentQuestion}-${idx}`] === true ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`tf-${currentQuestion}-${idx}`}
                                            checked={answers[`${currentQuestion}-${idx}`] === true}
                                            onChange={() => handleTFAnswerSelection(currentQuestion, idx, true)}
                                        />
                                        Đúng
                                    </label>
                                    <label className={`tf-label ${answers[`${currentQuestion}-${idx}`] === false ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`tf-${currentQuestion}-${idx}`}
                                            checked={answers[`${currentQuestion}-${idx}`] === false}
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
                    <div className="question-essay">
                        <textarea
                            className="essay-answer"
                            placeholder="Nhập câu trả lời của bạn tại đây..."
                            value={answers[currentQuestion] || ''}
                            onChange={(e) => handleAnswerSelection(currentQuestion, e.target.value)}
                        ></textarea>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="exam-preview-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải đề thi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-preview-error">
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
        <div className="exam-preview-container">
            <div className="exam-preview-header">
                <div className="exam-preview-title">
                    <h2>{exam.title}</h2>
                    <p>Môn: {exam.subject} | Thời gian: {exam.duration} phút</p>
                </div>
                <div className="exam-preview-actions">
                    <button className="btn-back" onClick={handleBack}><i className="fas fa-arrow-left"></i> Quay lại</button>
                </div>
            </div>

            {!examStarted ? (
                <div className="exam-preview-intro">
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
                                    <td>Trạng thái:</td>
                                    <td>{exam.status === 'public' ? 'Công khai' : 'Nháp'}</td>
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
                                        {section.title}: {section.num} câu ({section.type === 'tracnghiem' ? 'Trắc nghiệm' :
                                            section.type === 'dungsai' ? 'Đúng sai' : 'Tự luận'})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="exam-start-button">
                            <button onClick={startExam} className="btn-start-exam">
                                <i className="fas fa-play-circle"></i> Bắt đầu xem thử đề thi
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="exam-preview-content">
                    <div className="exam-sidebar">
                        <div className="exam-timer">
                            <div className="timer-label">Thời gian còn lại:</div>
                            <div className="timer-value">{formatTime(timeLeft)}</div>
                        </div>

                        <div className="exam-navigation">
                            <div className="question-navigator">
                                <h4>Câu hỏi trắc nghiệm</h4>
                                <div className="question-nav-buttons">
                                    {questionsByType['tracnghiem']?.map(q => (
                                        <button
                                            key={q.globalIndex}
                                            className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${answers[q.globalIndex] !== undefined ? 'answered' : ''}`}
                                            onClick={() => setCurrentQuestion(q.globalIndex)}
                                        >
                                            {q.globalIndex + 1}
                                        </button>
                                    ))}
                                </div>

                                {questionsByType['dungsai'] && questionsByType['dungsai'].length > 0 && (
                                    <>
                                        <h4>Câu hỏi đúng sai</h4>
                                        <div className="question-nav-buttons">
                                            {questionsByType['dungsai']?.map(q => (
                                                <button
                                                    key={q.globalIndex}
                                                    className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${Object.keys(answers).some(key => key.startsWith(`${q.globalIndex}-`)) ? 'answered' : ''}`}
                                                    onClick={() => setCurrentQuestion(q.globalIndex)}
                                                >
                                                    {q.globalIndex + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {questionsByType['tuluan'] && questionsByType['tuluan'].length > 0 && (
                                    <>
                                        <h4>Câu hỏi tự luận</h4>
                                        <div className="question-nav-buttons">
                                            {questionsByType['tuluan']?.map(q => (
                                                <button
                                                    key={q.globalIndex}
                                                    className={`nav-btn ${currentQuestion === q.globalIndex ? 'active' : ''} ${answers[q.globalIndex] ? 'answered' : ''}`}
                                                    onClick={() => setCurrentQuestion(q.globalIndex)}
                                                >
                                                    {q.globalIndex + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
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

                        <div className="exam-finish-buttons">
                            <button className="btn-finish-exam" onClick={handleBack}>
                                <i className="fas fa-stop-circle"></i> Kết thúc xem thử
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPreview;
