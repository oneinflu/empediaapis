const Course = require('../models/Course');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Mentor = require('../models/Mentor');
const { createFolder } = require('../utils/bunny');
const mongoose = require('mongoose');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const toNum = (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };
    const toBool = (v) => {
      if (typeof v === 'boolean') return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return !!v;
    };
    
    // Parse JSON fields if they are strings (Multipart/form-data issue)
    if (typeof courseData.sections === 'string') {
        try {
            courseData.sections = JSON.parse(courseData.sections);
        } catch (e) {
            // keep as is or error
        }
    }
    // Also parse arrays if they come as single JSON string instead of individual fields (depending on frontend impl)
    // But standard FormData append array works for simple arrays. 
    // Just in case frontend sends arrays as JSON strings:
    ['skills', 'outcomes', 'opportunities', 'instructorCompanyLogos'].forEach(field => {
         if (typeof courseData[field] === 'string' && courseData[field].startsWith('[')) {
             try {
                 courseData[field] = JSON.parse(courseData[field]);
             } catch (e) {}
         }
    });

    courseData.priceAmount = toNum(courseData.priceAmount);
    courseData.accessDuration = toNum(courseData.accessDuration);
    courseData.earlyBirdPrice = toNum(courseData.earlyBirdPrice);
    courseData.maxStudents = toNum(courseData.maxStudents);
    courseData.hasStudentDiscount = toBool(courseData.hasStudentDiscount);
    courseData.hasAssignment = toBool(courseData.hasAssignment);
    courseData.hasQuiz = toBool(courseData.hasQuiz);
    courseData.hasProject = toBool(courseData.hasProject);
    courseData.hasCertificate = toBool(courseData.hasCertificate);
    courseData.isFeatured = toBool(courseData.isFeatured);
    
    if (Array.isArray(courseData.sections)) {
      courseData.sections = courseData.sections.map((s) => {
        return {
          ...s,
          lessons: Array.isArray(s.lessons) ? s.lessons.map((l) => ({
            ...l,
            duration: toNum(l.duration) || 0,
            isPreviewFree: toBool(l.isPreviewFree)
          })) : []
        };
      });
    }

    // Handle file uploads
    if (req.files) {
      const arr = Array.isArray(req.files) ? req.files : [];
      arr.forEach((f) => {
        if (f.fieldname === 'thumbnail') {
          courseData.thumbnail = f.path;
        } else if (f.fieldname === 'coverImage') {
          courseData.coverImage = f.path;
        } else if (f.fieldname.startsWith('videoFile_')) {
          const parts = f.fieldname.split('_');
          const sectionId = parts[1];
          const lessonId = parts[2];
          if (Array.isArray(courseData.sections)) {
            courseData.sections = courseData.sections.map((s) => {
              if (String(s.id || s._id) === String(sectionId)) {
                const lessons = Array.isArray(s.lessons) ? s.lessons.map((l) => {
                  if (String(l.id || l._id) === String(lessonId)) {
                    return { ...l, videoUrl: f.path };
                  }
                  return l;
                }) : [];
                return { ...s, lessons };
              }
              return s;
            });
          }
        } else if (f.fieldname.startsWith('materialFile_')) {
          const parts = f.fieldname.split('_');
          const sectionId = parts[1];
          const lessonId = parts[2];
          if (Array.isArray(courseData.sections)) {
            courseData.sections = courseData.sections.map((s) => {
              if (String(s.id || s._id) === String(sectionId)) {
                const lessons = Array.isArray(s.lessons) ? s.lessons.map((l) => {
                  if (String(l.id || l._id) === String(lessonId)) {
                    return { ...l, supportingMaterialUrl: f.path };
                  }
                  return l;
                }) : [];
                return { ...s, lessons };
              }
              return s;
            });
          }
        }
      });
    }

    const course = new Course(courseData);
    const savedCourse = await course.save();
    
    // Create Bunny folder structure: courses/{courseId}/
    try {
      await createFolder(`courses/${savedCourse._id}`);
    } catch {}
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Curriculum: add section to a course
exports.addSection = async (req, res) => {
  try {
    const { title } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const section = { title, order: course.sections.length, lessons: [] };
    course.sections.push(section);
    await course.save();
    const added = course.sections[course.sections.length - 1];
    // Create Bunny folder: courses/{courseId}/{sectionId}/
    try {
      await createFolder(`courses/${course._id}/${added._id}`);
      added.bunnyPath = `courses/${course._id}/${added._id}`;
      await course.save();
    } catch {}
    res.status(201).json(added);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Curriculum: add lesson to a section
exports.addLesson = async (req, res) => {
  try {
    const { title, videoUrl, duration, isPreviewFree } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const section = course.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    const lesson = {
      title,
      type: 'Video',
      duration: duration || 0,
      isPreviewFree: !!isPreviewFree,
      videoUrl
    };
    section.lessons.push(lesson);
    await course.save();
    const added = section.lessons[section.lessons.length - 1];
    // Set bunnyPath (file placeholder path where video should reside)
    added.bunnyPath = `courses/${course._id}/${section._id}/${added._id}.mp4`;
    await course.save();
    res.status(201).json(added);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Curriculum: get course curriculum
exports.getCurriculum = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course.sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const skills = course.skills || [];

    // Find recommended Jobs (matching requiredSkills)
    const recommendedJobs = await Job.find({
      requiredSkills: { $in: skills },
      status: 'Approved' // Optional: only approved jobs
    }).limit(5);

    // Find recommended Internships (matching requiredSkills)
    const recommendedInternships = await Internship.find({
      requiredSkills: { $in: skills },
      status: 'Approved' // Optional: only approved internships
    }).limit(5);

    // Find recommended Mentors (matching expertiseTags or subSkills)
    const recommendedMentors = await Mentor.find({
      $or: [
        { expertiseTags: { $in: skills } },
        { subSkills: { $in: skills } }
      ],
      isPaused: false
    }).limit(5);

    res.status(200).json({
      ...course.toObject(),
      recommendedJobs,
      recommendedInternships,
      recommendedMentors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a course by ID
exports.updateCourse = async (req, res) => {
  try {
    const updates = req.body;
    const toNum = (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };
    const toBool = (v) => {
      if (typeof v === 'boolean') return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return !!v;
    };
    
    if (typeof updates.sections === 'string') {
      try {
        updates.sections = JSON.parse(updates.sections);
      } catch {}
    }
    updates.priceAmount = toNum(updates.priceAmount);
    updates.accessDuration = toNum(updates.accessDuration);
    updates.earlyBirdPrice = toNum(updates.earlyBirdPrice);
    updates.maxStudents = toNum(updates.maxStudents);
    updates.hasStudentDiscount = toBool(updates.hasStudentDiscount);
    updates.hasAssignment = toBool(updates.hasAssignment);
    updates.hasQuiz = toBool(updates.hasQuiz);
    updates.hasProject = toBool(updates.hasProject);
    updates.hasCertificate = toBool(updates.hasCertificate);
    updates.isFeatured = toBool(updates.isFeatured);
    if (Array.isArray(updates.sections)) {
      updates.sections = updates.sections.map((s) => {
        return {
          ...s,
          lessons: Array.isArray(s.lessons) ? s.lessons.map((l) => ({
            ...l,
            duration: toNum(l.duration) || 0,
            isPreviewFree: toBool(l.isPreviewFree)
          })) : []
        };
      });
    }
    if (req.files) {
      const arr = Array.isArray(req.files) ? req.files : [];
      arr.forEach((f) => {
        if (f.fieldname === 'thumbnail') {
          updates.thumbnail = f.path;
        } else if (f.fieldname === 'coverImage') {
          updates.coverImage = f.path;
        } else if (f.fieldname.startsWith('videoFile_')) {
          const parts = f.fieldname.split('_');
          const sectionId = parts[1];
          const lessonId = parts[2];
          if (Array.isArray(updates.sections)) {
            updates.sections = updates.sections.map((s) => {
              if (String(s.id || s._id) === String(sectionId)) {
                const lessons = Array.isArray(s.lessons) ? s.lessons.map((l) => {
                  if (String(l.id || l._id) === String(lessonId)) {
                    return { ...l, videoUrl: f.path };
                  }
                  return l;
                }) : [];
                return { ...s, lessons };
              }
              return s;
            });
          }
        } else if (f.fieldname.startsWith('materialFile_')) {
          const parts = f.fieldname.split('_');
          const sectionId = parts[1];
          const lessonId = parts[2];
          if (Array.isArray(updates.sections)) {
            updates.sections = updates.sections.map((s) => {
              if (String(s.id || s._id) === String(sectionId)) {
                const lessons = Array.isArray(s.lessons) ? s.lessons.map((l) => {
                  if (String(l.id || l._id) === String(lessonId)) {
                    return { ...l, supportingMaterialUrl: f.path };
                  }
                  return l;
                }) : [];
                return { ...s, lessons };
              }
              return s;
            });
          }
        }
      });
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
