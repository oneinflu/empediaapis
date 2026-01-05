const Job = require('../models/Job');
const Course = require('../models/Course');
const Internship = require('../models/Internship');
const Mentor = require('../models/Mentor');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;
    if (req.file && req.file.fieldname === 'coverImage') {
      jobData.coverImage = req.file.path;
    }
    const job = new Job(jobData);
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('company');
      // .populate('recommendedCourses') // Removed as it is not in schema
      // .populate('linkedMentorships'); // Removed as it is not in schema
      // .populate('linkedInternships'); // Uncomment when Internship model exists

    const total = await Job.countDocuments();

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const skills = job.requiredSkills || [];

    // Find recommended Courses (matching skills)
    const recommendedCourses = await Course.find({
      skills: { $in: skills },
      status: 'Published' // Optional: only published courses
    }).limit(5);

    // Find recommended Internships (matching skills - similar roles)
    const recommendedInternships = await Internship.find({
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
      ...job.toObject(),
      recommendedCourses,
      recommendedInternships,
      recommendedMentors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job by ID
exports.updateJob = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file && req.file.fieldname === 'coverImage') {
      updates.coverImage = req.file.path;
    }
    const job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a job by ID
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
