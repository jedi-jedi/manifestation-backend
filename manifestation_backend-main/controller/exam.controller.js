const express = require('express');
const router = express.Router();
const Exam = require('../model/Exam');
const ExamResult = require("../model/ExamResult")
const { verifyToken, verifyTokenAndCoordinator } = require('./middleware');

// Create a new exam
router.post('/exams', verifyTokenAndCoordinator, async (req, res) => {
    try {
        const { title, duration, questionIds, passingScore, instructions } = req.body;

        // Validate minimum requirements
        if (!questionIds || questionIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one question is required'
            });
        }

        // Calculate default duration based on number of questions
        // Assuming average 2 minutes per question plus 15 minutes buffer
        const calculatedDuration = (questionIds.length * 2 * 60) + (15 * 60);
        
        const exam = new Exam({
            title,
            duration: duration || calculatedDuration, // Use provided duration or calculated one
            questions: questionIds,
            totalQuestions: questionIds.length,
            passingScore: passingScore || 60, // Default passing score of 60%
            instructions: instructions || 'Please answer all questions.',
            createdBy: req.user.id,
            timePerQuestion: Math.floor((duration || calculatedDuration) / questionIds.length),
            difficulty: 'medium', // You can calculate this based on questions' difficulty
            status: 'draft' // Add a status field to control exam visibility
        });

        const savedExam = await exam.save();

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: savedExam
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating exam',
            error: error.message
        });
    }
});

// Get exam with questions
router.get('/exams/:id', verifyToken, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('questions')
            .populate('createdBy', 'name email');

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Calculate time remaining if exam is in progress
        const timeRemaining = exam.duration; // You'll need to implement this based on start time

        // Don't send correct answers to students
        const sanitizedQuestions = exam.questions.map(q => ({
            _id: q._id,
            title: q.title,
            description: q.description,
            options: q.options.map(opt => ({
                text: opt.text,
                _id: opt._id
            })),
            points: q.points || 1, // Add points per question
            type: q.type // Add question type (MCQ, essay, etc.)
        }));

        res.json({
            success: true,
            data: {
                ...exam._doc,
                questions: sanitizedQuestions,
                timeRemaining,
                totalPoints: sanitizedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching exam',
            error: error.message
        });
    }
});

//Get all exam 
router.get("/", verifyTokenAndCoordinator, async (req, res) => {
    try{
        const exam = await Exam.find();
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Submit exam answers
router.post('/exams/:id/submit', verifyToken, async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;
        const examId = req.params.id;
        const userId = req.user.id;

        // Verify if the exam is still valid to submit
        const exam = await Exam.findById(examId).populate('questions');
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if submission is within time limit
        if (timeSpent > exam.duration) {
            return res.status(400).json({
                success: false,
                message: 'Exam time limit exceeded'
            });
        }

        // Calculate score
        let totalScore = 0;
        let totalPossibleScore = 0;

        const gradedAnswers = answers.map(answer => {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) return null;

            const isCorrect = question.correctOption.toString() === answer.selectedOption;
            const points = question.points || 1;
            totalPossibleScore += points;
            
            if (isCorrect) {
                totalScore += points;
            }

            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                points: isCorrect ? points : 0
            };
        });

        // Calculate percentage score
        const percentageScore = (totalScore / totalPossibleScore) * 100;

        // Save exam result
        const examResult = new ExamResult({
            exam: examId,
            user: userId,
            answers: gradedAnswers,
            score: totalScore,
            totalPossibleScore,
            percentageScore,
            timeSpent,
            submittedAt: new Date(),
            passed: percentageScore >= exam.passingScore
        });

        await examResult.save();

        res.json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                examId,
                score: totalScore,
                totalPossibleScore,
                percentageScore,
                passed: percentageScore >= exam.passingScore,
                submittedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting exam',
            error: error.message
        });
    }
});

//Delete exam
router.delete("/delete", async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.status(200).json("Data Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }  
});

module.exports = router; 