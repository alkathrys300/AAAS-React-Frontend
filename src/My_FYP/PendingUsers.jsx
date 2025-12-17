import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function PendingUsers() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/pending-users`);
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(data.users);
      } else {
        setError('Failed to load pending users');
      }
    } catch (err) {
      setError('Error fetching pending users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approved) => {
    try {
      setProcessingId(userId);
      
      // Get admin ID from localStorage (in production, use JWT token)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = userData.user_id || 1;
      
      const response = await fetch(`${API_BASE}/admin/approve-user?admin_id=${adminId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          approved: approved
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove user from pending list
        setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
        alert(data.message);
      } else {
        setError('Failed to process approval');
      }
    } catch (err) {
      setError('Error processing approval: ' + err.message);
    } finally {
      setProcessingId(null);
    }
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
    backButton: {
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
    content: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#999',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '20px',
    },
    emptyText: {
      fontSize: '1.2rem',
      marginBottom: '10px',
    },
    userCard: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px',
    },
    userEmail: {
      color: '#666',
      marginBottom: '5px',
    },
    userDetails: {
      display: 'flex',
      gap: '15px',
      marginTop: '10px',
    },
    badge: {
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'inline-block',
    },
    studentBadge: {
      background: '#e3f2fd',
      color: '#1976d2',
    },
    lecturerBadge: {
      background: '#fff3e0',
      color: '#f57c00',
    },
    adminBadge: {
      background: '#f3e5f5',
      color: '#7b1fa2',
    },
    dateText: {
      color: '#999',
      fontSize: '0.9rem',
    },
    actions: {
      display: 'flex',
      gap: '10px',
    },
    approveButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      background: '#4caf50',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    rejectButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      background: '#f44336',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '15px',
      borderRadius: '10px',
      margin: '20px 0',
    },
    loadingText: {
      textAlign: 'center',
      fontSize: '1.2rem',
      color: '#667eea',
      padding: '40px',
    },
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'student':
        return styles.studentBadge;
      case 'lecturer':
        return styles.lecturerBadge;
      case 'admin':
        return styles.adminBadge;
      default:
        return styles.studentBadge;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <p style={styles.loadingText}>Loading pending users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⏳ Pending User Approvals</h1>
        <button
          style={styles.backButton}
          onClick={() => navigate('/admin/dashboard')}
          onMouseOver={(e) => e.target.style.background = '#5568d3'}
          onMouseOut={(e) => e.target.style.background = '#667eea'}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Content */}
      <div style={styles.content}>
        {pendingUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✅</div>
            <p style={styles.emptyText}>No pending approvals</p>
            <p style={{ color: '#ccc' }}>All user registrations have been processed</p>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
            </p>
            {pendingUsers.map((user) => (
              <div
                key={user.user_id}
                style={styles.userCard}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
              >
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userEmail}>{user.email}</div>
                  <div style={styles.userDetails}>
                    <span style={{ ...styles.badge, ...getRoleBadgeStyle(user.role) }}>
                      {user.role}
                    </span>
                    <span style={styles.dateText}>
                      Joined: {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.approveButton,
                      ...(processingId === user.user_id ? styles.disabledButton : {})
                    }}
                    onClick={() => handleApproval(user.user_id, true)}
                    disabled={processingId === user.user_id}
                    onMouseOver={(e) => {
                      if (processingId !== user.user_id) {
                        e.target.style.background = '#45a049';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (processingId !== user.user_id) {
                        e.target.style.background = '#4caf50';
                      }
                    }}
                  >
                    {processingId === user.user_id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    style={{
                      ...styles.rejectButton,
                      ...(processingId === user.user_id ? styles.disabledButton : {})
                    }}
                    onClick={() => handleApproval(user.user_id, false)}
                    disabled={processingId === user.user_id}
                    onMouseOver={(e) => {
                      if (processingId !== user.user_id) {
                        e.target.style.background = '#da190b';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (processingId !== user.user_id) {
                        e.target.style.background = '#f44336';
                      }
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
