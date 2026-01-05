const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const applicationController = require('../controllers/applicationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Auth
router.post('/create', adminController.createAdmin);
router.post('/login', adminController.loginAdmin);

// Applications (Admin)
router.get('/applications', protect, isAdmin, applicationController.getAllApplications);

// Mentors
router.put('/mentors/:id/approve', adminController.approveMentor);
router.put('/mentors/:id/reject', adminController.rejectMentor);

// Jobs
router.put('/jobs/:id/approve', adminController.approveJob);
router.put('/jobs/:id/reject', adminController.rejectJob);

// Internships
router.put('/internships/:id/approve', adminController.approveInternship);
router.put('/internships/:id/reject', adminController.rejectInternship);

// Companies
router.put('/companies/:id/verify', adminController.verifyCompany);

// Courses
router.post('/courses', adminController.createCourse);

module.exports = router;
