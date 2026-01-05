const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/enroll', enrollmentController.enrollUser);
router.get('/', enrollmentController.getUserEnrollments);
router.get('/:id', enrollmentController.getEnrollmentById);
router.put('/:id/progress', enrollmentController.updateProgress);
router.get('/admin/all', protect, isAdmin, enrollmentController.getAllEnrollments);

module.exports = router;
