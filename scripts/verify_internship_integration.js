const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/internships';
const COMPANY_URL = 'http://localhost:3000/api/companies';

async function testInternshipFlow() {
  console.log('🚀 Starting Internship API Integration Test...');

  let internshipId = null;
  let companyId = null;
  let createdCompany = false;
  const dummyCoverPath = path.join(__dirname, 'dummy_internship_cover.png');

  try {
    // Check connection
    try {
        await axios.get('http://localhost:3000/');
        console.log('✅ Server is reachable');
    } catch (e) {
        throw new Error(`Server not reachable - ${e.message}`);
    }

    // Create dummy file
    fs.writeFileSync(dummyCoverPath, 'dummy internship cover content');

    // 0. Get or Create Company
    console.log('\n0️⃣  Fetching Companies...');
    const compRes = await axios.get(COMPANY_URL);
    if (compRes.data && compRes.data.length > 0) {
        companyId = compRes.data[0]._id;
        console.log('✅ Using existing Company:', companyId);
    } else {
        console.log('⚠️ No companies found. Creating a test company...');
        const createCompForm = new FormData();
        createCompForm.append('company_name', 'Test Internship Company');
        createCompForm.append('industry', 'Education');
        // Minimal fields for company creation
        const compCreateRes = await axios.post(COMPANY_URL, createCompForm, {
            headers: { ...createCompForm.getHeaders() }
        });
        companyId = compCreateRes.data._id;
        createdCompany = true;
        console.log('✅ Created Test Company:', companyId);
    }

    // 1. Create Internship
    console.log('\n1️⃣  Testing Create Internship...');
    const createForm = new FormData();
    createForm.append('title', 'Software Engineering Intern');
    createForm.append('company', companyId);
    createForm.append('jobType', 'Internship');
    createForm.append('workMode', 'Hybrid');
    createForm.append('location', 'New York');
    createForm.append('salaryMin', '20');
    createForm.append('salaryMax', '30');
    
    // Arrays
    createForm.append('experienceLevel', 'Student');
    createForm.append('requiredSkills', 'Java');
    createForm.append('requiredSkills', 'Spring Boot');
    createForm.append('niceToHaveSkills', 'React');
    createForm.append('perks', 'Free Lunch');
    createForm.append('perks', 'Mentorship');

    createForm.append('coverImage', fs.createReadStream(dummyCoverPath), { filename: 'dummy_internship_cover.png', contentType: 'image/png' });

    const createRes = await axios.post(API_URL, createForm, {
      headers: { ...createForm.getHeaders() }
    });

    if (createRes.status === 201) {
      console.log('✅ Internship Created Successfully:', createRes.data._id);
      internshipId = createRes.data._id;
    } else {
      throw new Error(`Failed to create internship. Status: ${createRes.status}`);
    }

    // 2. Fetch Internship
    console.log('\n2️⃣  Testing Get Internship by ID...');
    const getRes = await axios.get(`${API_URL}/${internshipId}`);
    if (getRes.status === 200 && getRes.data.title === 'Software Engineering Intern') {
      console.log('✅ Internship Fetched Successfully:', getRes.data.title);
      
      // Verify Arrays
      if (getRes.data.requiredSkills && getRes.data.requiredSkills.includes('Java')) {
          console.log('✅ Required Skills Verified');
      } else {
          console.warn('⚠️ Required Skills verification failed', getRes.data.requiredSkills);
      }
      
      if (getRes.data.company && (getRes.data.company._id === companyId || getRes.data.company === companyId)) {
          console.log('✅ Company Link Verified');
      } else {
           console.warn('⚠️ Company Link verification failed');
      }

    } else {
      throw new Error('Failed to fetch internship or data mismatch');
    }

    // 3. Update Internship
    console.log('\n3️⃣  Testing Update Internship...');
    const updateForm = new FormData();
    updateForm.append('title', 'Backend Engineering Intern');
    updateForm.append('salaryMin', '25');
    
    updateForm.append('requiredSkills', 'Java');
    updateForm.append('requiredSkills', 'AWS');

    const updateRes = await axios.put(`${API_URL}/${internshipId}`, updateForm, {
      headers: { ...updateForm.getHeaders() }
    });

    if (updateRes.status === 200 && updateRes.data.title === 'Backend Engineering Intern') {
      console.log('✅ Internship Updated Successfully');
    } else {
      throw new Error('Failed to update internship');
    }

    // 4. Verify Update
    console.log('\n4️⃣  Verifying Update...');
    const verifyRes = await axios.get(`${API_URL}/${internshipId}`);
    if (verifyRes.data.salaryMin === '25') {
      console.log('✅ Update Verified: Salary Min is 25');
    } else {
      throw new Error('Update verification failed');
    }

    // 5. Delete Internship (Cleanup)
    console.log('\n5️⃣  Cleaning up (Delete Internship)...');
    const deleteRes = await axios.delete(`${API_URL}/${internshipId}`);
    if (deleteRes.status === 200) {
      console.log('✅ Internship Deleted Successfully');
    }
    
    // Cleanup Company if created
    if (createdCompany) {
        console.log('Cleaning up Test Company...');
        await axios.delete(`${COMPANY_URL}/${companyId}`);
        console.log('✅ Test Company Deleted');
    }

    console.log('\n🎉 ALL INTERNSHIP TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
        console.error('Response Data:', error.response.data);
    }
  } finally {
      // Cleanup dummy file
      if (fs.existsSync(dummyCoverPath)) fs.unlinkSync(dummyCoverPath);
  }
}

testInternshipFlow();
