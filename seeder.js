const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load env vars
dotenv.config();

// Load Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Company = require('./models/Company');
const CompanyUser = require('./models/CompanyUser');
const Mentor = require('./models/Mentor');
const Course = require('./models/Course');
const Job = require('./models/Job');
const Internship = require('./models/Internship');
const Mentorship = require('./models/Mentorship');
const MentorshipBooking = require('./models/MentorshipBooking');
const Application = require('./models/Application');
const Transaction = require('./models/Transaction');
const CourseEnrollment = require('./models/CourseEnrollment');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/empback');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // CLEAR DATA
    console.log('Clearing database...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Company.deleteMany({});
    await CompanyUser.deleteMany({});
    await Mentor.deleteMany({});
    await Course.deleteMany({});
    await Job.deleteMany({});
    await Internship.deleteMany({});
    await Mentorship.deleteMany({});
    await MentorshipBooking.deleteMany({});
    await Application.deleteMany({});
    await Transaction.deleteMany({});
    await CourseEnrollment.deleteMany({});

    console.log('Database cleared.');

    // 1. ADMINS
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);

    const admin = await Admin.create({
      username: 'admin',
      full_name: 'Super Admin',
      email: 'admin@empback.com',
      password_hash: adminPassword,
      role: 'superadmin',
      permissions: ['all'],
      status: 'active'
    });
    console.log('Admin created.');

    // 2. USERS
    const userPassword = await bcrypt.hash('password123', salt);
    
    const users = await User.create([
      {
        full_name: 'John Student',
        email: 'student@test.com',
        password_hash: userPassword,
        current_status: 'Student',
        skills: ['JavaScript', 'React', 'Node.js'],
        education_level: "Bachelor's",
        status: 'Active',
        email_verified: true
      },
      {
        full_name: 'Jane Jobseeker',
        email: 'seeker@test.com',
        password_hash: userPassword,
        current_status: 'Job seeker',
        skills: ['Python', 'Data Analysis', 'SQL'],
        education_level: "Master's",
        status: 'Active',
        email_verified: true
      },
      {
        full_name: 'Bob Professional',
        email: 'pro@test.com',
        password_hash: userPassword,
        current_status: 'Working professional',
        skills: ['Project Management', 'Agile', 'Scrum'],
        education_level: "Bachelor's",
        status: 'Active',
        email_verified: true
      }
    ]);
    console.log('Users created.');

    // 3. COMPANIES & COMPANY USERS
    const company1 = await Company.create({
      company_name: 'Tech Corp',
      industry: 'Technology',
      website: 'https://techcorp.com',
      verified: true,
      logo_url: 'https://via.placeholder.com/150'
    });

    const company2 = await Company.create({
      company_name: 'Data Solutions',
      industry: 'Data Science',
      website: 'https://datasolutions.com',
      verified: true,
      logo_url: 'https://via.placeholder.com/150'
    });

    // Create Company Users (Recruiters) - Need valid User accounts for them?
    // CompanyUser model links a user_id to a company_id. So we need to create Users for them first.
    
    const recruiterUser1 = await User.create({
      full_name: 'Recruiter One',
      email: 'recruiter1@techcorp.com',
      password_hash: userPassword,
      current_status: 'Working professional',
      status: 'Active',
      email_verified: true
    });

    const recruiterUser2 = await User.create({
      full_name: 'Recruiter Two',
      email: 'recruiter2@datasolutions.com',
      password_hash: userPassword,
      current_status: 'Working professional',
      status: 'Active',
      email_verified: true
    });

    await CompanyUser.create([
      {
        user_id: recruiterUser1._id,
        company_id: company1._id,
        role: 'recruiter'
      },
      {
        user_id: recruiterUser2._id,
        company_id: company2._id,
        role: 'recruiter'
      }
    ]);
    console.log('Companies and Recruiters created.');

    // 4. MENTORS
    const mentor1 = await Mentor.create({
      fullName: 'Alice Mentor',
      headline: 'Senior Software Engineer at Google',
      currentRole: 'Senior Software Engineer',
      company: 'Google',
      yearsOfExperience: 8,
      primaryDomain: 'Software Engineering',
      expertiseTags: ['JavaScript', 'React', 'System Design'],
      subSkills: ['Node.js', 'AWS'],
      bio: 'Helping students crack FAANG interviews.',
      pricingType: 'Paid',
      pricingAmount: 50,
      isPaused: false,
      status: 'Approved'
    });

    const mentor2 = await Mentor.create({
      fullName: 'David Data',
      headline: 'Data Scientist at Netflix',
      currentRole: 'Data Scientist',
      company: 'Netflix',
      yearsOfExperience: 6,
      primaryDomain: 'Data Science',
      expertiseTags: ['Python', 'Machine Learning', 'SQL'],
      subSkills: ['Pandas', 'TensorFlow'],
      bio: 'Expert in ML and AI.',
      pricingType: 'Paid',
      pricingAmount: 70,
      isPaused: false,
      status: 'Approved'
    });
    console.log('Mentors created.');

    // 5. COURSES
    const course1 = await Course.create({
      title: 'Complete Web Development Bootcamp',
      hook: 'Become a full-stack developer in 3 months.',
      category: 'Development',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      courseType: 'Self-paced',
      priceType: 'Paid',
      priceAmount: 4999,
      instructorName: 'John Doe',
      status: 'Published',
      visibility: 'Public',
      sections: [{ title: 'Introduction', lessons: [] }]
    });

    const course2 = await Course.create({
      title: 'Data Science Masterclass',
      hook: 'Master Python and ML.',
      category: 'Data Science',
      skills: ['Python', 'Data Analysis', 'Machine Learning'],
      courseType: 'Cohort-based',
      priceType: 'Paid',
      priceAmount: 7999,
      instructorName: 'Jane Smith',
      status: 'Published',
      visibility: 'Public',
      sections: [{ title: 'Basics', lessons: [] }]
    });
    console.log('Courses created.');

    // 6. JOBS
    const job1 = await Job.create({
      title: 'Frontend Developer',
      company: company1._id,
      jobType: 'Full-time',
      location: 'Remote',
      experienceLevel: ['Entry Level', 'Mid Level'],
      shortSummary: 'We are looking for a React developer.',
      requiredSkills: ['React', 'JavaScript', 'CSS'],
      status: 'Approved'
    });

    const job2 = await Job.create({
      title: 'Data Analyst',
      company: company2._id,
      jobType: 'Full-time',
      location: 'New York',
      experienceLevel: ['Mid Level'],
      shortSummary: 'Join our data team.',
      requiredSkills: ['Python', 'SQL', 'Tableau'],
      status: 'Approved'
    });
    console.log('Jobs created.');

    // 7. INTERNSHIPS
    const internship1 = await Internship.create({
      title: 'Software Engineering Intern',
      company: company1._id,
      jobType: 'Internship',
      location: 'Remote',
      experienceLevel: ['Fresher'],
      shortSummary: 'Learn from the best.',
      requiredSkills: ['JavaScript', 'HTML', 'CSS'],
      status: 'Approved'
    });
    console.log('Internships created.');

    // 8. MENTORSHIP PROGRAMS & SLOTS
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const mentorshipProgram = await Mentorship.create({
      mentor: mentor1._id,
      title: '1:1 Career Guidance',
      description: 'Discuss your career path.',
      price: 500,
      currency: 'INR',
      duration: 30,
      isActive: true,
      availableSlots: [
        {
          date: nextWeek,
          startTime: '10:00',
          endTime: '10:30',
          isBooked: false
        },
        {
          date: nextWeek,
          startTime: '11:00',
          endTime: '11:30',
          isBooked: false
        }
      ]
    });
    console.log('Mentorship Programs created.');

    // 9. INTERACTIONS

    // A. User 1 buys Course 1
    const transaction1 = await Transaction.create({
      user_id: users[0]._id,
      amount: course1.priceAmount,
      currency: 'INR',
      status: 'Success',
      payment_method: 'Credit Card',
      related_entity: 'Course',
      related_id: course1._id
    });

    await CourseEnrollment.create({
      user_id: users[0]._id,
      course_id: course1._id,
      purchase_status: 'Paid',
      transaction_id: transaction1._id,
      completion_status: 'In Progress'
    });
    console.log('User 1 enrolled in Course 1.');

    // B. User 2 applies to Job 1
    await Application.create({
      user: users[1]._id,
      job: job1._id,
      company: company1._id,
      resume_url: 'https://example.com/resume.pdf',
      status: 'Applied',
      timeline: [{ status: 'Applied', note: 'Initial Application' }]
    });
    console.log('User 2 applied to Job 1.');

    // C. User 3 books Mentorship Slot
    // Let's book the first slot
    const slotToBook = mentorshipProgram.availableSlots[0];
    
    const transaction2 = await Transaction.create({
      user_id: users[2]._id,
      amount: mentorshipProgram.price,
      currency: 'INR',
      status: 'Success',
      payment_method: 'UPI',
      related_entity: 'Mentorship',
      related_id: mentorshipProgram._id
    });

    await MentorshipBooking.create({
      user: users[2]._id,
      mentor: mentor1._id,
      mentorship: mentorshipProgram._id,
      slot_date: slotToBook.date,
      slot_time: slotToBook.startTime,
      status: 'Confirmed',
      transaction: transaction2._id,
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      user_notes: 'Need help with resume.'
    });

    // Update slot status
    slotToBook.isBooked = true;
    slotToBook.bookedBy = users[2]._id;
    await mentorshipProgram.save();
    
    console.log('User 3 booked Mentorship Slot.');

    console.log('Data Seeding Completed Successfully!');
    process.exit();

  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
