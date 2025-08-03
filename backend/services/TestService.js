const Test = require('../models/TestsModel');
const Section = require('../models/SectionsModel');
const Question = require('../models/QuestionsModel');
const Result = require('../models/ResultsModel');
const mongoose = require('mongoose');

const handleFileUpload = async (file) => {
    return file ? `/uploads/${Date.now()}-${file.originalname}` : null;
};

exports.createTest = async (testData) => {
    const { name, subject, duration, status, note, structure, questions } = testData;

    const test = new Test({
        title: name,
        subject,
        duration: parseInt(duration) || 90,
        status,
        note,
        numQuestions: questions.length
    });
    
    await test.save();

    const questionsByType = {};
    questions.forEach(q => {
        if (!questionsByType[q.type]) {
            questionsByType[q.type] = [];
        }
        questionsByType[q.type].push(q);
    });

    for (const sectionData of structure) {
        if (parseInt(sectionData.num) <= 0) continue;
        
        const newSection = new Section({
            title: sectionData.section,
            type: sectionData.type,
            num: parseInt(sectionData.num) || 0,
            pointsPerQuestion: parseFloat(sectionData.pointsPerQuestion) || 0,
            points: parseFloat(sectionData.points) || 0,
            test_id: test._id
        });
        
        await newSection.save();
        
        const sectionQuestions = questionsByType[sectionData.type] || [];
        const sectionQuestionCount = Math.min(parseInt(sectionData.num) || 0, sectionQuestions.length);
        
        for (let i = 0; i < sectionQuestionCount; i++) {
            const q = sectionQuestions[i];
            
            const questionData = {
                question: q.content,
                type: q.type,
                section_id: newSection._id,
                test_id: test._id,
                hasImage: q.hasImage || false,
                image: q.imagePreview
            };
            
            // Add type-specific fields
            if (q.type === 'tracnghiem') {
                questionData.options = q.options || [];
                questionData.correct_answer = q.answer?.toString() || '0';
                questionData.optionImages = q.optionImagePreviews || [];
            } else if (q.type === 'dungsai') {
                questionData.options = q.options || [];
                questionData.answers = q.answers || [false, false, false, false];
                questionData.optionImages = q.optionImagePreviews || [];
            } else if (q.type === 'tuluan') {
                questionData.correct_answer = q.answer || '';
                
            }
            
            // Save the question
            const newQuestion = new Question(questionData);
            await newQuestion.save();
            
            // Add to section's questions
            newSection.questions.push(newQuestion._id);
        }
        
        // Update section with questions
        await Section.findByIdAndUpdate(newSection._id, { questions: newSection.questions });
        
        // Add section to test
        test.sections.push(newSection._id);
    }
    
    await test.save();

    return test;
};

exports.getAllTests = async () => {
    return await Test.find()
        .sort({ created_at: -1 })
        .select('title subject status created_at numQuestions sections')
        .populate('created_by', 'name');
};

exports.getTestById = async (testId) => {
    const test = await Test.findById(testId)
        .populate({
            path: 'sections',
            populate: {
                path: 'questions'
            }
        });
        
    if (!test) {
        return null;
    }
    
    // Make sure all sections have valid questions array
    if (test.sections) {
        for (let i = 0; i < test.sections.length; i++) {
            if (!test.sections[i].questions) {
                test.sections[i].questions = [];
            }
            
            // If questions don't exist in this section, try to find them by section_id
            if (test.sections[i].questions.length === 0) {
                const sectionQuestions = await Question.find({ section_id: test.sections[i]._id });
                test.sections[i].questions = sectionQuestions;
            }
        }
    }
    
    return test;
};

