const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const CourseEnrollment = require('../models/CourseEnrollment');
const MentorshipBooking = require('../models/MentorshipBooking');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Company = require('../models/Company');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const [
      activeJobs,
      activeInternships,
      totalApplications,
      courseEnrollments,
      mentorBookings,
      pendingPayouts, // Assuming this comes from Transactions or similar
      totalUsers,
      totalMentors,
      totalCompanies
    ] = await Promise.all([
      Job.countDocuments({ status: 'Approved' }),
      Internship.countDocuments({ status: 'Approved' }),
      Application.countDocuments(), // Maybe filter by recent?
      CourseEnrollment.countDocuments(),
      MentorshipBooking.countDocuments(), // Assuming this model exists
      Transaction.countDocuments({ status: 'pending', type: 'payout' }), // Hypothetical
      User.countDocuments({ role: { $ne: 'admin' } }),
      Mentor.countDocuments({ status: 'Approved' }),
      Company.countDocuments()
    ]);

    // Calculate trends (mock logic for now as we don't have historical data snapshots easily accessible without complex aggregation)
    // In a real app, you'd query created_at within the last 30 days vs previous 30 days.

    res.status(200).json({
      success: true,
      data: {
        activeJobs,
        activeInternships,
        totalApplications,
        courseEnrollments,
        mentorBookings,
        pendingPayouts,
        totalUsers,
        totalMentors,
        totalCompanies
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};
