import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { registerStudent, registerFaculty } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [studentForm, setStudentForm] = useState({ fullName: '', registerNumber: '', email: '', password: '', department: '', year: 1, section: '' });
  const [facultyForm, setFacultyForm] = useState({ fullName: '', facultyId: '', email: '', password: '', department: '', designation: '' });

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerStudent(studentForm);
      toast.success('Registration successful!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleFacultyRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerFaculty(facultyForm);
      toast.success('Registration successful!');
      navigate('/faculty/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DLME</Link>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Register as a student or faculty member</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => setRole('STUDENT')}>Student</button>
          <button className={`auth-tab ${role === 'FACULTY' ? 'active' : ''}`} onClick={() => setRole('FACULTY')}>Faculty</button>
        </div>

        {role === 'STUDENT' ? (
          <form onSubmit={handleStudentRegister} autoComplete="off">
            <div className="form-group"><label>Full Name</label><input className="form-control" placeholder="Enter your full name" value={studentForm.fullName} onChange={e => setStudentForm({...studentForm, fullName: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Register Number</label><input className="form-control" placeholder="e.g. 21CS101" value={studentForm.registerNumber} onChange={e => setStudentForm({...studentForm, registerNumber: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" placeholder="student@college.edu" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Password</label><input type="password" className="form-control" placeholder="Min 6 characters" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} autoComplete="new-password" required minLength={6} /></div>
            <div className="form-row">
              <div className="form-group"><label>Department</label><input className="form-control" placeholder="e.g. CSE" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})} required /></div>
              <div className="form-group"><label>Year</label><select className="form-control" value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: parseInt(e.target.value)})}><option value={1}>1st Year</option><option value={2}>2nd Year</option><option value={3}>3rd Year</option><option value={4}>4th Year</option></select></div>
            </div>
            <div className="form-group"><label>Section</label><input className="form-control" placeholder="e.g. A" value={studentForm.section} onChange={e => setStudentForm({...studentForm, section: e.target.value})} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>{loading ? 'Registering...' : 'Register as Student'}</button>
          </form>
        ) : (
          <form onSubmit={handleFacultyRegister} autoComplete="off">
            <div className="form-group"><label>Faculty Name</label><input className="form-control" placeholder="Enter full name" value={facultyForm.fullName} onChange={e => setFacultyForm({...facultyForm, fullName: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Faculty ID</label><input className="form-control" placeholder="e.g. FAC001" value={facultyForm.facultyId} onChange={e => setFacultyForm({...facultyForm, facultyId: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" placeholder="faculty@college.edu" value={facultyForm.email} onChange={e => setFacultyForm({...facultyForm, email: e.target.value})} autoComplete="off" required /></div>
            <div className="form-group"><label>Password</label><input type="password" className="form-control" placeholder="Min 6 characters" value={facultyForm.password} onChange={e => setFacultyForm({...facultyForm, password: e.target.value})} autoComplete="new-password" required minLength={6} /></div>
            <div className="form-row">
              <div className="form-group"><label>Department</label><input className="form-control" placeholder="e.g. CSE" value={facultyForm.department} onChange={e => setFacultyForm({...facultyForm, department: e.target.value})} required /></div>
              <div className="form-group"><label>Designation</label><input className="form-control" placeholder="e.g. Associate Professor" value={facultyForm.designation} onChange={e => setFacultyForm({...facultyForm, designation: e.target.value})} required /></div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>{loading ? 'Registering...' : 'Register as Faculty'}</button>
          </form>
        )}
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
