const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        selectedOption: String,
        isCorrect: Boolean,
        points: Number
    }],
    score: {
        type: Number,
        required: true
    },
    totalPossibleScore: {
        type: Number,
        required: true
    },
    percentageScore: {
        type: Number,
        required: true
    },
    timeSpent: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    passed: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', ExamResultSchema); 