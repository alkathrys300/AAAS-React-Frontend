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
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setChartData(data.chart_data);
        setRecentRegistrations(data.recent_registrations);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Error fetching statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/recent-activities`);
      const data = await response.json();

      if (data.success) {
        setRecentActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return '✨';
      case 'approval': return '✅';
      case 'rejection': return '❌';
      case 'submission': return '📝';
      case 'grade': return '⭐';
      case 'class_created': return '📚';
      case 'enrollment': return '👥';
      case 'login': return '🔐';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'registration': return '#667eea';
      case 'approval': return '#4caf50';
      case 'rejection': return '#f44336';
      case 'submission': return '#2196f3';
      case 'grade': return '#ff9800';
      case 'class_created': return '#9c27b0';
      case 'enrollment': return '#00bcd4';
      default: return '#666';
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
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    },
    header: {
      background: 'white',
      borderRadius: '15px',
      padding: '20px 30px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
    },
    nav: {
      display: 'flex',
      gap: '15px',
    },
    navButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      background: '#667eea',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
    },
    cardHover: {
      transform: 'translateY(-5px)',
    },
    cardTitle: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px',
    },
    cardIcon: {
      fontSize: '2rem',
      marginBottom: '10px',
    },
    chartSection: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    chartTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '20px',
    },
    barChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '30px',
      height: '300px',
      padding: '20px',
    },
    bar: {
      flex: 1,
      background: 'linear-gradient(to top, #667eea, #764ba2)',
      borderRadius: '10px 10px 0 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      fontWeight: 'bold',
      padding: '10px',
      minHeight: '50px',
      transition: 'all 0.3s ease',
    },
    barLabel: {
      marginTop: '10px',
      color: '#333',
      fontSize: '1rem',
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    recentSection: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      borderBottom: '2px solid #f0f0f0',
      color: '#666',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f0f0f0',
      color: '#333',
    },
    badge: {
      padding: '5px 10px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
    },
    studentBadge: {
      background: '#e3f2fd',
      color: '#1976d2',
    },
    lecturerBadge: {
      background: '#fff3e0',
      color: '#f57c00',
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '15px',
      borderRadius: '10px',
      margin: '20px 0',
    },
    activityFeed: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'start',
      padding: '15px',
      borderLeft: '3px solid #667eea',
      marginBottom: '15px',
      background: '#f9f9f9',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    activityIcon: {
      fontSize: '1.5rem',
      marginRight: '15px',
      minWidth: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      background: 'white',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '5px',
    },
    activityDescription: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '5px',
    },
    activityTime: {
      fontSize: '0.8rem',
      color: '#999',
    },
    gridLayout: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      marginBottom: '20px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', marginTop: '100px' }}>
          <p style={{ fontSize: '1.2rem', color: '#667eea' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Admin Dashboard</h1>
        <div style={styles.nav}>
          <button
            style={styles.navButton}
            onClick={() => navigate('/admin/user-management')}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            👥 User Management
          </button>
          <button
            style={styles.navButton}
            onClick={() => navigate('/admin/analytics')}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            📈 Analytics
          </button>
          <button
            style={styles.navButton}
            onClick={() => navigate('/admin/pending-users')}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Pending Approvals ({statistics.pending_approvals})
          </button>
          <button
            style={styles.navButton}
            onClick={() => navigate('/')}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Back to Home
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Statistics Cards */}
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>👨‍🎓</div>
          <div style={styles.cardTitle}>Total Students</div>
          <div style={styles.cardValue}>{statistics.total_students}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>👨‍🏫</div>
          <div style={styles.cardTitle}>Total Lecturers</div>
          <div style={styles.cardValue}>{statistics.total_lecturers}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>📚</div>
          <div style={styles.cardTitle}>Total Classes</div>
          <div style={styles.cardValue}>{statistics.total_classes}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>⏳</div>
          <div style={styles.cardTitle}>Pending Approvals</div>
          <div style={{ ...styles.cardValue, color: '#f57c00' }}>
            {statistics.pending_approvals}
          </div>
        </div>
      </div>

      {/* Chart Section & Recent Activity Feed */}
      <div style={styles.gridLayout}>
        {/* Chart Section */}
        <div style={styles.chartSection}>
          <h2 style={styles.chartTitle}>User Distribution by Role</h2>
          <div style={styles.barChart}>
            {chartData.map((item, index) => (
              <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${(item.count / maxCount) * 250}px`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {item.count}
                  </span>
                </div>
                <div style={styles.barLabel}>{item.role}</div>
              </div>
            ))}
          </div>
          {chartData.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              No data available yet
            </p>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div style={styles.activityFeed}>
          <h2 style={styles.chartTitle}>📋 Recent Activity</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.activityItem,
                    borderLeftColor: getActivityColor(activity.type),
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f9f9f9';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    ...styles.activityIcon,
                    background: getActivityColor(activity.type) + '20',
                  }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>{activity.title}</div>
                    <div style={styles.activityDescription}>{activity.description}</div>
                    <div style={styles.activityTime}>
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div style={styles.recentSection}>
        <h2 style={styles.chartTitle}>Recent Pending Registrations</h2>
        {recentRegistrations.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((user) => (
                <tr key={user.user_id}>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(user.role === 'student' ? styles.studentBadge : styles.lecturerBadge)
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            No pending registrations
          </p>
        )}
      </div>
    </div>
  );
}
