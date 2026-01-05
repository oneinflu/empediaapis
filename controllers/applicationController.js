const Application = require('../models/Application');
const Job = require('../models/Job');
const Internship = require('../models/Internship');

// Apply for a Job or Internship
exports.apply = async (req, res) => {
  try {
    const { job_id, internship_id, cover_letter } = req.body;
    const user_id = req.user.id;

    if (!job_id && !internship_id) {
      return res.status(400).json({ message: 'Must specify job_id or internship_id' });
    }

    let company_id;
    let applicationData = {
      user: user_id,
      cover_letter,
      resume_url: req.user.resume_url // Use profile resume if not uploading new one
    };

    // If uploading a specific resume for this application
    if (req.file) {
      applicationData.resume_url = req.file.path;
    }

    if (!applicationData.resume_url) {
        return res.status(400).json({ message: 'Resume is required. Please upload one or update your profile.' });
    }

    if (job_id) {
      const job = await Job.findById(job_id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      company_id = job.company;
      applicationData.job = job_id;
      applicationData.company = company_id;
    } else {
      const internship = await Internship.findById(internship_id);
      if (!internship) return res.status(404).json({ message: 'Internship not found' });
      company_id = internship.company;
      applicationData.internship = internship_id;
      applicationData.company = company_id;
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      user: user_id,
      $or: [{ job: job_id }, { internship: internship_id }]
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this position' });
    }

    const application = await Application.create(applicationData);
    
    // Add initial timeline entry
    application.timeline.push({
        status: 'Applied',
        note: 'Application submitted'
    });
    await application.save();

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('user', 'full_name email phone resume_url')
      .populate('job', 'title')
      .populate('internship', 'title')
      .populate('company', 'company_name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get User's Applications
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title location')
      .populate('internship', 'title location')
      .populate('company', 'company_name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Company's Applications (For Recruiters/Admins)
exports.getCompanyApplications = async (req, res) => {
  try {
    const { company_id } = req.params;
    // Ensure the user is authorized to view this company's applications (skipped for now, assuming middleware handles it or public for dev)
    
    const applications = await Application.find({ company: company_id })
      .populate('user', 'full_name email phone resume_url')
      .populate('job', 'title')
      .populate('internship', 'title')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require('../models/User');

// Get Single Application
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'full_name email phone resume_url')
      .populate('job', 'title')
      .populate('internship', 'title')
      .populate('company', 'company_name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Application Status (For Recruiters)
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.timeline.push({
      status,
      note,
      updated_by: req.user.id,
      timestamp: Date.now()
    });

    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Certificate (For Companies upon completion)
exports.uploadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }

    const application = await Application.findById(id)
      .populate('internship')
      .populate('company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update Application
    application.certificate_url = req.file.path;
    application.status = 'Completed';
    application.timeline.push({
      status: 'Completed',
      note: 'Internship completed and certificate uploaded',
      updated_by: req.user.id,
      timestamp: Date.now()
    });
    await application.save();

    // Update User Profile with Certification
    const user = await User.findById(application.user);
    if (user) {
      const certification = {
        name: application.internship ? application.internship.title : 'Internship Program',
        issuingOrganization: application.company.company_name,
        issueDate: Date.now(),
        credentialUrl: req.file.path,
        credentialId: application._id.toString() // Use application ID as credential ID
      };
      
      user.certifications.push(certification);
      await user.save();
    }

    res.json({ message: 'Certificate uploaded and user profile updated', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
