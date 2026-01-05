const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/', userController.getAllUsers);
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), userController.updateProfile);

// Admin delete user (can be protected/role-checked in real app)
router.delete('/:id', userController.deleteUser);

module.exports = router;
