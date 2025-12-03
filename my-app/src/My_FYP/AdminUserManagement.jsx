import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function AdminUserManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/admin/all-users');
      if (response.data.success) {
        let filteredUsers = response.data.users;

        if (filter === 'student') {
          filteredUsers = filteredUsers.filter(u => u.role === 'student');
        } else if (filter === 'lecturer') {
          filteredUsers = filteredUsers.filter(u => u.role === 'lecturer');
        }

        setUsers(filteredUsers);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/pending-users');
      if (response.data.success) {
        setPendingUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
    }
  };

  const handleApproval = async (userId, approved) => {
    try {
      const response = await axios.post('http://localhost:8000/admin/approve-user', {
        user_id: userId,
        approved: approved
      }, {
        params: { admin_id: 1 } // In production, get from auth token
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers();
        fetchPendingUsers();
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to process approval');
      setTimeout(() => setError(''), 3000);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: '#fff',
      padding: '20px 40px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
    },
    headerButtons: {
      display: 'flex',
      gap: '15px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    outlineButton: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: '#667eea',
      border: '2px solid #667eea',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s',
    },
    content: {
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    pageTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '30px',
    },
    filterBar: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      flexWrap: 'wrap',
    },
    filterButton: {
      padding: '10px 20px',
      backgroundColor: 'white',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s',
    },
    filterButtonActive: {
      backgroundColor: '#667eea',
      color: 'white',
      border: '2px solid #667eea',
    },
    section: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      textAlign: 'left',
      padding: '15px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #e0e0e0',
    },
    tableCell: {
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px',
      color: '#333',
    },
    badge: {
      padding: '5px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block',
    },
    studentBadge: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
    },
    lecturerBadge: {
      backgroundColor: '#f3e5f5',
      color: '#7b1fa2',
    },
    adminBadge: {
      backgroundColor: '#fff3e0',
      color: '#f57c00',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
    },
    approveButton: {
      padding: '6px 16px',
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    rejectButton: {
      padding: '6px 16px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '18px',
      color: '#666',
    },
    error: {
      backgroundColor: '#fee',
      color: '#c00',
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    success: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#999',
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '20px',
    },
  };

  const getBadgeStyle = (role) => {
    switch (role) {
      case 'student':
        return { ...styles.badge, ...styles.studentBadge };
      case 'lecturer':
        return { ...styles.badge, ...styles.lecturerBadge };
      case 'admin':
        return { ...styles.badge, ...styles.adminBadge };
      default:
        return styles.badge;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading users...</div>
      </div>
    );
  }

  const displayUsers = filter === 'pending' ? pendingUsers : users;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🎓 User Management</h1>
        <div style={styles.headerButtons}>
          <button
            style={styles.outlineButton}
            onClick={() => navigate('/admin/dashboard')}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            Back to Dashboard
          </button>
          <button
            style={styles.button}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#5568d3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#667eea')}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        <h2 style={styles.pageTitle}>User Management</h2>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          {['all', 'pending', 'student', 'lecturer'].map((filterOption) => (
            <button
              key={filterOption}
              style={{
                ...styles.filterButton,
                ...(filter === filterOption ? styles.filterButtonActive : {}),
              }}
              onClick={() => setFilter(filterOption)}
              onMouseEnter={(e) => {
                if (filter !== filterOption) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.color = '#667eea';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== filterOption) {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.color = '#333';
                }
              }}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              {filterOption === 'pending' && pendingUsers.length > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                >
                  {pendingUsers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Users Section */}
        {filter === 'pending' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span>⏳</span>
              Pending Approvals ({pendingUsers.length})
            </h3>
            {pendingUsers.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>ID</th>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Role</th>
                    <th style={styles.tableHeader}>Joined At</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td style={styles.tableCell}>{user.user_id}</td>
                      <td style={styles.tableCell}>{user.name}</td>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <span style={getBadgeStyle(user.role)}>{user.role}</span>
                      </td>
                      <td style={styles.tableCell}>
                        {user.joined_at
                          ? new Date(user.joined_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.approveButton}
                            onClick={() => handleApproval(user.user_id, true)}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = '#45a049')
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = '#4caf50')
                            }
                          >
                            ✓ Approve
                          </button>
                          <button
                            style={styles.rejectButton}
                            onClick={() => handleApproval(user.user_id, false)}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = '#da190b')
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = '#f44336')
                            }
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>✅</div>
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {/* All Users Section */}
        {filter !== 'pending' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span>👥</span>
              {filter === 'all'
                ? 'All Approved Users'
                : filter === 'student'
                  ? 'Students'
                  : 'Lecturers'}{' '}
              ({displayUsers.length})
            </h3>
            {displayUsers.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>ID</th>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Role</th>
                    <th style={styles.tableHeader}>Joined At</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td style={styles.tableCell}>{user.user_id}</td>
                      <td style={styles.tableCell}>{user.name}</td>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <span style={getBadgeStyle(user.role)}>{user.role}</span>
                      </td>
                      <td style={styles.tableCell}>
                        {user.joined_at
                          ? new Date(user.joined_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                          }}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📋</div>
                <p>No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;
