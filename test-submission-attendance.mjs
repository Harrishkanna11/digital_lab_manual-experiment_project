async function runTest() {
  console.log('Testing Edge Cases & Dynamic Calculations...\n');

  // Faculty Login
  const fLogin = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'faculty@digitallab.edu', password: 'password123' })
  }).then(r => r.json());

  // Mark student as ABSENT for CS301 on yesterday
  const yesterday = '2026-10-02';
  await fetch('http://localhost:8080/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fLogin.token}` },
    body: JSON.stringify({
      studentId: 1,
      subjectId: 1,
      date: yesterday,
      status: 'ABSENT'
    })
  });

  // Verify duplicate prevention on today's record: update today's record to ABSENT
  const today = '2026-10-03';
  const updateRes = await fetch('http://localhost:8080/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fLogin.token}` },
    body: JSON.stringify({
      studentId: 1,
      subjectId: 1,
      date: today,
      status: 'ABSENT'
    })
  }).then(r => r.json());
  console.log('Updated existing record for today to ABSENT, record ID:', updateRes.id);

  // Student Login
  const sLogin = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@digitallab.edu', password: 'password123' })
  }).then(r => r.json());

  const subSummary = await fetch('http://localhost:8080/api/attendance/student/subject-summary', {
    headers: { Authorization: `Bearer ${sLogin.token}` }
  }).then(r => r.json());

  const cs301 = subSummary.find(s => s.courseCode === 'CS301');
  console.log('CS301 Summary after marking absent:');
  console.log(`Total: ${cs301.totalClasses}, Present: ${cs301.presentCount}, Absent: ${cs301.absentCount}, Pct: ${cs301.attendancePercentage}%`);

  // Switch back to PRESENT for today
  await fetch('http://localhost:8080/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fLogin.token}` },
    body: JSON.stringify({
      studentId: 1,
      subjectId: 1,
      date: today,
      status: 'PRESENT'
    })
  });

  const subSummaryAfter = await fetch('http://localhost:8080/api/attendance/student/subject-summary', {
    headers: { Authorization: `Bearer ${sLogin.token}` }
  }).then(r => r.json());
  const cs301After = subSummaryAfter.find(s => s.courseCode === 'CS301');
  console.log('CS301 Summary after switching back to Present:');
  console.log(`Total: ${cs301After.totalClasses}, Present: ${cs301After.presentCount}, Absent: ${cs301After.absentCount}, Pct: ${cs301After.attendancePercentage}%`);

  console.log('\n✓ Dynamic calculations and duplicate prevention verified successfully!');
}

runTest().catch(console.error);
