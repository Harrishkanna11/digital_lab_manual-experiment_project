async function runTest() {
  console.log('--- Starting Authentication & Database Persistence Verification ---\n');

  const BASE_URL = 'http://localhost:8080/api';

  // 1. Register Student
  console.log('Step 1: Registering Student (TestStudent@example.com with mixed casing)...');
  const regStudentRes = await fetch(`${BASE_URL}/auth/register/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Student',
      registerNumber: 'REG_TEST_101',
      email: 'TestStudent@example.com', // Test mixed casing
      password: 'Test@123',
      department: 'CSE',
      year: 2,
      section: 'A'
    })
  });
  console.log('Student Register Status:', regStudentRes.status);
  const regStudentData = await regStudentRes.json();
  if (regStudentRes.status !== 200) {
    throw new Error('Student registration failed: ' + JSON.stringify(regStudentData));
  }
  console.log('✓ Student registered successfully:', regStudentData.email, 'Role:', regStudentData.role);

  // 2. Login Student with exact lowercase email & password
  console.log('\nStep 2: Logging in Student with lowercase email & password...');
  const loginStudent1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@example.com',
      password: 'Test@123',
      role: 'STUDENT'
    })
  });
  console.log('Student Login Status:', loginStudent1.status);
  const loginStudentData1 = await loginStudent1.json();
  if (loginStudent1.status !== 200) throw new Error('Student login failed: ' + JSON.stringify(loginStudentData1));
  console.log('✓ Student login 1 successful. Token received.');

  // 3. Login Student with uppercase email
  console.log('\nStep 3: Logging in Student with uppercase email...');
  const loginStudent2 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'TESTSTUDENT@EXAMPLE.COM',
      password: 'Test@123',
      role: 'STUDENT'
    })
  });
  console.log('Student Login (uppercase) Status:', loginStudent2.status);
  if (loginStudent2.status !== 200) throw new Error('Student login with uppercase failed');
  console.log('✓ Case-insensitive email login verified!');

  // 4. Test Role Separation: Try logging in Student via Faculty portal
  console.log('\nStep 4: Testing Student login attempt via Faculty portal...');
  const crossLogin1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@example.com',
      password: 'Test@123',
      role: 'FACULTY'
    })
  });
  console.log('Cross-role Login Status (expected 401):', crossLogin1.status);
  const crossLoginData1 = await crossLogin1.json();
  console.log('Cross-role Error message:', crossLoginData1.message);
  if (crossLogin1.status !== 401) throw new Error('Student was able to log in as Faculty!');
  console.log('✓ Student blocked from Faculty portal successfully!');

  // 5. Register Faculty
  console.log('\nStep 5: Registering Faculty (TestFaculty@example.com)...');
  const regFacultyRes = await fetch(`${BASE_URL}/auth/register/faculty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Professor',
      facultyId: 'FAC_TEST_999',
      email: 'TestFaculty@example.com',
      password: 'Test@123',
      department: 'CSE',
      designation: 'Assistant Professor'
    })
  });
  console.log('Faculty Register Status:', regFacultyRes.status);
  const regFacultyData = await regFacultyRes.json();
  if (regFacultyRes.status !== 200) {
    throw new Error('Faculty registration failed: ' + JSON.stringify(regFacultyData));
  }
  console.log('✓ Faculty registered successfully:', regFacultyData.email, 'Role:', regFacultyData.role);

  // 6. Login Faculty
  console.log('\nStep 6: Logging in Faculty with email & password...');
  const loginFaculty1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testfaculty@example.com',
      password: 'Test@123',
      role: 'FACULTY'
    })
  });
  console.log('Faculty Login Status:', loginFaculty1.status);
  const loginFacultyData1 = await loginFaculty1.json();
  if (loginFaculty1.status !== 200) throw new Error('Faculty login failed: ' + JSON.stringify(loginFacultyData1));
  console.log('✓ Faculty login successful. Token received.');

  // 7. Test Role Separation: Try logging in Faculty via Student portal
  console.log('\nStep 7: Testing Faculty login attempt via Student portal...');
  const crossLogin2 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testfaculty@example.com',
      password: 'Test@123',
      role: 'STUDENT'
    })
  });
  console.log('Cross-role Login Status (expected 401):', crossLogin2.status);
  const crossLoginData2 = await crossLogin2.json();
  console.log('Cross-role Error message:', crossLoginData2.message);
  if (crossLogin2.status !== 401) throw new Error('Faculty was able to log in as Student!');
  console.log('✓ Faculty blocked from Student portal successfully!');

  // 8. Test Wrong Password
  console.log('\nStep 8: Testing Invalid Password...');
  const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@example.com',
      password: 'WrongPassword!',
      role: 'STUDENT'
    })
  });
  console.log('Wrong Password Status (expected 401):', wrongPassRes.status);
  const wrongPassData = await wrongPassRes.json();
  console.log('Error message:', wrongPassData.message);
  if (wrongPassRes.status !== 401) throw new Error('Wrong password was accepted!');
  console.log('✓ Wrong password rejected successfully!');

  console.log('\n--- Phase 1: All pre-restart tests PASSED! ---');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
