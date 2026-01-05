const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const upload = require('../middleware/upload');

// Create a new internship
router.post('/', upload.single('coverImage'), internshipController.createInternship);

// Get all internships
router.get('/', internshipController.getAllInternships);

// Get a single internship by ID
router.get('/:id', internshipController.getInternshipById);

// Update an internship by ID
router.put('/:id', upload.single('coverImage'), internshipController.updateInternship);

// Delete an internship by ID
router.delete('/:id', internshipController.deleteInternship);

module.exports = router;
