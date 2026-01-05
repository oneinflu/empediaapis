const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';

const applicantData = {
    full_name: 'Mentorship Seeker',
    email: `mentee_${Date.now()}@example.com`,
    password: 'password123',
    role: 'Student'
};

const mentorUserData = {
    full_name: 'Dr. Expert Mentor',
    email: `mentor_user_${Date.now()}@example.com`,
    password: 'password123',
    role: 'Mentor'
};

const programData = {
    title: 'Career Guidance Session',
    description: 'One-on-one session to discuss career path.',
    price: 50,
    duration: 60,
    currency: 'USD'
};

let applicantToken = '';
let mentorToken = '';
let mentorId = ''; // The ID from the Mentor profile, not user ID
let programId = '';
let slotId = '';

async function runMentorshipFlow() {
    console.log('\n🚀 Starting Full Mentorship Flow Test...\n');

    try {
        // 1. Register Applicant
        console.log('1️⃣  Registering Applicant...');
        const appRes = await axios.post(`${API_URL}/users/register`, applicantData);
        applicantToken = appRes.data.token;
        console.log('✅ Applicant Registered');

        // 2. Register Mentor User
        console.log('\n2️⃣  Registering Mentor User...');
        const menRes = await axios.post(`${API_URL}/users/register`, mentorUserData);
        mentorToken = menRes.data.token;
        console.log('✅ Mentor User Registered');

        // 3. Create Mentor Profile
        console.log('\n3️⃣  Creating Mentor Profile...');
        const mentorProfileData = {
            fullName: mentorUserData.full_name,
            headline: 'Senior Career Coach',
            expertiseTags: ['Career', 'Resume', 'Interview'],
            hourlyRate: 100
        };
        const profileRes = await axios.post(`${API_URL}/mentors`, mentorProfileData, {
            headers: { Authorization: `Bearer ${mentorToken}` }
        });
        mentorId = profileRes.data._id;
        console.log(`✅ Mentor Profile Created: ${mentorId}`);

        // 4. Create Mentorship Program
        console.log('\n4️⃣  Creating Mentorship Program...');
        // We need to send form-data or JSON. Controller handles both? 
        // Looking at controller: req.body for fields.
        const progRes = await axios.post(`${API_URL}/mentorships/create`, {
            mentor_id: mentorId,
            ...programData
        }, {
            headers: { Authorization: `Bearer ${mentorToken}` } // Should be protected
        });
        programId = progRes.data._id;
        console.log(`✅ Mentorship Program Created: ${programId}`);

        // 5. Add Slots to Program
        console.log('\n5️⃣  Adding Slots to Program...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const slots = [
            { date: dateStr, startTime: '10:00', endTime: '11:00' },
            { date: dateStr, startTime: '14:00', endTime: '15:00' }
        ];

        const slotsRes = await axios.post(`${API_URL}/mentorships/${programId}/slots`, { slots }, {
            headers: { Authorization: `Bearer ${mentorToken}` }
        });
        // Get the first slot ID
        const updatedProgram = slotsRes.data;
        slotId = updatedProgram.availableSlots[0]._id;
        console.log(`✅ Slots Added. Using Slot ID: ${slotId}`);

        // 6. Applicant Books a Slot
        console.log('\n6️⃣  Applicant Booking Slot...');
        const bookingRes = await axios.post(`${API_URL}/mentorships/book`, {
            mentorship_id: programId,
            slot_id: slotId,
            user_notes: "I need help with my resume."
        }, {
            headers: { Authorization: `Bearer ${applicantToken}` }
        });
        console.log(`✅ Booking Confirmed. Status: ${bookingRes.data.booking.status}`);

        // 7. Verify Booking in My Bookings
        console.log('\n7️⃣  Verifying Booking...');
        const myBookingsRes = await axios.get(`${API_URL}/mentorships/user/my-bookings`, {
            headers: { Authorization: `Bearer ${applicantToken}` }
        });
        const foundBooking = myBookingsRes.data.find(b => b._id === bookingRes.data.booking._id);
        
        if (foundBooking) {
            console.log(`✅ Found Booking in My List. Status: ${foundBooking.status}`);
        } else {
            console.error('❌ Booking not found in user list!');
            process.exit(1);
        }

        // 8. Verify Slot is marked as booked
        const finalProgramRes = await axios.get(`${API_URL}/mentorships/${programId}`);
        const bookedSlot = finalProgramRes.data.availableSlots.find(s => s._id === slotId);
        if (bookedSlot.isBooked) {
            console.log('✅ Slot correctly marked as booked in Program');
        } else {
            console.error('❌ Slot NOT marked as booked!');
            process.exit(1);
        }

        // Cleanup (Optional)
        console.log('\n🧹 Cleaning up...');
        // Delete program, mentor, users... skipped for now to keep history.

        console.log('\n🎉 ALL MENTORSHIP FLOW TESTS PASSED!');
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Check if server is running
axios.get(API_URL.replace('/api', ''))
    .then(() => runMentorshipFlow())
    .catch(() => {
        console.error('❌ Server is not running! Please start the server first.');
        process.exit(1);
    });
