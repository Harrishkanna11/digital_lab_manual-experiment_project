import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import Experiments from './pages/student/Experiments';
import ExperimentDetails from './pages/student/ExperimentDetails';
import LabManuals from './pages/student/LabManuals';
import StudentSubmissions from './pages/student/StudentSubmissions';
import AttendancePage from './pages/student/AttendancePage';
import MarksPage from './pages/student/MarksPage';
import MyLabJournal from './pages/student/MyLabJournal';
import BookmarksPage from './pages/student/BookmarksPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ProfilePage from './pages/student/ProfilePage';
import SubjectEnrollment from './pages/student/SubjectEnrollment';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ExperimentManagement from './pages/faculty/ExperimentManagement';
import SubjectManagement from './pages/faculty/SubjectManagement';
import LabManualManagement from './pages/faculty/LabManualManagement';
import SubmissionReview from './pages/faculty/SubmissionReview';
import AttendanceManagement from './pages/faculty/AttendanceManagement';
import MarksManagement from './pages/faculty/MarksManagement';
import StudentManagement from './pages/faculty/StudentManagement';
import './styles/index.css';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard'} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard'} /> : <Register />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="experiments" element={<Experiments />} />
        <Route path="experiments/:id" element={<ExperimentDetails />} />
        <Route path="lab-manuals" element={<LabManuals />} />
        <Route path="submissions" element={<StudentSubmissions />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="marks" element={<MarksPage />} />
        <Route path="journal" element={<MyLabJournal />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="enroll" element={<SubjectEnrollment />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={<ProtectedRoute role="FACULTY"><FacultyLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="experiments" element={<ExperimentManagement />} />
        <Route path="subjects" element={<SubjectManagement />} />
        <Route path="lab-manuals" element={<LabManualManagement />} />
        <Route path="submissions" element={<SubmissionReview />} />
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="marks" element={<MarksManagement />} />
        <Route path="students" element={<StudentManagement />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '8px', padding: '12px 16px', fontSize: '.9rem' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
