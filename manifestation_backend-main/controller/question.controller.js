const express = require('express');
const router = express.Router();
const Question = require('../model/Question');
const { verifyToken, verifyTokenAndCoordinator } = require('./middleware');  // Assuming you have auth middlewar;

// POST route to save questions
router.post('/questions', verifyTokenAndCoordinator, async (req, res) => {
  const { questions } = req.body;

  if (!questions || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'No questions provided.' });
  }

  try {
    // Create and save each question
    const createdQuestions = await Question.insertMany(questions);

    res.status(200).json({
      success: true,
      message: 'Questions posted successfully!',
      data: createdQuestions,
    });
  } catch (error) {
    console.error('Error posting questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting questions.',
    });
  }
});

// Get all questions with filtering and pagination
router.get('/questions', verifyTokenAndCoordinator, async (req, res) => {
    try {
        const {
            programme,
            semester,
            session,
            page = 1,
            limit = 10
        } = req.query;

        // Build query based on filters
        const query = {};
        if (programme) query.programme = programme;
        if (semester) query.semester = semester;
        if (session) query.session = session;

        // Execute query with pagination
        const questions = await Question.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await Question.countDocuments(query);

        res.json({
            success: true,
            data: questions,
            pagination: {
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: error.message
        });
    }
});


// Get a specific question by ID
router.get('/questions/:id', verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: error.message
        });
    }
});

// Update a question
router.put('/questions/:id', verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            options,
            difficulty,
            category,
            marks,
            timeLimit,
            tags,
            status
        } = req.body;

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if user is authorized to update
        if (question.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this question'
            });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                options,
                difficulty,
                category,
                marks,
                timeLimit,
                tags,
                status
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating question',
            error: error.message
        });
    }
});

// Delete a question
router.delete('/questions/:id', verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if user is authorized to delete
        if (question.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
        }

        await Question.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting question',
            error: error.message
        });
    }
});

module.exports = router;