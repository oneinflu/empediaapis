const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public / User Routes
router.get('/', mentorshipController.getPrograms);
router.get('/:id', mentorshipController.getProgramById);
router.get('/user/my-bookings', protect, mentorshipController.getMyBookings);
router.get('/booking/:id', protect, mentorshipController.getBookingById);
router.post('/book', protect, mentorshipController.bookSlot);

// Mentor / Admin Routes
// In a real app, these would be protected by 'Mentor' role
router.post('/create', protect, upload.single('programImage'), mentorshipController.createProgram);
router.post('/:id/slots', protect, mentorshipController.addSlots);
router.get('/mentor/:mentor_id/bookings', protect, mentorshipController.getMentorBookings);

module.exports = router;
