const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/jobs';
const COMPANY_URL = 'http://localhost:3000/api/companies';

async function testJobFlow() {
  console.log('🚀 Starting Job API Integration Test...');

  let jobId = null;
  let companyId = null;
  let createdCompany = false;
  const dummyCoverPath = path.join(__dirname, 'dummy_job_cover.png');

  try {
    // Check connection
    try {
        await axios.get('http://localhost:3000/');
        console.log('✅ Server is reachable');
    } catch (e) {
        throw new Error(`Server not reachable - ${e.message}`);
    }

    // Create dummy file
    fs.writeFileSync(dummyCoverPath, 'dummy job cover content');

    // 0. Get or Create Company
    console.log('\n0️⃣  Fetching Companies...');
    const compRes = await axios.get(COMPANY_URL);
    if (compRes.data && compRes.data.length > 0) {
        companyId = compRes.data[0]._id;
        console.log('✅ Using existing Company:', companyId);
    } else {
        console.log('⚠️ No companies found. Creating a test company...');
        const createCompForm = new FormData();
        createCompForm.append('company_name', 'Test Job Company');
        createCompForm.append('industry', 'Testing');
        // Minimal fields for company creation
        const compCreateRes = await axios.post(COMPANY_URL, createCompForm, {
            headers: { ...createCompForm.getHeaders() }
        });
        companyId = compCreateRes.data._id;
        createdCompany = true;
        console.log('✅ Created Test Company:', companyId);
    }

    // 1. Create Job
    console.log('\n1️⃣  Testing Create Job...');
    const createForm = new FormData();
    createForm.append('title', 'Senior Automation Engineer');
    createForm.append('company', companyId);
    createForm.append('jobType', 'Full-time');
    createForm.append('workMode', 'Remote');
    createForm.append('location', 'San Francisco');
    createForm.append('salaryMin', '100000');
    createForm.append('salaryMax', '150000');
    
    // Arrays - Appending multiple times for standard parsing
    createForm.append('experienceLevel', 'Senior');
    createForm.append('experienceLevel', 'Lead');
    
    createForm.append('requiredSkills', 'JavaScript');
    createForm.append('requiredSkills', 'Automation');
    createForm.append('requiredSkills', 'Node.js');
    
    createForm.append('niceToHaveSkills', 'Python');
    createForm.append('perks', 'Remote Work');
    createForm.append('perks', 'Health Insurance');

    createForm.append('coverImage', fs.createReadStream(dummyCoverPath), { filename: 'dummy_job_cover.png', contentType: 'image/png' });

    const createRes = await axios.post(API_URL, createForm, {
      headers: { ...createForm.getHeaders() }
    });

    if (createRes.status === 201) {
      console.log('✅ Job Created Successfully:', createRes.data._id);
      jobId = createRes.data._id;
    } else {
      throw new Error(`Failed to create job. Status: ${createRes.status}`);
    }

    // 2. Fetch Job
    console.log('\n2️⃣  Testing Get Job by ID...');
    const getRes = await axios.get(`${API_URL}/${jobId}`);
    if (getRes.status === 200 && getRes.data.title === 'Senior Automation Engineer') {
      console.log('✅ Job Fetched Successfully:', getRes.data.title);
      
      // Verify Arrays
      if (getRes.data.requiredSkills && getRes.data.requiredSkills.includes('JavaScript')) {
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
      throw new Error('Failed to fetch job or data mismatch');
    }

    // 3. Update Job
    console.log('\n3️⃣  Testing Update Job...');
    const updateForm = new FormData();
    updateForm.append('title', 'Principal Automation Engineer');
    updateForm.append('salaryMin', '120000');
    
    // Test updating array - assuming it replaces
    updateForm.append('requiredSkills', 'TypeScript'); 
    updateForm.append('requiredSkills', 'Playwright');

    const updateRes = await axios.put(`${API_URL}/${jobId}`, updateForm, {
      headers: { ...updateForm.getHeaders() }
    });

    if (updateRes.status === 200 && updateRes.data.title === 'Principal Automation Engineer') {
      console.log('✅ Job Updated Successfully');
    } else {
      throw new Error('Failed to update job');
    }

    // 4. Verify Update
    console.log('\n4️⃣  Verifying Update...');
    const verifyRes = await axios.get(`${API_URL}/${jobId}`);
    if (verifyRes.data.salaryMin === '120000') {
      console.log('✅ Update Verified: Salary Min is 120000');
    } else {
      throw new Error('Update verification failed');
    }

    // 5. Delete Job (Cleanup)
    console.log('\n5️⃣  Cleaning up (Delete Job)...');
    const deleteRes = await axios.delete(`${API_URL}/${jobId}`);
    if (deleteRes.status === 200) {
      console.log('✅ Job Deleted Successfully');
    }
    
    // Cleanup Company if created
    if (createdCompany) {
        console.log('Cleaning up Test Company...');
        await axios.delete(`${COMPANY_URL}/${companyId}`);
        console.log('✅ Test Company Deleted');
    }

    console.log('\n🎉 ALL JOB TESTS PASSED!');

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

testJobFlow();
