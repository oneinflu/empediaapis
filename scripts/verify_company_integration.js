const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const COMPANY_URL = `${API_BASE}/companies`;

async function testCompanyFlow() {
  console.log('🚀 Starting Company API Integration Test...');

  let companyId = null;
  const dummyLogoPath = path.join(__dirname, 'dummy_logo.png');

  try {
    // Check connection
    try {
        await axios.get('http://localhost:3000/');
        console.log('✅ Server is reachable');
    } catch (e) {
        throw new Error(`Server not reachable - ${e.message}`);
    }

    // Create dummy file
    fs.writeFileSync(dummyLogoPath, 'dummy logo content');

    // 1. Create Company
    console.log('\n1️⃣  Testing Create Company...');
    const createForm = new FormData();
    createForm.append('company_name', 'Test Company Inc.');
    createForm.append('industry', 'Technology');
    createForm.append('website', 'https://testcompany.com');
    createForm.append('verified', 'true');
    createForm.append('logo', fs.createReadStream(dummyLogoPath), { filename: 'dummy_logo.png', contentType: 'image/png' });

    const createRes = await axios.post(COMPANY_URL, createForm, {
      headers: createForm.getHeaders()
    });

    if (createRes.status === 201) {
      console.log('✅ Company Created Successfully:', createRes.data._id);
      companyId = createRes.data._id;
    } else {
      throw new Error(`Failed to create company. Status: ${createRes.status}`);
    }

    // 2. Fetch Company
    console.log('\n2️⃣  Testing Get Company by ID...');
    const getRes = await axios.get(`${COMPANY_URL}/${companyId}`);
    if (getRes.status === 200 && getRes.data.company_name === 'Test Company Inc.') {
      console.log('✅ Company Fetched Successfully:', getRes.data.company_name);
    } else {
      throw new Error('Failed to fetch company or name mismatch');
    }

    // 3. Update Company
    console.log('\n3️⃣  Testing Update Company...');
    const updateForm = new FormData();
    updateForm.append('company_name', 'Test Company Updated');
    updateForm.append('industry', 'Software');
    // Not updating logo this time

    const updateRes = await axios.put(`${COMPANY_URL}/${companyId}`, updateForm, {
      headers: updateForm.getHeaders()
    });

    if (updateRes.status === 200) {
      console.log('✅ Company Updated Successfully');
    } else {
      throw new Error(`Failed to update company. Status: ${updateRes.status}`);
    }

    // 4. Verify Update
    console.log('\n4️⃣  Verifying Update...');
    const verifyRes = await axios.get(`${COMPANY_URL}/${companyId}`);
    if (verifyRes.data.company_name === 'Test Company Updated' && verifyRes.data.industry === 'Software') {
        console.log('✅ Update Verified: Name and Industry updated');
    } else {
        throw new Error('Update verification failed');
    }

    // 5. Delete Company
    console.log('\n5️⃣  Cleaning up (Delete Company)...');
    const deleteRes = await axios.delete(`${COMPANY_URL}/${companyId}`);
    if (deleteRes.status === 200) {
      console.log('✅ Company Deleted Successfully');
    } else {
      throw new Error('Failed to delete company');
    }

    console.log('\n🎉 ALL COMPANY TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  } finally {
    // Cleanup
    if (fs.existsSync(dummyLogoPath)) fs.unlinkSync(dummyLogoPath);
  }
}

testCompanyFlow();
