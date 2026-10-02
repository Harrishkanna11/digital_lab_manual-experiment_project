import { useState, useEffect } from 'react';
import { studentService } from '../../services/dataService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getProfile().then(res => setProfile(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!profile) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>👤 Profile</h2>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-body">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="user-avatar" style={{ width: 80, height: 80, fontSize: '2rem', margin: '0 auto 12px' }}>{profile.fullName?.charAt(0)}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{profile.fullName}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><span style={{ fontSize: '.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Register Number</span><p style={{ fontWeight: 600 }}>{profile.registerNumber}</p></div>
            <div><span style={{ fontSize: '.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Department</span><p style={{ fontWeight: 600 }}>{profile.department}</p></div>
            <div><span style={{ fontSize: '.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Year</span><p style={{ fontWeight: 600 }}>{profile.year}</p></div>
            <div><span style={{ fontSize: '.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Section</span><p style={{ fontWeight: 600 }}>{profile.section}</p></div>
          </div>
          <hr style={{ margin: '20px 0', borderColor: 'var(--border-light)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{profile.totalExperiments}</div><div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Experiments</div></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>{profile.completedExperiments}</div><div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Completed</div></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{profile.attendancePercentage}%</div><div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Attendance</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
