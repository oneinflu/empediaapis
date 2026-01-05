const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  purchase_status: { 
    type: String, 
    enum: ['Free', 'Paid'], 
    required: true 
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  progress_percent: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  completion_status: { 
    type: String, 
    enum: ['In Progress', 'Completed'], 
    default: 'In Progress' 
  },
  certificate_url: { 
    type: String 
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Ensure a user can only enroll in a course once
courseEnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
