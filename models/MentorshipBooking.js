const mongoose = require('mongoose');

const mentorshipBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  mentorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentorship',
    required: true
  },
  slot_date: { type: Date, required: true },
  slot_time: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  meeting_link: String,
  user_notes: String,
  mentor_notes: String

}, {
  timestamps: true
});

module.exports = mongoose.model('MentorshipBooking', mentorshipBookingSchema);
