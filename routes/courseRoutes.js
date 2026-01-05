const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const upload = require('../middleware/upload');

// Create a new course
router.post('/', upload.any(), courseController.createCourse);

// Get all courses
router.get('/', courseController.getAllCourses);

// Get a single course by ID
router.get('/:id', courseController.getCourseById);

// Curriculum
router.get('/:id/curriculum', courseController.getCurriculum);
router.post('/:id/sections', courseController.addSection);
router.post('/:id/sections/:sectionId/lessons', courseController.addLesson);

// Update a course by ID
router.put('/:id', upload.any(), courseController.updateCourse);

// Delete a course by ID
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
