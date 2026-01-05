const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  title: { type: String, required: true }, // e.g., "1:1 Career Guidance"
  programImage: String, // URL
  description: String,
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  duration: { type: Number, required: true }, // in minutes
  
  // Available Slots
  availableSlots: [slotSchema],
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
