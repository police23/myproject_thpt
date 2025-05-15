import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './ExamForm2025.css';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Thêm component SafeInlineMath để tránh lỗi màu đỏ khi render LaTeX
function SafeInlineMath({ math }) {
    try {
        if (!math) return null;
        return <InlineMath math={math} errorColor="transparent" />;
    } catch {
        return null;
    }
}

function ExamForm2025({ onClose, onSubmit, initialData, isStandalone = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    // Add error handling state
    const [error, setError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false); // thêm state loading khi submit
    const [isLoading, setIsLoading] = useState(false); // Add loading state for initial data fetch

    const [form, setForm] = useState(
        initialData || {
            name: '',
            subject: '',
            date: '',
            status: 'public',
            duration: 90,
            numQuestions: 40,
            structure: [
                { section: 'Phần 1', num: 36, type: 'tracnghiem' },
                { section: 'Phần 2', num: 4, type: 'tuluan' }
            ],
            note: '',
            questions: []
        }
    );
    const [activeSection, setActiveSection] = useState('tracnghiem');

    // Thêm hàm để tự động tính tổng số câu hỏi từ cấu trúc
    const calculateTotalQuestions = () => {
        return form.structure.reduce((total, section) => total + parseInt(section.num || 0), 0);
    };

    // Tạo hàm tạo câu hỏi mới dựa trên loại
    const createNewQuestion = (type) => {
        switch (type) {
            case 'tracnghiem':
                return {
                    type: 'tracnghiem',
                    content: '',
                    options: ['', '', '', ''],
                    answer: 0,
                    hasImage: false,
                    image: null,
                    imagePreview: null,
                    optionImages: [null, null, null, null],
                    optionImagePreviews: [null, null, null, null]
                };
            case 'dungsai':
                return {
                    type: 'dungsai',
                    content: '',
                    options: ['', '', '', ''],
                    answers: [false, false, false, false],
                    hasImage: false,
                    image: null,
                    imagePreview: null,
                    optionImages: [null, null, null, null],
                    optionImagePreviews: [null, null, null, null]
                };
            case 'tuluan':
                return {
                    type: 'tuluan',
                    content: '',
                    answer: '',
                    hasImage: false,
                    image: null,
                    imagePreview: null,
                    answerImage: null,
                    answerImagePreview: null
                };
            default:
                return createNewQuestion('tracnghiem');
        }
    };

    // Add function to fetch test data by ID
    const fetchTestData = async (testId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/tests/${testId}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to load test data');
            }

            const test = data.test;

            // Format test data to match form structure
            const formattedStructure = [];
            const formattedQuestions = [];

            // Process sections and questions
            test.sections.forEach(section => {
                // Add section to structure
                formattedStructure.push({
                    section: section.title,
                    num: section.num,
                    type: section.type
                });

                // Process questions in this section
                section.questions.forEach(q => {
                    let formattedQuestion;

                    switch (q.type) {
                        case 'tracnghiem':
                            formattedQuestion = {
                                type: 'tracnghiem',
                                content: q.question,
                                options: q.options || ['', '', '', ''],
                                answer: parseInt(q.correct_answer) || 0,
                                hasImage: q.hasImage || false,
                                image: null,
                                imagePreview: q.image || null,
                                optionImages: q.optionImages || [null, null, null, null],
                                optionImagePreviews: q.optionImages || [null, null, null, null]
                            };
                            break;

                        case 'dungsai':
                            formattedQuestion = {
                                type: 'dungsai',
                                content: q.question,
                                options: q.options || ['', '', '', ''],
                                answers: q.answers || [false, false, false, false],
                                hasImage: q.hasImage || false,
                                image: null,
                                imagePreview: q.image || null,
                                optionImages: q.optionImages || [null, null, null, null],
                                optionImagePreviews: q.optionImages || [null, null, null, null]
                            };
                            break;

                        case 'tuluan':
                            formattedQuestion = {
                                type: 'tuluan',
                                content: q.question,
                                answer: q.correct_answer || '',
                                hasImage: q.hasImage || false,
                                image: null,
                                imagePreview: q.image || null,
                                answerImage: null,
                                answerImagePreview: q.answerImage || null
                            };
                            break;

                        default:
                            formattedQuestion = createNewQuestion('tracnghiem');
                    }

                    formattedQuestions.push(formattedQuestion);
                });
            });

            // Update form state with loaded data
            setForm({
                name: test.title,
                subject: test.subject,
                duration: test.duration,
                status: test.status,
                note: test.note || '',
                numQuestions: test.numQuestions,
                structure: formattedStructure,
                questions: formattedQuestions
            });

            // Set active section based on first available question type
            if (formattedQuestions.length > 0) {
                setActiveSection(formattedQuestions[0].type);
            }

            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching test data:", err);
            setError("Không thể tải dữ liệu đề thi. Vui lòng thử lại sau.");
            setIsLoading(false);
        }
    };

    // For standalone mode with edit functionality, fetch data based on id
    useEffect(() => {
        console.log("Component mounted, isStandalone:", isStandalone);
        console.log("Current route:", location.pathname);

        if (isStandalone && id) {
            // Fetch test data from API when in edit mode
            fetchTestData(id);
        }
    }, [isStandalone, id, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Cập nhật handleStructureChange để tự động tạo/xóa câu hỏi
    const handleStructureChange = (idx, field, value) => {
        const newStructure = [...form.structure];
        const oldType = newStructure[idx].type;
        const oldNum = parseInt(newStructure[idx].num || 0);

        // Cập nhật giá trị mới
        newStructure[idx][field] = value;

        // Nếu thay đổi số câu hỏi hoặc loại câu hỏi, cập nhật danh sách câu hỏi
        if (field === 'num' || field === 'type') {
            const newType = field === 'type' ? value : oldType;
            const newNum = field === 'num' ? parseInt(value || 0) : oldNum;

            // Lọc câu hỏi hiện tại theo loại để kiểm soát chính xác
            let currentQuestions = form.questions.filter(q => q.type === oldType);
            const otherQuestions = form.questions.filter(q => q.type !== oldType);

            // Tính toán số câu hỏi cần thêm hoặc bớt
            const diff = newNum - currentQuestions.length;

            // Nếu thay đổi loại câu hỏi
            if (field === 'type' && oldType !== newType) {
                // Tạo danh sách câu hỏi mới với loại mới
                currentQuestions = Array(newNum).fill().map(() => createNewQuestion(newType));
            } else {
                // Nếu tăng số câu hỏi, thêm câu hỏi mới
                if (diff > 0) {
                    const additionalQuestions = Array(diff).fill().map(() => createNewQuestion(oldType));
                    currentQuestions = [...currentQuestions, ...additionalQuestions];
                }
                // Nếu giảm số câu hỏi, xóa bớt câu hỏi từ cuối
                else if (diff < 0) {
                    currentQuestions = currentQuestions.slice(0, newNum);
                }
            }

            // Kết hợp câu hỏi đã được cập nhật với các câu hỏi khác loại
            const updatedQuestions = [...otherQuestions, ...currentQuestions];

            // Cập nhật state với cả cấu trúc mới và câu hỏi mới
            setForm({
                ...form,
                structure: newStructure,
                questions: updatedQuestions,
                numQuestions: calculateTotalQuestions() + (field === 'num' ? diff : 0)
            });
        } else {
            // Trường hợp thay đổi các field khác (như section), chỉ cập nhật cấu trúc
            setForm({
                ...form,
                structure: newStructure
            });
        }
    };

    // Cũng cần cập nhật handleInitialQuestions để tạo số lượng câu hỏi ban đầu chính xác
    // Thêm useEffect để khởi tạo câu hỏi ban đầu
    useEffect(() => {
        // Chỉ chạy một lần khi component được mount và questions trống
        if (form.questions.length === 0 && form.structure.length > 0) {
            let initialQuestions = [];

            form.structure.forEach(section => {
                const questionCount = parseInt(section.num || 0);
                for (let i = 0; i < questionCount; i++) {
                    initialQuestions.push(createNewQuestion(section.type));
                }
            });

            setForm(prev => ({
                ...prev,
                questions: initialQuestions
            }));
        }
    }, []); // Chỉ chạy một lần khi component được mount

    // Cập nhật hàm handleAddStructure để mặc định là tự luận
    const handleAddStructure = () => {
        const newSection = {
            section: `Phần ${form.structure.length + 1}`,
            num: 1,
            type: 'tuluan' // Thay đổi từ 'tracnghiem' thành 'tuluan'
        };

        // Tạo một câu hỏi mới khi thêm section mới - loại tự luận
        const newQuestion = createNewQuestion('tuluan');

        setForm({
            ...form,
            structure: [...form.structure, newSection],
            questions: [...form.questions, newQuestion],
            numQuestions: calculateTotalQuestions() + 1
        });
    };

    const handleDeleteStructure = (idx) => {
        if (form.structure.length <= 1) return;

        const deletedSection = form.structure[idx];
        const deletedSectionNumQuestions = parseInt(deletedSection.num || 0);
        const deletedSectionType = deletedSection.type;

        const newStructure = form.structure.filter((_, i) => i !== idx);

        // Xóa câu hỏi tương ứng với section bị xóa
        const newQuestions = form.questions.filter(q => q.type !== deletedSectionType);

        setForm({
            ...form,
            structure: newStructure,
            questions: newQuestions,
            numQuestions: calculateTotalQuestions() - deletedSectionNumQuestions
        });
    };

    const handleAddQuestion = (type) => {
        let newQ;
        switch (type) {
            case 'tracnghiem':
                newQ = {
                    type: 'tracnghiem',
                    content: '',
                    options: ['', '', '', ''],
                    answer: 0,
                    hasImage: false, // Flag để kiểm tra có sử dụng hình ảnh hay không
                    image: null,
                    imagePreview: null,
                    optionImages: [null, null, null, null],
                    optionImagePreviews: [null, null, null, null]
                };
                break;
            case 'dungsai':
                newQ = {
                    type: 'dungsai',
                    content: '',
                    options: ['', '', '', ''],
                    answers: [false, false, false, false],
                    hasImage: false, // Flag để kiểm tra có sử dụng hình ảnh hay không
                    image: null,
                    imagePreview: null,
                    optionImages: [null, null, null, null],
                    optionImagePreviews: [null, null, null, null]
                };
                break;
            case 'tuluan':
                newQ = {
                    type: 'tuluan',
                    content: '',
                    answer: '',
                    hasImage: false, // Flag để kiểm tra có sử dụng hình ảnh hay không
                    image: null,
                    imagePreview: null,
                    answerImage: null,
                    answerImagePreview: null
                };
                break;
            default:
                newQ = {
                    type: 'tracnghiem',
                    content: '',
                    options: ['', '', '', ''],
                    answer: 0,
                    hasImage: false,
                    image: null,
                    imagePreview: null,
                    optionImages: [null, null, null, null],
                    optionImagePreviews: [null, null, null, null]
                };
        }
        setForm({ ...form, questions: [...form.questions, newQ] });
    };

    const toggleHasImage = (questionIdx) => {
        const newQuestions = [...form.questions];
        newQuestions[questionIdx].hasImage = !newQuestions[questionIdx].hasImage;
        if (!newQuestions[questionIdx].hasImage) {
            newQuestions[questionIdx].image = null;
            newQuestions[questionIdx].imagePreview = null;
        }
        setForm({ ...form, questions: newQuestions });
    };

    const handleImageUpload = (questionIdx, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn một file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }

        const newQuestions = [...form.questions];
        const reader = new FileReader();

        reader.onload = (event) => {
            newQuestions[questionIdx].imagePreview = event.target.result;
            newQuestions[questionIdx].image = file;
            setForm({ ...form, questions: newQuestions });
        };

        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (questionIdx) => {
        const newQuestions = [...form.questions];
        newQuestions[questionIdx].image = null;
        newQuestions[questionIdx].imagePreview = null;
        setForm({ ...form, questions: newQuestions });
    };

    const handleOptionImageUpload = (questionIdx, optionIdx, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn một file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }

        const newQuestions = [...form.questions];
        const reader = new FileReader();

        reader.onload = (event) => {
            const optionImagePreviews = [...newQuestions[questionIdx].optionImagePreviews || []];
            const optionImages = [...newQuestions[questionIdx].optionImages || []];

            optionImagePreviews[optionIdx] = event.target.result;
            optionImages[optionIdx] = file;

            newQuestions[questionIdx].optionImagePreviews = optionImagePreviews;
            newQuestions[questionIdx].optionImages = optionImages;

            setForm({ ...form, questions: newQuestions });
        };

        reader.readAsDataURL(file);
    };

    const handleRemoveOptionImage = (questionIdx, optionIdx) => {
        const newQuestions = [...form.questions];

        const optionImagePreviews = [...newQuestions[questionIdx].optionImagePreviews || []];
        const optionImages = [...newQuestions[questionIdx].optionImages || []];

        optionImagePreviews[optionIdx] = null;
        optionImages[optionIdx] = null;

        newQuestions[questionIdx].optionImagePreviews = optionImagePreviews;
        newQuestions[questionIdx].optionImages = optionImages;

        setForm({ ...form, questions: newQuestions });
    };

    const handleAnswerImageUpload = (questionIdx, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn một file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }

        const newQuestions = [...form.questions];
        const reader = new FileReader();

        reader.onload = (event) => {
            newQuestions[questionIdx].answerImagePreview = event.target.result;
            newQuestions[questionIdx].answerImage = file;
            setForm({ ...form, questions: newQuestions });
        };

        reader.readAsDataURL(file);
    };

    const handleRemoveAnswerImage = (questionIdx) => {
        const newQuestions = [...form.questions];
        newQuestions[questionIdx].answerImage = null;
        newQuestions[questionIdx].answerImagePreview = null;
        setForm({ ...form, questions: newQuestions });
    };

    const handleTrueFalseChange = (questionIdx, optionIdx, isTrue) => {
        const newQuestions = [...form.questions];
        const answers = [...newQuestions[questionIdx].answers];
        answers[optionIdx] = isTrue;
        newQuestions[questionIdx].answers = answers;
        setForm({ ...form, questions: newQuestions });
    };

    const handleQuestionChange = (idx, field, value) => {
        const newQuestions = [...form.questions];
        if (field === 'options') {
            newQuestions[idx].options = value;
        } else {
            newQuestions[idx][field] = value;
        }
        setForm({ ...form, questions: newQuestions });
    };

    const handleDeleteQuestion = (idx) => {
        const newQuestions = form.questions.filter((_, i) => i !== idx);
        setForm({ ...form, questions: newQuestions });
    };

    const handleClose = () => {
        try {
            if (isStandalone) {
                console.log('ExamForm2025: Navigating back to exams list...');
                // Consistent path that matches the nested route in AdminDashboard
                navigate('/admin/dashboard/exams');
            } else if (onClose) {
                console.log('ExamForm2025: Calling onClose function...');
                onClose();
            }
        } catch (err) {
            console.error("Navigation error:", err);
            // Use consistent path as fallback
            window.location.href = '/admin/dashboard/exams';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitLoading(true);

        // Chuẩn hóa dữ liệu gửi lên backend
        const payload = {
            name: form.name,
            subject: form.subject,
            duration: form.duration,
            status: form.status,
            note: form.note,
            structure: form.structure,
            questions: form.questions
        };

        try {
            // If it's an edit (we have an ID), use PUT instead of POST
            const method = id ? 'PUT' : 'POST';
            const endpoint = id ? `http://localhost:5000/api/tests/${id}` : 'http://localhost:5000/api/tests';

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setSubmitLoading(false);
                if (isStandalone) {
                    console.log('ExamForm2025: Submit successful, navigating back to exams list...');
                    // Use consistent path
                    navigate('/admin/dashboard/exams');
                } else if (onSubmit) {
                    onSubmit(form);
                }
            } else {
                setError(data.message || 'Thao tác đề thi thất bại');
                setSubmitLoading(false);
            }
        } catch (err) {
            setError('Không thể kết nối tới server');
            setSubmitLoading(false);
        }
    };

    const questionCounts = {
        tracnghiem: form.questions.filter(q => q.type === 'tracnghiem').length,
        dungsai: form.questions.filter(q => q.type === 'dungsai').length,
        tuluan: form.questions.filter(q => q.type === 'tuluan').length
    };

    const containerClass = isStandalone
        ? "exam2025-standalone-container"
        : "exam2025-form-modal";

    console.log("Rendering with container class:", containerClass);

    // Include loading indicator in the component render
    if (isLoading) {
        return (
            <div className={containerClass}>
                <div className="exam2025-loading">
                    <h3>Đang tải dữ liệu đề thi...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam2025-error">
                <h3>Lỗi</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/admin/dashboard/exams')}>Quay lại</button>
            </div>
        );
    }

    return (
        <div className={containerClass}>
            <div className="exam2025-form-container">
                <div className="exam2025-form-header">
                    <h2>{id ? 'Chỉnh sửa đề thi' : 'Tạo đề thi tốt nghiệp THPT 2025'}</h2>
                    {isStandalone && (
                        <button className="btn-back" onClick={handleClose}>
                            <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
                    )}
                </div>
                <form className="exam2025-form-body" onSubmit={handleSubmit}>
                    <div className="form-left">
                        <div className="form-left-title">
                            <i className="fas fa-clipboard-list"></i>
                            <h3>Thông tin đề thi</h3>
                        </div>

                        <div className="form-section">
                            <div className="form-section-header">
                                <i className="fas fa-info-circle"></i> Thông tin cơ bản
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-file-alt"></i> Tên đề thi</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Đề thi thử Toán 2025"
                                />
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-book"></i> Môn thi</label>
                                <select name="subject" value={form.subject} onChange={handleChange} required>
                                    <option value="">Chọn môn</option>
                                    <option value="Toán">Toán</option>

                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                    <option value="Lý">Vật Lý</option>
                                    <option value="Hóa">Hóa Học</option>
                                    <option value="Sinh">Sinh Học</option>
                                    <option value="Sử">Lịch Sử</option>
                                    <option value="Địa">Địa Lý</option>
                                    <option value="GDCD">GDKL-PL</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="form-section-header">
                                <i className="fas fa-cogs"></i> Cấu hình đề thi
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-clock"></i> Thời gian làm bài (phút)</label>
                                <input
                                    name="duration"
                                    type="number"
                                    min="10"
                                    max="180"
                                    value={form.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-list-ol"></i> Số câu hỏi</label>
                                <input
                                    name="numQuestions"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={calculateTotalQuestions()}
                                    disabled={true}
                                    style={{ backgroundColor: '#f2f6ff' }}
                                />
                                <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
                                    (Được tính tự động từ cấu trúc đề thi)
                                </small>
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-layer-group"></i> Cấu trúc đề thi</label>

                                <div className="structure-header" style={{
                                    display: 'flex',
                                    marginBottom: '8px',
                                    paddingLeft: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569'
                                }}>
                                    <div style={{ width: '15%', textAlign: 'center' }}>Phần</div>
                                    <div style={{ width: '30%', paddingLeft: '10px' }}>Số câu hỏi</div>
                                    <div style={{ width: '35%', paddingLeft: '10px' }}>Loại câu hỏi</div>
                                    <div style={{ width: '10%' }}></div>
                                </div>

                                {form.structure.map((s, idx) => (
                                    <div className="structure-row" key={idx}>
                                        <input
                                            type="text"
                                            value={s.section}
                                            onChange={e => handleStructureChange(idx, 'section', e.target.value)}
                                            placeholder="Tên phần"
                                            style={{
                                                width: '15%',
                                                textAlign: 'center',
                                                backgroundColor: '#f2f6ff'
                                            }}
                                            disabled={true}
                                            required
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={s.num}
                                            onChange={e => handleStructureChange(idx, 'num', e.target.value)}
                                            placeholder="Số câu"
                                            style={{ width: '30%' }}
                                            required
                                        />

                                        {/* Thay thế select dropdown bằng các nút chọn loại câu hỏi */}
                                        <div className="question-type-buttons" style={{ width: '35%', display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className={`type-btn ${s.type === 'tracnghiem' ? 'active' : ''}`}
                                                onClick={() => handleStructureChange(idx, 'type', 'tracnghiem')}
                                            >
                                                Trắc nghiệm
                                            </button>
                                            <button
                                                type="button"
                                                className={`type-btn ${s.type === 'dungsai' ? 'active' : ''}`}
                                                onClick={() => handleStructureChange(idx, 'type', 'dungsai')}
                                            >
                                                Đúng sai
                                            </button>
                                            <button
                                                type="button"
                                                className={`type-btn ${s.type === 'tuluan' ? 'active' : ''}`}
                                                onClick={() => handleStructureChange(idx, 'type', 'tuluan')}
                                            >
                                                Tự luận
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className="delete-structure-btn"
                                            onClick={() => handleDeleteStructure(idx)}
                                            disabled={form.structure.length <= 1}
                                            style={{
                                                width: '10%',
                                                background: 'none',
                                                border: 'none',
                                                color: '#f44336',
                                                cursor: form.structure.length <= 1 ? 'not-allowed' : 'pointer',
                                                opacity: form.structure.length <= 1 ? 0.5 : 1
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-structure-btn"
                                    onClick={handleAddStructure}
                                    style={{
                                        background: 'none',
                                        border: '1px dashed #ccc',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        marginTop: '10px',
                                        cursor: 'pointer',
                                        color: '#00b09b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Thêm phần mới
                                </button>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="form-section-header">
                                <i className="fas fa-sliders-h"></i> Cài đặt khác
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-sticky-note"></i> Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleChange}
                                    placeholder="Ghi chú về đề thi, ví dụ: Đề có phần tự luận, đáp án riêng..."
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-globe"></i> Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange} required>
                                    <option value="public">Công khai</option>
                                    <option value="draft">Nháp</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-right">
                        <div className="form-section-header">
                            <i className="fas fa-question-circle"></i> Danh sách câu hỏi
                        </div>
                        <div className="question-section-tabs">
                            <button
                                type="button"
                                className={activeSection === 'tracnghiem' ? 'active' : ''}
                                onClick={() => setActiveSection('tracnghiem')}
                            >
                                <i className="fas fa-check-circle"></i> Trắc nghiệm ({questionCounts.tracnghiem})
                            </button>
                            <button
                                type="button"
                                className={activeSection === 'dungsai' ? 'active' : ''}
                                onClick={() => setActiveSection('dungsai')}
                            >
                                <i className="fas fa-check-square"></i> Đúng sai ({questionCounts.dungsai})
                            </button>
                            <button
                                type="button"
                                className={activeSection === 'tuluan' ? 'active' : ''}
                                onClick={() => setActiveSection('tuluan')}
                            >
                                <i className="fas fa-edit"></i> Tự luận ({questionCounts.tuluan})
                            </button>
                        </div>
                        <div className="questions-list">
                            {form.questions.filter(q => q.type === activeSection).map((q, idx) => (
                                <div className="question-item" key={idx}>
                                    <div className="question-header">
                                        <span>Câu {form.questions.filter(q => q.type === activeSection).indexOf(q) + 1}</span>
                                        <div className="question-actions">
                                            <div className="image-toggle">
                                                <label className="image-toggle-label" title="Thêm/ẩn hình ảnh minh họa">
                                                    <input
                                                        type="checkbox"
                                                        checked={q.hasImage}
                                                        onChange={() => toggleHasImage(form.questions.indexOf(q))}
                                                    />
                                                    <i className="fas fa-image"></i>
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                className="delete-q-btn"
                                                onClick={() => handleDeleteQuestion(form.questions.indexOf(q))}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        className="question-content"
                                        placeholder="Nhập nội dung câu hỏi... (có thể dùng LaTeX, ví dụ: $f(x) = e^x$)"
                                        value={q.content}
                                        onChange={e => handleQuestionChange(form.questions.indexOf(q), 'content', e.target.value)}
                                        required
                                    />
                                    {q.hasImage && (
                                        <div className="question-image-container">
                                            {q.imagePreview ? (
                                                <div className="image-preview-wrapper">
                                                    <img
                                                        src={q.imagePreview}
                                                        alt="Question illustration"
                                                        className="question-image-preview"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => handleRemoveImage(form.questions.indexOf(q))}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="upload-image-container">
                                                    <label className="upload-image-btn">
                                                        <i className="fas fa-image"></i> Tải lên hình ảnh
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(form.questions.indexOf(q), e)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {q.type === 'tracnghiem' ? (
                                        <div className="question-options">
                                            {q.options.map((opt, oidx) => (
                                                <div className="option-row" key={oidx}>
                                                    <input
                                                        type="radio"
                                                        name={`answer-${idx}`}
                                                        checked={q.answer === oidx}
                                                        onChange={() => handleQuestionChange(form.questions.indexOf(q), 'answer', oidx)}
                                                    />
                                                    <div className="option-content">
                                                        <input
                                                            type="text"
                                                            className="option-input"
                                                            placeholder={`Đáp án ${String.fromCharCode(65 + oidx)} (có thể dùng LaTeX)`}
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOpts = [...q.options];
                                                                newOpts[oidx] = e.target.value;
                                                                handleQuestionChange(form.questions.indexOf(q), 'options', newOpts);
                                                            }}
                                                            required
                                                        />
                                                        <div className="option-image-upload">
                                                            <label className="option-image-btn" title="Thêm hình ảnh cho đáp án">
                                                                <i className="fas fa-image"></i>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleOptionImageUpload(form.questions.indexOf(q), oidx, e)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {q.optionImagePreviews && q.optionImagePreviews[oidx] && (
                                                        <div className="option-image-preview-container">
                                                            <img
                                                                src={q.optionImagePreviews[oidx]}
                                                                alt={`Option ${String.fromCharCode(65 + oidx)} image`}
                                                                className="option-image-preview"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="remove-option-image-btn"
                                                                onClick={() => handleRemoveOptionImage(form.questions.indexOf(q), oidx)}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : q.type === 'dungsai' ? (
                                        <div className="question-options dungsai-options">
                                            {q.options.map((opt, oidx) => (
                                                <div className="option-row" key={oidx}>
                                                    <input
                                                        type="text"
                                                        className="option-input"
                                                        placeholder={`Phương án ${String.fromCharCode(65 + oidx)} (có thể dùng LaTeX)`}
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpts = [...q.options];
                                                            newOpts[oidx] = e.target.value;
                                                            handleQuestionChange(form.questions.indexOf(q), 'options', newOpts);
                                                        }}
                                                        required
                                                    />
                                                    <div className="true-false-buttons">
                                                        <label className={`tf-label ${q.answers[oidx] === true ? 'selected' : ''}`}>
                                                            <input
                                                                type="radio"
                                                                name={`tf-${idx}-${oidx}`}
                                                                checked={q.answers[oidx] === true}
                                                                onChange={() => handleTrueFalseChange(form.questions.indexOf(q), oidx, true)}
                                                            />
                                                            Đúng
                                                        </label>
                                                        <label className={`tf-label ${q.answers[oidx] === false ? 'selected' : ''}`}>
                                                            <input
                                                                type="radio"
                                                                name={`tf-${idx}-${oidx}`}
                                                                checked={q.answers[oidx] === false}
                                                                onChange={() => handleTrueFalseChange(form.questions.indexOf(q), oidx, false)}
                                                            />
                                                            Sai
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="question-tuluan">
                                            <div className="tuluan-answer-container">
                                                <input
                                                    type="text"
                                                    className="tuluan-answer"
                                                    placeholder="Đáp án mẫu (có thể dùng LaTeX, ví dụ: \\sqrt{3} + \\frac{\\pi}{6})"
                                                    value={q.answer}
                                                    onChange={e => handleQuestionChange(form.questions.indexOf(q), 'answer', e.target.value)}
                                                />
                                                <div className="answer-image-upload">
                                                    <label className="answer-image-btn" title="Thêm hình ảnh cho đáp án">
                                                        <i className="fas fa-image"></i>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleAnswerImageUpload(form.questions.indexOf(q), e)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <small style={{ color: '#4361ee' }}>Bạn có thể nhập công thức LaTeX, ví dụ: <b>\\sqrt&#123;3&#125; + \\frac&#123;\\pi&#125;&#123;6&#125;</b></small>
                                            {q.answerImagePreview && (
                                                <div className="answer-image-preview-container">
                                                    <img
                                                        src={q.answerImagePreview}
                                                        alt="Answer image"
                                                        className="answer-image-preview"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-answer-image-btn"
                                                        onClick={() => handleRemoveAnswerImage(form.questions.indexOf(q))}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="add-q-btn"
                                onClick={() => handleAddQuestion(activeSection)}
                            >
                                <i className="fas fa-plus"></i> Thêm câu hỏi {activeSection === 'tracnghiem' ? 'trắc nghiệm' : activeSection === 'dungsai' ? 'đúng sai' : 'tự luận'}
                            </button>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={handleClose}>
                                <i className="fas fa-times"></i> {isStandalone ? 'Hủy bỏ' : 'Hủy'}
                            </button>
                            <button type="submit" className="btn-confirm" disabled={submitLoading}>
                                <i className="fas fa-save"></i> {submitLoading ? 'Đang lưu...' : (id ? 'Lưu thay đổi' : 'Tạo mới')}
                            </button>
                        </div>
                        {error && (
                            <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ExamForm2025;
