const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date, // null if current
  isCurrent: { type: Boolean, default: false },
  description: String
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  grade: String,
  description: String
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: Date,
  expirationDate: Date,
  credentialId: String,
  credentialUrl: String
});

const userSchema = new mongoose.Schema({
  // Basic Info
  full_name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String,
    trim: true
  },
  password_hash: { 
    type: String, 
    required: true 
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['Active', 'Blocked', 'Deleted'],
    default: 'Active'
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  
  // Profile Details
  profile_photo: String, // URL
  coverImage: String, // URL
  location: String,
  education_level: String, // e.g., "Bachelor's", "Master's"
  current_status: {
    type: String,
    enum: ['Student', 'Working professional', 'Job seeker'],
    default: 'Job seeker'
  },
  
  // Detailed Profile for ATS
  bio: String,
  skills: [String], // Array of skill names
  experiences: [experienceSchema],
  education: [educationSchema],
  certifications: [certificationSchema],
  
  // Resume
  resume_url: String, // URL to uploaded resume
  
  // Tracking
  last_login: Date,
  
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('User', userSchema);
