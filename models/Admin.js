const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password_hash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['superadmin', 'moderator'], 
    default: 'superadmin' 
  },
  permissions: [{
    type: String
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Admin', adminSchema);
