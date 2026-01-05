const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptsDir = __dirname;
const scripts = [
    'verify_company_integration.js',
    'verify_course_integration.js',
    'verify_internship_integration.js',
    'verify_job_integration.js',
    'verify_mentor_integration.js',
    'verify_job_full_flow.js',
    'verify_mentorship_full_flow.js'
];

console.log('🚀 STARTING ALL INTEGRATION TESTS...\n');

let passed = 0;
let failed = 0;
const results = [];

scripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    console.log(`\n---------------------------------------------------------`);
    console.log(`🏃 Running: ${script}`);
    console.log(`---------------------------------------------------------`);
    
    try {
        // Run synchronously and pipe output to parent process
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
        console.log(`\n✅ ${script} PASSED`);
        passed++;
        results.push({ name: script, status: '✅ PASSED' });
    } catch (error) {
        console.error(`\n❌ ${script} FAILED`);
        failed++;
        results.push({ name: script, status: '❌ FAILED' });
        // We continue to the next test even if one fails
    }
});

console.log('\n=========================================================');
console.log('📊 TEST SUMMARY');
console.log('=========================================================');
results.forEach(r => console.log(`${r.status} - ${r.name}`));
console.log('\n');
console.log(`Total: ${scripts.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
    console.log('\n❌ SOME TESTS FAILED');
    process.exit(1);
} else {
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY');
    process.exit(0);
}
