const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// User routes
router.post('/apply', protect, upload.single('resume'), applicationController.apply);
router.get('/my-applications', protect, applicationController.getUserApplications);

// Company/Recruiter routes (Should have additional role check in real app)
router.get('/admin/all', protect, isAdmin, applicationController.getAllApplications);
router.get('/all', protect, isAdmin, applicationController.getAllApplications);
router.get('/company/:company_id', protect, applicationController.getCompanyApplications);
router.get('/:id', protect, applicationController.getApplicationById);
router.put('/:id/status', protect, applicationController.updateStatus);
router.post('/:id/certificate', protect, upload.single('certificate'), applicationController.uploadCertificate);

module.exports = router;
