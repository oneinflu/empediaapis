const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

// Create a new mentor (Protected so we can link to User)
router.post('/', protect, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), mentorController.createMentor);

// Get all mentors
router.get('/', mentorController.getAllMentors);

// Get a single mentor by ID
router.get('/:id', mentorController.getMentorById);

// Update a mentor by ID
router.put('/:id', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), mentorController.updateMentor);

// Delete a mentor by ID
router.delete('/:id', mentorController.deleteMentor);

module.exports = router;
