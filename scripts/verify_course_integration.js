const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/courses';

async function testCourseFlow() {
  console.log('🚀 Starting Course API Integration Test...');

  let courseId = null;
  const dummyThumbPath = path.join(__dirname, 'dummy_thumb.png');
  const dummyCoverPath = path.join(__dirname, 'dummy_cover.png');

  try {
    // Check connection first
    try {
        await axios.get('http://localhost:3000/');
        console.log('✅ Server is reachable');
    } catch (e) {
        throw new Error(`Server not reachable at http://localhost:3000/ - ${e.message}`);
    }

    // Create dummy files
    fs.writeFileSync(dummyThumbPath, 'dummy image content');
    fs.writeFileSync(dummyCoverPath, 'dummy image content');

    // 1. Create Course
    console.log('\n1️⃣  Testing Create Course...');
    const createForm = new FormData();
    createForm.append('title', 'Automated Test Course');
    createForm.append('level', 'Beginner');
    createForm.append('hook', 'Learn Automation');
    createForm.append('category', 'Technology');
    createForm.append('courseType', 'Self-Paced');
    createForm.append('instructorName', 'Test Instructor');
    createForm.append('priceType', 'Free');
    
    // Arrays as JSON strings
    createForm.append('skills', JSON.stringify(['Automation', 'Testing', 'Node.js']));
    createForm.append('outcomes', JSON.stringify(['Master API Testing']));
    createForm.append('opportunities', JSON.stringify(['QA Engineer']));
    
    // Complex Sections/Lessons structure
    const sections = [
        {
            id: 'sec_1',
            title: 'Introduction',
            order: 1,
            lessons: [
                {
                    id: 'les_1',
                    title: 'Welcome',
                    type: 'Video',
                    duration: 5,
                    isPreviewFree: true
                }
            ]
        }
    ];
    createForm.append('sections', JSON.stringify(sections));

    // Files
    createForm.append('thumbnail', fs.createReadStream(dummyThumbPath), { filename: 'dummy_thumb.png', contentType: 'image/png' });
    createForm.append('coverImage', fs.createReadStream(dummyCoverPath), { filename: 'dummy_cover.png', contentType: 'image/png' });

    const createRes = await axios.post(API_URL, createForm, {
      headers: { ...createForm.getHeaders() }
    });

    if (createRes.status === 201) {
      console.log('✅ Course Created Successfully:', createRes.data._id);
      courseId = createRes.data._id;
    } else {
      throw new Error(`Failed to create course. Status: ${createRes.status}`);
    }

    // 2. Fetch Course
    console.log('\n2️⃣  Testing Get Course by ID...');
    const getRes = await axios.get(`${API_URL}/${courseId}`);
    if (getRes.status === 200 && getRes.data.title === 'Automated Test Course') {
      console.log('✅ Course Fetched Successfully:', getRes.data.title);
      
      // Verify Sections
      if (getRes.data.sections && getRes.data.sections.length > 0 && getRes.data.sections[0].title === 'Introduction') {
          console.log('✅ Sections Verified');
      } else {
          console.warn('⚠️ Sections verification failed or empty');
      }

      // Verify Skills
      if (getRes.data.skills && getRes.data.skills.includes('Automation')) {
          console.log('✅ Skills Verified');
      } else {
          console.warn('⚠️ Skills verification failed');
      }

    } else {
      throw new Error('Failed to fetch course or data mismatch');
    }

    // 3. Update Course with Video
    console.log('\n3️⃣  Testing Update Course (Upload Video)...');
    const dummyVideoPath = path.join(__dirname, 'dummy_video.mp4');
    fs.writeFileSync(dummyVideoPath, 'dummy video content');

    const updateForm = new FormData();
    // Re-send sections to ensure mapping works. The backend maps based on ID match.
    const courseData = getRes.data;
    const sectionId = courseData.sections[0]._id;
    const lessonId = courseData.sections[0].lessons[0]._id;

    updateForm.append('sections', JSON.stringify(courseData.sections));
    updateForm.append('title', 'Automated Test Course Updated');
    
    // Append video file
    // key format: videoFile_{sectionId}_{lessonId}
    updateForm.append(`videoFile_${sectionId}_${lessonId}`, fs.createReadStream(dummyVideoPath), { filename: 'lesson_video.mp4', contentType: 'video/mp4' });

    const updateRes = await axios.put(`${API_URL}/${courseId}`, updateForm, {
      headers: { ...updateForm.getHeaders() }
    });

    if (updateRes.status === 200) {
        console.log('✅ Course Updated Successfully');
        // Verify videoUrl
        const updatedSection = updateRes.data.sections.find(s => s._id === sectionId);
        const updatedLesson = updatedSection.lessons.find(l => l._id === lessonId);
        if (updatedLesson.videoUrl) {
            console.log('✅ Video URL Verified:', updatedLesson.videoUrl);
        } else {
            throw new Error('Video URL not updated');
        }
    } else {
        throw new Error(`Failed to update course. Status: ${updateRes.status}`);
    }

    // 4. Delete Course
    console.log('\n4️⃣  Cleaning up (Delete Course)...');
    const deleteRes = await axios.delete(`${API_URL}/${courseId}`);
    if (deleteRes.status === 200) {
      console.log('✅ Course Deleted Successfully');
    } else {
      throw new Error('Failed to delete course');
    }

    console.log('\n🎉 ALL COURSE TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  } finally {
    // Cleanup
    if (fs.existsSync(dummyThumbPath)) fs.unlinkSync(dummyThumbPath);
    if (fs.existsSync(dummyCoverPath)) fs.unlinkSync(dummyCoverPath);
    if (fs.existsSync(path.join(__dirname, 'dummy_video.mp4'))) fs.unlinkSync(path.join(__dirname, 'dummy_video.mp4'));
  }
}

testCourseFlow();
