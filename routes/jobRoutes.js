const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const upload = require('../middleware/upload');

// Create a new job
router.post('/', upload.single('coverImage'), jobController.createJob);

// Get all jobs
router.get('/', jobController.getAllJobs);

// Get a single job by ID
router.get('/:id', jobController.getJobById);

// Update a job by ID
router.put('/:id', upload.single('coverImage'), jobController.updateJob);

// Delete a job by ID
router.delete('/:id', jobController.deleteJob);

module.exports = router;
