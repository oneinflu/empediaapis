const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Company = require('../models/Company');
const Course = require('../models/Course');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// Admin Auth
exports.createAdmin = async (req, res) => {
  try {
    const { password, ...otherData } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const admin = new Admin({ ...otherData, password_hash });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // In a real app, generate JWT here
    const token = createToken(admin._id);
    res.status(200).json({ 
      message: 'Login successful', 
      _id: admin._id, 
      role: admin.role, 
      full_name: admin.full_name,
      email: admin.email,
      token 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mentor Moderation
exports.approveMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Job Moderation
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internship Moderation
exports.approveInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Company Moderation
exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Course Management (Admin specific wrappers if needed, or just reuse courseController)
exports.createCourse = async (req, res) => {
    // Reusing logic or calling course controller logic could be done, 
    // but here we can just create a Course directly as Admin
    try {
        const course = new Course(req.body);
        const savedCourse = await course.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
