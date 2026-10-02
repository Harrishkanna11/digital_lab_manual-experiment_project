import { useState, useEffect } from 'react';
import { notificationService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    notificationService.getAll().then(res => setNotifications(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(n => n.map(notif => ({ ...notif, read: true })));
    toast.success('All marked as read');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>🔔 Notifications</h2>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔔</div><h3>No notifications</h3><p>You're all caught up!</p></div>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
              <div className="notif-dot"></div>
              <div className="notif-content">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
