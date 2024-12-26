const express = require('express');
const router = express.Router();
const Programme = require('../model/Programme');
const Session = require('../model/Session');
const Semester = require('../model/Semester');
const Quiz = require('../model/Quiz');
const { verifyToken } = require('./middleware');
const Exam = require('../model/Exam');

router.post('/start-quiz', verifyToken, async (req, res) => {
  const { programme, semester, session } = req.body;

  try {
    // Find the programme
    const programmeDoc = await Programme.findOne({ name: programme });
    if (!programmeDoc) {
      return res.status(404).json({ success: false, message: 'Programme not found.' });
    }

    // Find the session
    const sessionDoc = await Session.findOne({ name: session });
    if (!sessionDoc) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Find the semester
    const semesterDoc = await Semester.findOne({ name: semester });
    if (!semesterDoc) {
      return res.status(404).json({ success: false, message: 'Semester not found.' });
    }

    // Find the quiz based on programme, semester, and session
    const quiz = await Quiz.findOne({
      programme: programmeDoc._id,
      semester: semesterDoc._id,
      session: sessionDoc._id
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for selected options.' });
    }

    // Return the quiz data
    res.json({ success: true, quiz: quiz });
  } catch (error) {
    console.error(error);   
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//get one quiz
router.get("/find/:id", async (req, res) => {
  try {
    const exam = await Exam.findById();
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all Quiz
router.get("/", async (req, res) => {
  try {
    const exam = await Exam.find();
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Update
router.put("/", async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true },
    );
    res.status(200).json(exam);

  } catch (error) {
    res.status(500).json(error);
  }
});

//Delete
router.delete("/delete", async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json("Data Deleted Successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
