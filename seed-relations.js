const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const Internship = require('./models/Internship');
const Course = require('./models/Course');
const Mentor = require('./models/Mentor');
const Company = require('./models/Company');
const User = require('./models/User');
const Mentorship = require('./models/Mentorship');

dotenv.config();

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
        // Fallback or error if not found. Attempt to guess or use local.
        console.log("No MONGO_URI found, using default local");
        process.env.MONGO_URI = "mongodb://localhost:27017/empback";
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const timestamp = Date.now();

    // 1. Create a Company
    const company = await Company.create({
      company_name: `Tech Relations Inc ${timestamp}`,
      industry: "Technology",
      logo_url: "https://via.placeholder.com/150",
      verified: true
    });
    console.log("Created Company:", company.company_name);

    // 2. Create a Course with 'React' and 'Node.js' skills
    const course = await Course.create({
      title: `Full Stack React Mastery ${timestamp}`,
      hook: "Become a full stack developer",
      description: "Learn React, Node.js, and MongoDB in depth.",
      category: "Development",
      skills: ["React", "Node.js", "JavaScript"],
      courseType: "Self-paced",
      priceAmount: 4999,
      instructorName: "Sarah Tech",
      status: "Published",
      level: "Intermediate",
      sections: [] 
    });
    console.log("Created Course:", course.title);

    // 3. Create a Job requiring 'React' (should match Course)
    const job = await Job.create({
      title: `Senior React Developer ${timestamp}`,
      company: company._id,
      jobType: "Full-time",
      workMode: "Remote",
      location: "Remote",
      requiredSkills: ["React", "TypeScript"], // 'React' matches course
      status: "Approved",
      salaryMin: 150000,
      salaryMax: 200000,
      shortSummary: "We are looking for a React expert.",
      description: "Detailed description here...",
      roleRationale: "Critical role",
      roleImpact: "High impact"
    });
    console.log("Created Job:", job.title);

    // 4. Create an Internship requiring 'Node.js' (should match Course)
    const internship = await Internship.create({
      title: `Backend Node.js Intern ${timestamp}`,
      company: company._id,
      internshipType: "Full-time",
      workMode: "Hybrid",
      location: "New York",
      requiredSkills: ["Node.js", "Express"], // 'Node.js' matches course
      status: "Approved",
      stipendMin: 25000,
      stipendMax: 35000,
      duration: "6 months",
      shortSummary: "Learn backend dev.",
      description: "Internship description..."
    });
    console.log("Created Internship:", internship.title);
    
    // 5. Create User for Mentor
    const user = await User.create({
        full_name: `React Guru ${timestamp}`,
        email: `mentor${timestamp}@example.com`,
        password_hash: "hashedpassword123",
        role: "mentor"
    });
    console.log("Created User for Mentor:", user.full_name);

    // 6. Create a Mentor with 'React' expertise (should match Job and Course)
    const mentor = await Mentor.create({
      user_id: user._id,
      fullName: user.full_name,
      email: user.email,
      password: "password123", // Legacy field if present
      expertiseTags: ["React", "Frontend Architecture"],
      headline: "Staff Engineer @ BigTech",
      bio: "10 years of React experience.",
      hourlyRate: 5000,
      isPaused: false
    });
    console.log("Created Mentor:", mentor.fullName);

    // 6. Create a Mentorship Program
    const mentorship = await Mentorship.create({
        mentor: mentor._id,
        title: `React Career Guidance ${timestamp}`,
        description: "I will guide you to your first React job.",
        price: 10000,
        duration: 60, // in minutes
        status: "active", // Verify status enum in model if possible, usually 'active'
        // skills: ["React"] // Removed as not in schema shown
    });
    console.log("Created Mentorship Program:", mentorship.title);

    console.log('\n--- SEED COMPLETE ---');
    console.log('Relationships established via "React" and "Node.js" tags.');
    console.log('Refresh the home page and check the new items.');
    console.log(`Job ID for details: ${job._id}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seed();
