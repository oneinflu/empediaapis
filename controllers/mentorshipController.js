const Mentorship = require('../models/Mentorship');
const MentorshipBooking = require('../models/MentorshipBooking');
const Transaction = require('../models/Transaction');
const Mentor = require('../models/Mentor');

// --- Mentor Actions ---

// Create a new mentorship program/service
exports.createProgram = async (req, res) => {
  try {
    const { mentor_id, title, description, price, duration } = req.body;
    let programImage = null;
    
    if (req.file && req.file.fieldname === 'programImage') {
      programImage = req.file.path;
    }
    
    // In a real app, verify req.user.id owns the mentor profile
    
    const mentorship = await Mentorship.create({
      mentor: mentor_id,
      title,
      description,
      programImage,
      price,
      duration
    });

    res.status(201).json(mentorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add available slots to a program
exports.addSlots = async (req, res) => {
  try {
    const { id } = req.params; // Mentorship Program ID
    const { slots } = req.body; // Array of { date, startTime, endTime }

    const mentorship = await Mentorship.findById(id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Add slots
    mentorship.availableSlots.push(...slots);
    await mentorship.save();

    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- User Actions ---

// Get all mentorship programs (optionally filter by mentor)
exports.getPrograms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.mentor_id) {
      filter.mentor = req.query.mentor_id;
    }
    
    const programs = await Mentorship.find(filter).populate('mentor', 'fullName profilePhoto headline');
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single program details
exports.getProgramById = async (req, res) => {
  try {
    const program = await Mentorship.findById(req.params.id).populate('mentor');
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a slot
exports.bookSlot = async (req, res) => {
  try {
    const { mentorship_id, slot_id, user_notes } = req.body;
    const user_id = req.user.id;

    const mentorship = await Mentorship.findById(mentorship_id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Find the slot
    const slot = mentorship.availableSlots.id(slot_id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    // Create Transaction (Pending)
    const transaction = await Transaction.create({
      user_id,
      amount: mentorship.price,
      currency: mentorship.currency,
      status: 'Pending',
      payment_method: 'Card', // Mock
      related_entity: 'Mentorship',
      related_id: mentorship._id
    });

    // Create Booking
    const booking = await MentorshipBooking.create({
      user: user_id,
      mentor: mentorship.mentor,
      mentorship: mentorship._id,
      slot_date: slot.date,
      slot_time: slot.startTime,
      status: 'Pending',
      transaction: transaction._id,
      user_notes
    });

    // Mock Payment Success logic (In real app, this happens in a webhook)
    transaction.status = 'Success';
    await transaction.save();

    booking.status = 'Confirmed';
    booking.meeting_link = 'https://meet.google.com/mock-link-' + Date.now();
    await booking.save();

    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = user_id;
    await mentorship.save();

    res.status(201).json({ message: 'Booking confirmed', booking, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Bookings (User)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await MentorshipBooking.find({ user: req.user.id })
      .populate('mentor', 'fullName')
      .populate('mentorship', 'title')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Booking By ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await MentorshipBooking.findById(req.params.id)
      .populate('mentor', 'fullName headline profilePhoto')
      .populate('mentorship', 'title description duration price currency')
      .populate('user', 'full_name email'); // Populate user for mentor view
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check: User must be the mentee or the mentor
    // Note: req.user.id is the User ID.
    // If the user is a Mentor, we need to check if they own the mentor profile.
    // For simplicity, we'll allow if req.user.id matches booking.user (Mentee)
    // OR if we can verify they are the mentor.
    // Since we don't have easy Mentor mapping here without DB lookup, 
    // we will rely on frontend/middleware roles or just check User ID.
    
    // Check if requester is the mentee
    if (booking.user._id.toString() === req.user.id) {
       return res.json(booking);
    }
    
    // Check if requester is the mentor (Need to look up Mentor profile for this User)
    // Assuming we have a Mentor model where user_id matches req.user.id
    const Mentor = require('../models/Mentor');
    const mentorProfile = await Mentor.findOne({ user: req.user.id });
    
    if (mentorProfile && booking.mentor._id.toString() === mentorProfile._id.toString()) {
        return res.json(booking);
    }

    // If neither, forbidden
    return res.status(403).json({ message: 'Not authorized to view this booking' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Mentor's Bookings (Mentor View)
exports.getMentorBookings = async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const bookings = await MentorshipBooking.find({ mentor: mentor_id })
      .populate('user', 'full_name email')
      .populate('mentorship', 'title')
      .sort({ slot_date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
