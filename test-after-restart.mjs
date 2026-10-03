async function testPostRestart() {
  console.log('--- Verifying Database Persistence AFTER Backend Restart ---\n');

  const BASE_URL = 'http://localhost:8080/api';

  // 1. Login Student (registered in previous run)
  console.log('Step 1: Logging in Student teststudent@example.com after backend restart...');
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@example.com',
      password: 'Test@123',
      role: 'STUDENT'
    })
  });
  console.log('Student Login Status:', studentLoginRes.status);
  const studentData = await studentLoginRes.json();
  if (studentLoginRes.status !== 200) {
    throw new Error('Student login failed after restart: ' + JSON.stringify(studentData));
  }
  console.log('✓ Student logged in successfully after restart!');
  console.log('  Email:', studentData.email, 'Role:', studentData.role, 'User ID:', studentData.userId);

  // 2. Fetch Student Profile with received token
  console.log('\nStep 2: Fetching Student Profile with JWT token...');
  const profileRes = await fetch(`${BASE_URL}/students/me`, {
    headers: { Authorization: `Bearer ${studentData.token}` }
  });
  console.log('Profile Status:', profileRes.status);
  const profileData = await profileRes.json();
  if (profileRes.status !== 200) throw new Error('Failed to fetch profile: ' + JSON.stringify(profileData));
  console.log('✓ Student Profile retrieved: Reg No:', profileData.registerNumber, 'Name:', profileData.fullName);

  // 3. Login Faculty (registered in previous run)
  console.log('\nStep 3: Logging in Faculty testfaculty@example.com after backend restart...');
  const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testfaculty@example.com',
      password: 'Test@123',
      role: 'FACULTY'
    })
  });
  console.log('Faculty Login Status:', facultyLoginRes.status);
  const facultyData = await facultyLoginRes.json();
  if (facultyLoginRes.status !== 200) {
    throw new Error('Faculty login failed after restart: ' + JSON.stringify(facultyData));
  }
  console.log('✓ Faculty logged in successfully after restart!');
  console.log('  Email:', facultyData.email, 'Role:', facultyData.role, 'User ID:', facultyData.userId);

  // 4. Verify seed accounts still exist as well
  console.log('\nStep 4: Checking default seed accounts...');
  const seedLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'faculty@digitallab.edu',
      password: 'password123',
      role: 'FACULTY'
    })
  });
  console.log('Seed Account Status:', seedLogin.status);
  if (seedLogin.status !== 200) throw new Error('Seed account broken');
  console.log('✓ Default seed accounts also intact and working!');

  console.log('\n==========================================================');
  console.log('ALL PERSISTENCE AND AUTHENTICATION TESTS PASSED 100%!');
  console.log('==========================================================');
}

testPostRestart().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
