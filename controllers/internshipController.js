const Internship = require('../models/Internship');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Mentor = require('../models/Mentor');

// Create a new internship
exports.createInternship = async (req, res) => {
  try {
    const internshipData = req.body;
    if (req.file && req.file.fieldname === 'coverImage') {
      internshipData.coverImage = req.file.path;
    }
    const internship = new Internship(internshipData);
    const savedInternship = await internship.save();
    res.status(201).json(savedInternship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all internships
exports.getAllInternships = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const internships = await Internship.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('company');
      // .populate('recommendedCourses') // Removed as it is not in schema
      // .populate('linkedMentorships'); // Removed as it is not in schema

    const total = await Internship.countDocuments();

    res.status(200).json({
      internships,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInternships: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single internship by ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const skills = internship.requiredSkills || [];

    // Find recommended Courses (matching skills)
    const recommendedCourses = await Course.find({
      skills: { $in: skills },
      status: 'Published'
    }).limit(5);

    // Find recommended Jobs (matching skills - maybe next step after internship)
    const recommendedJobs = await Job.find({
      requiredSkills: { $in: skills },
      status: 'Approved'
    }).limit(5);

    // Find recommended Mentors (matching expertise)
    const recommendedMentors = await Mentor.find({
      $or: [
        { expertiseTags: { $in: skills } },
        { subSkills: { $in: skills } }
      ],
      isPaused: false
    }).limit(5);

    res.status(200).json({
      ...internship.toObject(),
      recommendedCourses,
      recommendedJobs,
      recommendedMentors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an internship by ID
exports.updateInternship = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file && req.file.fieldname === 'coverImage') {
      updates.coverImage = req.file.path;
    }
    const internship = await Internship.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an internship by ID
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(200).json({ message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
