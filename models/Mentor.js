const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  headline: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: String, // Keeping as String based on payload "", could be Number if strictly numeric
    trim: true
  },
  currentRole: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  expertiseTags: [{
    type: String
  }],
  primaryDomain: {
    type: String,
    trim: true
  },
  subSkills: [{
    type: String
  }],
  mentorshipTypes: [{
    type: String
  }],
  mentorshipFormats: [{
    type: String
  }],
  durationOptions: [{
    type: String
  }],
  pricingType: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free'
  },
  pricingAmount: {
    type: Number,
    default: 0
  },
  revenueShare: {
    type: Boolean,
    default: false
  },
  // removed manual linked fields
  minSkills: [{
    type: String
  }],
  courseCompletion: {
    type: String
  },
  internshipExperience: {
    type: String
  },
  weeklySlots: {
    type: Number
  },
  maxMentees: {
    type: Number
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
