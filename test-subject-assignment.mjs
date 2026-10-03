async function testSubjectCreationAndAssignment() {
  console.log('--- Testing Subject Creation & Faculty-to-Student Assignment ---\n');

  const BASE_URL = 'http://localhost:8080/api';

  // 1. Faculty Login
  console.log('Step 1: Faculty logging in...');
  const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'faculty@digitallab.edu', password: 'password123', role: 'FACULTY' })
  });
  const faculty = await facultyLoginRes.json();
  if (facultyLoginRes.status !== 200) throw new Error('Faculty login failed: ' + JSON.stringify(faculty));
  console.log('✓ Faculty logged in successfully. Name:', faculty.fullName);

  // 2. Faculty Creates a Subject
  console.log('\nStep 2: Faculty creating a new subject "Database Management Systems"...');
  const uniqueCode = 'DBMS_' + Math.floor(Math.random() * 900 + 100);
  const createSubjRes = await fetch(`${BASE_URL}/subjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${faculty.token}`
    },
    body: JSON.stringify({
      subjectName: 'Database Management Systems',
      courseCode: uniqueCode,
      department: 'Computer Science and Engineering',
      year: 3,
      semester: 5,
      academicYear: '2024-2025'
    })
  });
  console.log('Create Subject Status:', createSubjRes.status);
  const newSubject = await createSubjRes.json();
  if (createSubjRes.status !== 200) throw new Error('Subject creation failed: ' + JSON.stringify(newSubject));
  console.log(`✓ Subject created successfully! ID: ${newSubject.id}, Code: ${newSubject.courseCode}, Name: ${newSubject.subjectName}`);

  // 3. Faculty Fetches Available Students
  console.log('\nStep 3: Fetching all registered students...');
  const studentsRes = await fetch(`${BASE_URL}/students`, {
    headers: { Authorization: `Bearer ${faculty.token}` }
  });
  const allStudents = await studentsRes.json();
  console.log(`✓ Retrieved ${allStudents.length} registered students:`);
  allStudents.forEach(st => console.log(`  - [ID: ${st.id}] ${st.fullName} (${st.registerNumber})`));

  if (allStudents.length === 0) throw new Error('No registered students found!');

  const studentIdsToAssign = allStudents.map(s => s.id);

  // 4. Faculty Assigns Subject to Students
  console.log(`\nStep 4: Assigning ${studentIdsToAssign.length} student(s) to subject "${newSubject.subjectName}"...`);
  const assignRes = await fetch(`${BASE_URL}/subjects/${newSubject.id}/assign-students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${faculty.token}`
    },
    body: JSON.stringify({ studentIds: studentIdsToAssign })
  });
  console.log('Assign Students Status:', assignRes.status);
  const assignedList = await assignRes.json();
  if (assignRes.status !== 200) throw new Error('Assignment failed: ' + JSON.stringify(assignedList));
  console.log(`✓ Backend saved relationship in database! Enrolled count: ${assignedList.length}`);
  assignedList.forEach(st => console.log(`  ✓ Enrolled: ${st.fullName} (${st.registerNumber})`));

  // 5. Student 1 Logs In & Checks Assigned Subjects
  console.log('\nStep 5: Student 1 (student@digitallab.edu) logging in...');
  const s1LoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@digitallab.edu', password: 'password123', role: 'STUDENT' })
  });
  const s1 = await s1LoginRes.json();
  if (s1LoginRes.status !== 200) throw new Error('Student 1 login failed: ' + JSON.stringify(s1));

  const s1SubjectsRes = await fetch(`${BASE_URL}/subjects/student`, {
    headers: { Authorization: `Bearer ${s1.token}` }
  });
  const s1Subjects = await s1SubjectsRes.json();
  console.log(`✓ Student 1 enrolled subjects retrieved (${s1Subjects.length} subjects):`);
  s1Subjects.forEach(s => console.log(`  - [${s.courseCode}] ${s.subjectName}`));

  const foundInS1 = s1Subjects.some(s => s.id === newSubject.id);
  if (!foundInS1) throw new Error(`Newly assigned subject ${newSubject.courseCode} NOT found in Student 1 subjects!`);
  console.log(`✓ CONFIRMED: Student 1 sees assigned subject "${newSubject.subjectName}"!`);

  // 6. Student 2 (teststudent@example.com) Logs In & Checks Assigned Subjects
  console.log('\nStep 6: Student 2 (teststudent@example.com) logging in...');
  const s2LoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teststudent@example.com', password: 'Test@123', role: 'STUDENT' })
  });
  const s2 = await s2LoginRes.json();
  if (s2LoginRes.status === 200) {
    const s2SubjectsRes = await fetch(`${BASE_URL}/subjects/student`, {
      headers: { Authorization: `Bearer ${s2.token}` }
    });
    const s2Subjects = await s2SubjectsRes.json();
    const foundInS2 = s2Subjects.some(s => s.id === newSubject.id);
    if (!foundInS2) throw new Error(`Newly assigned subject ${newSubject.courseCode} NOT found in Student 2 subjects!`);
    console.log(`✓ CONFIRMED: Student 2 sees assigned subject "${newSubject.subjectName}"!`);
  }

  console.log('\n=============================================================');
  console.log('ALL SUBJECT CREATION & STUDENT ASSIGNMENT TESTS PASSED 100%!');
  console.log('=============================================================');
}

testSubjectCreationAndAssignment().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
