const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  jobType: {
    type: String,
    default: 'Internship',
    trim: true
  },
  workMode: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  experienceLevel: [{
    type: String
  }],
  shortSummary: {
    type: String,
    trim: true
  },
  roleRationale: {
    type: String,
    trim: true
  },
  companyProblem: {
    type: String,
    trim: true
  },
  roleImpact: {
    type: String,
    trim: true
  },
  requiredSkills: [{
    type: String
  }],
  niceToHaveSkills: [{
    type: String
  }],
  education: {
    type: String,
    trim: true
  },
  responsibilities: {
    type: String,
    trim: true
  },
  salaryMin: {
    type: String,
    trim: true
  },
  salaryMax: {
    type: String,
    trim: true
  },
  conversionPossible: {
    type: String, // "Yes" or "No", could be Boolean
    default: "No"
  },
  perks: [{
    type: String
  }],
  minCourseCompletion: {
    type: String,
    trim: true
  },
  internshipExperienceRequired: {
    type: String, // "No" or "Yes", could be Boolean
    default: "No"
  },
  coverImage: {
    type: String // URL
  },
  // removed manual linked fields
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