exports.updateTest = async (testId, updateData) => {
    const { name, subject, duration, status, note, structure, questions } = updateData;
    
    const existingTest = await Test.findById(testId);
    if (!existingTest) {
        return null;
    }

    // First, get all existing section IDs to delete later
    const oldSectionIds = [...existingTest.sections];
    
    // Clear sections from test
    existingTest.sections = [];
    
    // Update test basic info
    existingTest.title = name;
    existingTest.subject = subject;
    existingTest.duration = parseInt(duration) || 90;
    existingTest.status = status;
    existingTest.note = note;
    existingTest.numQuestions = questions.length;
    existingTest.updatedAt = new Date();
    
    // Save test to get reference
    await existingTest.save();
    
    // Group questions by type
    const questionsByType = {};
    questions.forEach(q => {
        if (!questionsByType[q.type]) {
            questionsByType[q.type] = [];
        }
        questionsByType[q.type].push(q);
    });
    
    // Create new sections and questions
    for (const sectionData of structure) {
        if (parseInt(sectionData.num) <= 0) continue;
        
        const newSection = new Section({
            title: sectionData.section,
            type: sectionData.type,
            num: parseInt(sectionData.num) || 0,
            pointsPerQuestion: parseFloat(sectionData.pointsPerQuestion) || 0,
            points: parseFloat(sectionData.points) || 0,
            test_id: existingTest._id
        });
        
        await newSection.save();
        
        // Get questions for this section type
        const sectionQuestions = questionsByType[sectionData.type] || [];
        const sectionQuestionCount = Math.min(parseInt(sectionData.num) || 0, sectionQuestions.length);
        
        // Create questions for this section
        for (let i = 0; i < sectionQuestionCount; i++) {
            const q = sectionQuestions[i];
            
            const questionData = {
                question: q.content,
                type: q.type,
                section_id: newSection._id,
                test_id: existingTest._id,
                hasImage: q.hasImage || false,
                image: q.imagePreview
            };
            
            // Add type-specific fields
            if (q.type === 'tracnghiem') {
                questionData.options = q.options || [];
                questionData.correct_answer = q.answer?.toString() || '0';
                questionData.optionImages = q.optionImagePreviews || [];
            } else if (q.type === 'dungsai') {
                questionData.options = q.options || [];
                questionData.answers = q.answers || [false, false, false, false];
                questionData.optionImages = q.optionImagePreviews || [];
            } else if (q.type === 'tuluan') {
                questionData.correct_answer = q.answer || '';
                
            }
            
            // Save the question
            const newQuestion = new Question(questionData);
            await newQuestion.save();
            
            // Add to section's questions
            newSection.questions.push(newQuestion._id);
        }
        
        // Update section with questions
        await Section.findByIdAndUpdate(newSection._id, { questions: newSection.questions });
        
        // Add section to test
        existingTest.sections.push(newSection._id);
    }
    
    // Final save of test with section references
    await existingTest.save();
    
    // Now delete old sections and questions
    for (const sectionId of oldSectionIds) {
        // Delete questions linked to this section
        await Question.deleteMany({ section_id: sectionId });
        // Delete the section itself
        await Section.findByIdAndDelete(sectionId);
    }

    return existingTest;
};

exports.deleteTest = async (testId) => {
    const test = await Test.findById(testId);
    
    if (!test) {
        return false;
    }

    // Delete all questions in all sections
    for (const sectionId of test.sections) {
        const section = await Section.findById(sectionId);
        if (section) {
            await Question.deleteMany({ _id: { $in: section.questions } });
            await Section.findByIdAndDelete(sectionId);
        }
    }

    // Delete the test
    await Test.findByIdAndDelete(testId);
    return true;
};


exports.submitExam = async ({ examId, answers, userId, timeSpent }) => {
    
    const test = await Test.findById(examId).populate({
        path: 'sections',
        populate: { path: 'questions' }
    });
    

    let total_score = 0;
    let answersArr = [];
    let section_scores = [];
    
    for (const section of test.sections) {
        let sectionScore = 0;
        for (const q of section.questions) {
            let qScore = section.pointsPerQuestion || 1;
            let userAnswer, isCorrect = false;
            // Lấy key là _id của câu hỏi
            const qid = q._id.toString();
            
            if (q.type === 'tracnghiem') {
                userAnswer = answers[qid];
                isCorrect = (userAnswer !== undefined && userAnswer === parseInt(q.correct_answer));
                if (isCorrect) sectionScore += qScore;
            } else if (q.type === 'dungsai') {
                let n = (q.options || []).length;
                let corrects = q.answers || [];
                let correctCount = 0;
                let userArr = [];
                for (let i = 0; i < n; i++) {
                    let userVal = answers[`${qid}-${i}`];
                    userArr.push(userVal);
                    if (userVal === corrects[i]) correctCount++;
                }
                let percent = 0;
                if (n > 0) {
                    if (correctCount === n) percent = 1;
                    else if (correctCount === n - 1) percent = 0.5;
                    else percent = 0;
                }
                sectionScore += Math.round(qScore * percent * 100) / 100;
                userAnswer = userArr.join(',');
                isCorrect = (percent === 1);
            } else if (q.type === 'tuluan') {
                userAnswer = answers[qid];
                // So sánh số, không phải chuỗi
                const correct = parseFloat(q.correct_answer);
                const user = parseFloat(userAnswer);
                isCorrect = !isNaN(correct) && !isNaN(user) && Math.abs(correct - user) < 1e-6;
                if (isCorrect) sectionScore += qScore;
            }

            answersArr.push({
                section_id: section._id,
                question_id: q._id,
                user_answer: userAnswer,
                is_correct: isCorrect
            });
        }
        section_scores.push({ section_id: section._id, score: sectionScore });
        total_score = total_score + sectionScore;
    }
    
    // Always create a new result to preserve history
    const endTime = new Date();
    
    const timeTakenInSeconds = timeSpent || (test.duration * 60);
    
    const safeTotalScore = typeof total_score === 'number' && !isNaN(total_score) ? total_score : 0;
    
    // Always create a new result to preserve test history
    const result = new Result({
        test_id: examId,
        user_id: userId,
        answers: answersArr,
        section_scores: section_scores,
        total_score: safeTotalScore,
        status: 'submitted',
        time_taken: timeTakenInSeconds,
        start_time: new Date(endTime.getTime() - (timeTakenInSeconds * 1000)),
        end_time: endTime,
        created_at: new Date()
    });
    
    // Explicitly set total_score using mongoose set method
    result.set('total_score', safeTotalScore);
    await result.save();
    
    // Prepare details with proper formatting for frontend
    const details = answersArr.map((a, idx) => {
        // Find the question object from the test
        let questionObj;
        for (const section of test.sections) {
            const question = section.questions.find(q => q._id.toString() === a.question_id.toString());
            if (question) {
                questionObj = question;
                break;
            }
        }
        
        return {
            question: questionObj || a.question_id,
            yourAnswer: a.user_answer,
            correctAnswer: a.is_correct ? a.user_answer : (questionObj?.correct_answer || ''),
            score: a.is_correct ? 1 : 0
        };
    });
    
    // Trả về kết quả cho frontend
    return {
        _id: result._id,
        score: total_score,
        total: test.sections.reduce((sum, section) => sum + (section.questions?.length || 0), 0),
        time_taken: timeTakenInSeconds,
        details: details
    };
};

