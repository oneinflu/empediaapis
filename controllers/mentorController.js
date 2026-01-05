const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Internship = require('../models/Internship');

// Create a new mentor
exports.createMentor = async (req, res) => {
  try {
    const mentorData = req.body;
    
    // Automatically link to the logged-in user if available (req.user is set by authMiddleware)
    // If not authenticated (public registration), user_id must be provided in body
    if (req.user) {
        mentorData.user_id = req.user.id;
    }

    // Parse JSON fields if they are strings (Multipart/form-data issue)
    ['expertiseTags', 'subSkills', 'mentorshipTypes', 'mentorshipFormats', 'durationOptions', 'minSkills'].forEach(field => {
         if (typeof mentorData[field] === 'string' && mentorData[field].startsWith('[')) {
             try {
                 mentorData[field] = JSON.parse(mentorData[field]);
             } catch (e) {}
         }
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        mentorData.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.coverImage) {
        mentorData.coverImage = req.files.coverImage[0].path;
      }
    }

    const mentor = new Mentor(mentorData);
    const savedMentor = await mentor.save();
    res.status(201).json(savedMentor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all mentors
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
      // .populate('recommendedCourses') // Removed as it is not in schema
      // .populate('recommendedInternships') // Uncomment when Internship model exists
      // .populate('recommendedJobs'); // Uncomment when Job model exists
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single mentor by ID
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const skills = [
      ...(mentor.expertiseTags || []),
      ...(mentor.subSkills || [])
    ];

    // Find recommended Courses (matching skills)
    const recommendedCourses = await Course.find({
      skills: { $in: skills },
      status: 'Published'
    }).limit(5);

    // Find recommended Jobs (matching skills)
    const recommendedJobs = await Job.find({
      requiredSkills: { $in: skills },
      status: 'Approved'
    }).limit(5);

    // Find recommended Internships (matching skills)
    const recommendedInternships = await Internship.find({
      requiredSkills: { $in: skills },
      status: 'Approved'
    }).limit(5);

    res.status(200).json({
      ...mentor.toObject(),
      recommendedCourses,
      recommendedJobs,
      recommendedInternships
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a mentor by ID
exports.updateMentor = async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        updates.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.coverImage) {
        updates.coverImage = req.files.coverImage[0].path;
      }
    }

    const mentor = await Mentor.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a mentor by ID
exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.status(200).json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
