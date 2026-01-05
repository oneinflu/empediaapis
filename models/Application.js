const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Can be applied to EITHER a Job OR an Internship
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Application Data
  resume_url: {
    type: String,
    required: true
  },
  cover_letter: String,
  portfolio_url: String,
  
  // Status Tracking
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Shortlisted', 'Interviewing', 'Offer Sent', 'Hired', 'Rejected', 'Withdrawn', 'Completed'],
    default: 'Applied'
  },
  
  // Certificate (for completed internships)
  certificate_url: String,
  
  // History of status changes
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // HR or Admin
  }],
  
  // HR/Recruiter Notes (Internal)
  internal_notes: String,
  
  // Screening Answers (if we add screening questions later)
  answers: [{
    question: String,
    answer: String
  }]

}, {
  timestamps: true
});

// Ensure a user can only apply once to a specific job or internship
applicationSchema.index({ user: 1, job: 1 }, { unique: true, partialFilterExpression: { job: { $exists: true } } });
applicationSchema.index({ user: 1, internship: 1 }, { unique: true, partialFilterExpression: { internship: { $exists: true } } });

module.exports = mongoose.model('Application', applicationSchema);
