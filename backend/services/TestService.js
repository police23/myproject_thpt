const Test = require('../models/TestsModel');
const Section = require('../models/SectionsModel');
const Question = require('../models/QuestionsModel');
const mongoose = require('mongoose');

// Helper function to handle file uploads
const handleFileUpload = async (file) => {
    return file ? `/uploads/${Date.now()}-${file.originalname}` : null;
};

exports.createTest = async (testData) => {
    const { name, subject, duration, status, note, structure, questions } = testData;

    // Create the test first
    const test = new Test({
        title: name,
        subject,
        duration: parseInt(duration) || 90,
        status,
        note,
        numQuestions: questions.length
    });
    
    await test.save();

    // Group questions by type
    const questionsByType = {};
    questions.forEach(q => {
        if (!questionsByType[q.type]) {
            questionsByType[q.type] = [];
        }
        questionsByType[q.type].push(q);
    });

    // Process each section in structure
    for (const sectionData of structure) {
        if (parseInt(sectionData.num) <= 0) continue;
        
        // Create a new section
        const newSection = new Section({
            title: sectionData.section,
            type: sectionData.type,
            num: parseInt(sectionData.num) || 0,
            pointsPerQuestion: parseFloat(sectionData.pointsPerQuestion) || 0,
            points: parseFloat(sectionData.points) || 0,
            test_id: test._id
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
                questionData.answerImage = q.answerImagePreview;
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
    
    // Final save of test with section references
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
                questionData.answerImage = q.answerImagePreview;
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