exports.getStudentResults = async (userId) => {
    if (!userId) throw new Error('Thiếu userId');
    
    try {
        // Find all results for this user, populate test details
        const results = await Result.find({ user_id: userId })
            .populate('test_id')
            .sort({ created_at: -1 });
        
        return {
            success: true,
            results: results
        };
    } catch (error) {
        throw new Error(`Lỗi khi tải kết quả: ${error.message}`);
    }
};

exports.getStudentResultByTestId = async (testId, userId) => {
    if (!testId) throw new Error('Thiếu testId');
    if (!userId) throw new Error('Thiếu userId');
    
    try {
        // Fetch the complete test with all sections and questions
        const fullTest = await Test.findById(testId).populate({
            path: 'sections',
            populate: { path: 'questions' }
        });
        
        if (!fullTest) {
            throw new Error('Không tìm thấy dữ liệu đề thi đầy đủ');
        }
        
        // Find a specific result by test ID and user ID
        const result = await Result.findOne({ 
            test_id: testId, 
            user_id: userId 
        }).populate({
            path: 'answers.question_id',
            model: 'Question'
        });
        
        if (!result) {
            throw new Error('Không tìm thấy kết quả bài thi');
        }
        
        // Explicitly attach the full test data to the result
        result.test_id = fullTest;
        
        // Make sure section types are properly set for each question
        if (fullTest.sections && Array.isArray(fullTest.sections)) {
            fullTest.sections.forEach(section => {
                if (section && section.questions && Array.isArray(section.questions)) {
                    section.questions.forEach(question => {
                        // Ensure each question has a type property
                        if (!question.type && section.type) {
                            question.type = section.type;
                        }
                    });
                }
            });
        }
        
        return {
            success: true,
            result: result
        };
    } catch (error) {
        throw new Error(`Lỗi khi tải kết quả: ${error.message}`);
    }
};

exports.getStudentResultByResultId = async (resultId, userId) => {
    if (!resultId) throw new Error('Thiếu resultId');
    if (!userId) throw new Error('Thiếu userId');
    
    try {
        // First fetch the test details from the result
        const basicResult = await Result.findOne({
            _id: resultId,
            user_id: userId
        }).populate('test_id');
        
        if (!basicResult) {
            throw new Error('Không tìm thấy kết quả bài thi hoặc bạn không có quyền truy cập');
        }
        
        // Get the test ID to fetch complete test data
        const testId = basicResult.test_id?._id;
        if (!testId) {
            throw new Error('Không tìm thấy thông tin đề thi');
        }
        
        // Fetch the complete test with all sections and questions
        const fullTest = await Test.findById(testId).populate({
            path: 'sections',
            populate: { path: 'questions' }
        });
        
        if (!fullTest) {
            throw new Error('Không tìm thấy dữ liệu đề thi đầy đủ');
        }
        
        // Now fetch the result with user's answers
        const result = await Result.findOne({ 
            _id: resultId, 
            user_id: userId 
        }).populate({
            path: 'answers.question_id',
            model: 'Question'
        });
        
        if (!result) {
            throw new Error('Không tìm thấy kết quả bài thi hoặc bạn không có quyền truy cập');
        }
        
        // Explicitly attach the full test data to the result
        result.test_id = fullTest;
        
        // Make sure section types are properly set for each question
        if (fullTest.sections && Array.isArray(fullTest.sections)) {
            fullTest.sections.forEach(section => {
                if (section && section.questions && Array.isArray(section.questions)) {
                    section.questions.forEach(question => {
                        // Ensure each question has a type property
                        if (!question.type && section.type) {
                            question.type = section.type;
                        }
                    });
                }
            });
        }
        
        return {
            success: true,
            result: result
        };
    } catch (error) {
        throw new Error(`Lỗi khi tải kết quả: ${error.message}`);
    }
};

