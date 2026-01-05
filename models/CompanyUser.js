const mongoose = require('mongoose');

const companyUserSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'recruiter'], 
    required: true 
  }
}, { 
  timestamps: true 
});

// Ensure a user can only have one role per company (optional constraint, but good practice)
companyUserSchema.index({ user_id: 1, company_id: 1 }, { unique: true });

module.exports = mongoose.model('CompanyUser', companyUserSchema);
