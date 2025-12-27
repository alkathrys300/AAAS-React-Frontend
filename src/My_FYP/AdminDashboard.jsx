import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    total_students: 0,
    total_lecturers: 0,
    total_classes: 0,
    pending_approvals: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchRecentActivities();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/statistics`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
        setChartData(data.chart_data || []);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/recent-activities`);
      const data = await response.json();

      if (data.success) {
        setRecentActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return '✨';
      case 'approval': return '✅';
      case 'submission': return '📝';
      case 'class_created': return '📚';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'registration': return '#0ea5e9';
      case 'approval': return '#10b981';
      case 'submission': return '#f59e0b';
      case 'class_created': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to home page with replace to prevent going back to dashboard
    navigate('/', { replace: true });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
        <p style={{ fontSize: '18px' }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const maxValue = Math.max(...chartData.map(d => d.count || 0), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)' }}>
      {/* Modern Navbar */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>📊</span>
          <span style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[
            { icon: '👥', label: 'User Management', path: '/admin/user-management' },
            { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
            { icon: '⏳', label: 'Pending Approvals', path: '/admin/pending-users' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#0ea5e9'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b'; }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
        >
          Logout
        </button>
      </nav>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'TOTAL STUDENTS', value: statistics.total_students, icon: '🎓', color: '#0ea5e9', bg: '#e0f2fe' },
            { label: 'TOTAL LECTURERS', value: statistics.total_lecturers, icon: '👨‍🏫', color: '#06b6d4', bg: '#cffafe' },
            { label: 'TOTAL CLASSES', value: statistics.total_classes, icon: '📚', color: '#14b8a6', bg: '#ccfbf1' },
            { label: 'PENDING APPROVALS', value: statistics.pending_approvals, icon: '⏳', color: '#f59e0b', bg: '#fef3c7' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', border: '2px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)'; e.currentTarget.style.borderColor = stat.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: stat.bg, fontSize: '28px' }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* User Distribution Chart */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📊</span>
              <span>User Distribution by Role</span>
            </h2>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around', alignItems: 'flex-end', height: '280px', padding: '20px 0' }}>
              {chartData.map((item, i) => {
                const colors = ['#0ea5e9', '#06b6d4', '#14b8a6'];
                const height = (item.count / maxValue) * 100;
                
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{ width: '100%', background: colors[i % 3], borderRadius: '12px 12px 0 0', height: `${height}%`, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '24px', transition: 'all 0.3s ease', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scaleY(1.05)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scaleY(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
                    >
                      {item.count}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>
                      {item.role === 'student' ? 'Student' : item.role === 'lecturer' ? 'Lecturer' : 'Admin'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📋</span>
              <span>Recent Activity</span>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {recentActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: `2px solid transparent`, borderLeftColor: getActivityColor(activity.type), borderLeftWidth: '4px', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: getActivityColor(activity.type) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activity.description || activity.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatTimeAgo(activity.created_at || activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #0ea5e9, #06b6d4); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0284c7, #0891b2); }
      `}</style>
    </div>
  );
}
