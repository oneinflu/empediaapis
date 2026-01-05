const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Video'], default: 'Video' },
  duration: { type: Number, default: 0 }, // minutes
  isPreviewFree: { type: Boolean, default: false },
  videoUrl: { type: String }, // Bunny video URL or ID
  supportingMaterialType: { type: String }, // PDF, Sheet, ZIP
  supportingMaterialUrl: { type: String },
  bunnyPath: { type: String } // storage path courses/{courseId}/{sectionId}/{lessonId}
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  bunnyPath: { type: String }, // storage path courses/{courseId}/{sectionId}
  lessons: [lessonSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  hook: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  skills: [{
    type: String
  }],
  courseType: {
    type: String
  },
  outcomes: [{
    type: String
  }],
  opportunities: [{
    type: String
  }],
  sections: [sectionSchema],
  instructorName: {
    type: String
  },
  instructorBio: {
    type: String
  },
  instructorLinkedin: {
    type: String
  },
  instructorTrustLine: {
    type: String
  },
  instructorCompanyLogos: [{
    type: String // URLs to logos
  }],
  priceType: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free'
  },
  priceAmount: {
    type: Number,
    default: 0
  },
  accessType: {
    type: String,
    enum: ['Lifetime', 'Subscription', 'Limited'],
    default: 'Lifetime'
  },
  accessDuration: {
    type: Number // Duration in days or months, if applicable
  },
  refundPolicy: {
    type: String
  },
  earlyBirdPrice: {
    type: Number
  },
  hasStudentDiscount: {
    type: Boolean,
    default: false
  },
  hasAssignment: {
    type: Boolean,
    default: false
  },
  hasQuiz: {
    type: Boolean,
    default: false
  },
  hasProject: {
    type: Boolean,
    default: false
  },
  hasCertificate: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String // URL
  },
  coverImage: {
    type: String // URL
  },
  completionLogic: {
    type: String,
    default: 'Watch %'
  },
  // removed manual linked fields
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxStudents: {
    type: Number
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
