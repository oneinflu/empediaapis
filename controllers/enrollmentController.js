const CourseEnrollment = require('../models/CourseEnrollment');
const Transaction = require('../models/Transaction');
const Course = require('../models/Course');

exports.enrollUser = async (req, res) => {
  try {
    const { user_id, course_id, payment_details } = req.body;

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({ user_id, course_id });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    let transaction_id = null;
    let purchase_status = 'Free';

    // Handle Payment if course is paid (Assuming simple check on priceType or if payment provided)
    // Note: Course model has priceType: "Free" or "Paid"
    if (course.priceType === 'Paid') {
      purchase_status = 'Paid';
      if (!payment_details) {
        return res.status(400).json({ message: 'Payment details required for paid course' });
      }
      
      // Create Transaction Record
      const transaction = new Transaction({
        user_id,
        amount: payment_details.amount, // Should match course price
        currency: payment_details.currency || 'INR',
        status: 'Success', // Assuming payment gateway success for this example
        payment_method: payment_details.method,
        related_entity: 'Course',
        related_id: course_id
      });
      
      const savedTransaction = await transaction.save();
      transaction_id = savedTransaction._id;
    }

    // Create Enrollment
    const enrollment = new CourseEnrollment({
      user_id,
      course_id,
      purchase_status,
      transaction_id
    });

    const savedEnrollment = await enrollment.save();
    res.status(201).json(savedEnrollment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress_percent } = req.body;
    const { id } = req.params;

    if (progress_percent < 0 || progress_percent > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const updates = { progress_percent };
    if (progress_percent === 100) {
      updates.completion_status = 'Completed';
      // Generate mock certificate URL if completed
      updates.certificate_url = `https://cert.example.com/${id}`; 
    }

    const enrollment = await CourseEnrollment.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const enrollments = await CourseEnrollment.find({ user_id })
      .populate('course_id')
      .populate('transaction_id');
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findById(req.params.id)
      .populate('course_id')
      .populate('transaction_id');
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({})
      .populate('course_id')
      .populate('transaction_id');
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
