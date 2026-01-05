const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  industry: { 
    type: String, 
    trim: true 
  },
  website: { 
    type: String, 
    trim: true 
  },
  logo_url: {
    type: String
  },
  coverImage: {
    type: String
  },
  verified: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Company', companySchema);
