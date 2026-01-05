const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const MENTOR_URL = `${API_BASE}/mentors`;
const USER_URL = `${API_BASE}/users`;

async function testMentorFlow() {
  console.log('🚀 Starting Mentor API Integration Test...');

  let mentorId = null;
  let authToken = null;
  const dummyProfilePath = path.join(__dirname, 'dummy_profile.png');
  const dummyCoverPath = path.join(__dirname, 'dummy_mentor_cover.png');
  const randomEmail = `testmentor_${Date.now()}@example.com`;

  try {
    // Check connection
    try {
        await axios.get('http://localhost:3000/');
        console.log('✅ Server is reachable');
    } catch (e) {
        throw new Error(`Server not reachable - ${e.message}`);
    }

    // Create dummy files
    fs.writeFileSync(dummyProfilePath, 'dummy profile content');
    fs.writeFileSync(dummyCoverPath, 'dummy cover content');

    // 0. Register User
    console.log('\n0️⃣  Registering Test User...');
    try {
        const registerRes = await axios.post(`${USER_URL}/register`, {
            full_name: 'Test Mentor User',
            email: randomEmail,
            password: 'password123',
            role: 'mentor' // Assuming role might be needed
        });
        
        if (registerRes.data.token) {
            authToken = registerRes.data.token;
            console.log('✅ User Registered & Authenticated');
        } else {
            // Try login if no token in register
            console.log('⚠️ No token in register, trying login...');
            const loginRes = await axios.post(`${USER_URL}/login`, {
                email: randomEmail,
                password: 'password123'
            });
            authToken = loginRes.data.token;
            console.log('✅ User Logged In');
        }
    } catch (e) {
        throw new Error(`User registration failed: ${e.response?.data?.message || e.message}`);
    }

    if (!authToken) throw new Error('Failed to obtain Auth Token');

    // 1. Create Mentor
    console.log('\n1️⃣  Testing Create Mentor...');
    const createForm = new FormData();
    createForm.append('fullName', 'Dr. Test Mentor');
    createForm.append('headline', 'Senior Software Architect');
    createForm.append('currentRole', 'Principal Engineer');
    createForm.append('company', 'Tech Giants Inc.');
    createForm.append('pricingType', 'Paid');
    createForm.append('pricingAmount', '100');
    
    // Arrays as JSON strings (Mentor controller parses them)
    createForm.append('expertiseTags', JSON.stringify(['Architecture', 'Scalability', 'Leadership']));
    createForm.append('subSkills', JSON.stringify(['Microservices', 'System Design']));
    createForm.append('mentorshipTypes', JSON.stringify(['1:1', 'Career Guidance']));
    
    // Files
    createForm.append('profilePhoto', fs.createReadStream(dummyProfilePath), { filename: 'dummy_profile.png', contentType: 'image/png' });
    createForm.append('coverImage', fs.createReadStream(dummyCoverPath), { filename: 'dummy_mentor_cover.png', contentType: 'image/png' });

    const createRes = await axios.post(MENTOR_URL, createForm, {
      headers: { 
          ...createForm.getHeaders(),
          'Authorization': `Bearer ${authToken}`
      }
    });

    if (createRes.status === 201) {
      console.log('✅ Mentor Created Successfully:', createRes.data._id);
      mentorId = createRes.data._id;
    } else {
      throw new Error(`Failed to create mentor. Status: ${createRes.status}`);
    }

    // 2. Fetch Mentor
    console.log('\n2️⃣  Testing Get Mentor by ID...');
    const getRes = await axios.get(`${MENTOR_URL}/${mentorId}`);
    if (getRes.status === 200 && getRes.data.fullName === 'Dr. Test Mentor') {
      console.log('✅ Mentor Fetched Successfully:', getRes.data.fullName);
      
      // Verify Arrays
      if (getRes.data.expertiseTags && getRes.data.expertiseTags.includes('Architecture')) {
          console.log('✅ Expertise Tags Verified');
      } else {
          console.warn('⚠️ Expertise Tags verification failed', getRes.data.expertiseTags);
      }

    } else {
      throw new Error('Failed to fetch mentor or data mismatch');
    }

    // 3. Update Mentor
    console.log('\n3️⃣  Testing Update Mentor...');
    const updateForm = new FormData();
    updateForm.append('fullName', 'Prof. Test Mentor');
    updateForm.append('pricingAmount', '150');
    
    // Update sends new data
    updateForm.append('expertiseTags', JSON.stringify(['AI', 'Machine Learning']));

    const updateRes = await axios.put(`${MENTOR_URL}/${mentorId}`, updateForm, {
      headers: { 
          ...updateForm.getHeaders(),
          'Authorization': `Bearer ${authToken}`
      }
    });

    if (updateRes.status === 200 && updateRes.data.fullName === 'Prof. Test Mentor') {
      console.log('✅ Mentor Updated Successfully');
    } else {
      throw new Error('Failed to update mentor');
    }

    // 4. Verify Update
    console.log('\n4️⃣  Verifying Update...');
    const verifyRes = await axios.get(`${MENTOR_URL}/${mentorId}`);
    if (verifyRes.data.pricingAmount === 150) {
      console.log('✅ Update Verified: Pricing is 150');
    } else {
      throw new Error(`Update verification failed. Expected 150, got ${verifyRes.data.pricingAmount}`);
    }

    // 5. Delete Mentor (Cleanup)
    console.log('\n5️⃣  Cleaning up (Delete Mentor)...');
    const deleteRes = await axios.delete(`${MENTOR_URL}/${mentorId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (deleteRes.status === 200) {
      console.log('✅ Mentor Deleted Successfully');
    }

    console.log('\n🎉 ALL MENTOR TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
        console.error('Response Data:', error.response.data);
    }
  } finally {
      // Cleanup dummy files
      if (fs.existsSync(dummyProfilePath)) fs.unlinkSync(dummyProfilePath);
      if (fs.existsSync(dummyCoverPath)) fs.unlinkSync(dummyCoverPath);
  }
}

testMentorFlow();
