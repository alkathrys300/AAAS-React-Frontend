import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function PendingUsers() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ show: false, user: null, action: null });

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
        setSuccessMessage(approved ? '✓ User approved successfully!' : '✓ User rejected successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setConfirmDialog({ show: false, user: null, action: null });
      } else {
        setError('Failed to process approval');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error processing approval: ' + err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    total: pendingUsers.length,
    students: pendingUsers.filter(u => u.role === 'student').length,
    lecturers: pendingUsers.filter(u => u.role === 'lecturer').length,
    admins: pendingUsers.filter(u => u.role === 'admin').length,
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
    },
    navbar: {
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '16px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    navTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    navIcon: {
      fontSize: '32px',
    },
    navLabel: {
      fontSize: '24px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    navLinks: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    navButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '10px',
      background: 'transparent',
      color: '#64748b',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logoutButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    content: {
      padding: '32px',
      maxWidth: '1600px',
      margin: '0 auto',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    statCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
    },
    statIcon: {
      padding: '12px',
      borderRadius: '12px',
      fontSize: '28px',
      marginBottom: '16px',
      display: 'inline-block',
    },
    statValue: {
      fontSize: '42px',
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: '4px',
    },
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    searchFilterContainer: {
      background: 'white',
      borderRadius: '20px',
      padding: '24px 32px',
      marginBottom: '24px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    searchInput: {
      flex: '1 1 300px',
      padding: '12px 20px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontWeight: '500',
    },
    filterSelect: {
      padding: '12px 20px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      fontSize: '15px',
      outline: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '180px',
      fontWeight: '600',
      color: '#64748b',
    },
    clearButton: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: '#f1f5f9',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    mainCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '24px',
      animation: 'pulse 2s ease-in-out infinite',
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '12px',
    },
    emptyText: {
      fontSize: '16px',
      color: '#64748b',
      marginBottom: '32px',
    },
    emptyAction: {
      padding: '12px 32px',
      borderRadius: '12px',
      border: '2px solid #0ea5e9',
      background: 'transparent',
      color: '#0ea5e9',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    userCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      border: '2px solid #f1f5f9',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    userEmail: {
      color: '#64748b',
      marginBottom: '12px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    userDetails: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    badge: {
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-block',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    studentBadge: {
      background: '#e0f2fe',
      color: '#0284c7',
    },
    lecturerBadge: {
      background: '#cffafe',
      color: '#0891b2',
    },
    adminBadge: {
      background: '#ccfbf1',
      color: '#0d9488',
    },
    dateText: {
      color: '#94a3b8',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    approveButton: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    rejectButton: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    error: {
      background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: '#991b1b',
      padding: '16px 24px',
      borderRadius: '12px',
      margin: '0 32px 24px 32px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
    },
    success: {
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#065f46',
      padding: '16px 24px',
      borderRadius: '12px',
      margin: '0 32px 24px 32px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
    },
    loadingContainer: {
      padding: '32px',
    },
    skeleton: {
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s ease-in-out infinite',
      borderRadius: '16px',
      height: '100px',
      marginBottom: '16px',
    },
    confirmDialog: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    },
    confirmBox: {
      background: 'white',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      animation: 'scaleIn 0.3s ease-out',
    },
    confirmTitle: {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#1e293b',
    },
    confirmMessage: {
      fontSize: '15px',
      color: '#64748b',
      marginBottom: '32px',
      lineHeight: '1.6',
    },
    confirmActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
    },
    cancelButton: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: '2px solid #e2e8f0',
      background: 'white',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
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

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to home page with replace to prevent going back to pending users
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <nav style={styles.navbar}>
          <div style={styles.navTitle}>
            <span style={styles.navIcon}>⏳</span>
            <span style={styles.navLabel}>Pending User Approvals</span>
          </div>
        </nav>
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            <div style={styles.skeleton}></div>
            <div style={styles.skeleton}></div>
            <div style={styles.skeleton}></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Modern Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navTitle}>
          <span style={styles.navIcon}>⏳</span>
          <span style={styles.navLabel}>Pending User Approvals</span>
        </div>
        
        <div style={styles.navLinks}>
          {[
            { icon: '�', label: 'Dashboard', path: '/admin/dashboard' },
            { icon: '👥', label: 'User Management', path: '/admin/user-management' },
            { icon: '📈', label: 'Analytics', path: '/admin/analytics' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.color = '#0ea5e9';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#64748b';
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Logout
        </button>
      </nav>

      {/* Messages */}
      {error && (
        <div style={styles.error}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={styles.success}>
          <span style={{ fontSize: '20px' }}>✓</span>
          {successMessage}
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {/* Stats Cards */}
        {pendingUsers.length > 0 && (
          <div style={styles.statsContainer}>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#0ea5e9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ ...styles.statIcon, background: '#e0f2fe' }}>⏳</div>
              <div style={{ ...styles.statValue, color: '#0ea5e9' }}>{roleStats.total}</div>
              <div style={styles.statLabel}>Total Pending</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ ...styles.statIcon, background: '#e0f2fe' }}>🎓</div>
              <div style={{ ...styles.statValue, color: '#0284c7' }}>{roleStats.students}</div>
              <div style={styles.statLabel}>Students</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#0891b2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ ...styles.statIcon, background: '#cffafe' }}>👨‍🏫</div>
              <div style={{ ...styles.statValue, color: '#0891b2' }}>{roleStats.lecturers}</div>
              <div style={styles.statLabel}>Lecturers</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#0d9488';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ ...styles.statIcon, background: '#ccfbf1' }}>🛡️</div>
              <div style={{ ...styles.statValue, color: '#0d9488' }}>{roleStats.admins}</div>
              <div style={styles.statLabel}>Admins</div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {pendingUsers.length > 0 && (
          <div style={styles.searchFilterContainer}>
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#0ea5e9';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.filterSelect}
              onFocus={(e) => {
                e.target.style.borderColor = '#0ea5e9';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="lecturer">Lecturers Only</option>
              <option value="admin">Admins Only</option>
            </select>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                style={styles.clearButton}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f1f5f9';
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Main Content Card */}
        <div style={styles.mainCard}>
          {filteredUsers.length === 0 && pendingUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✅</div>
              <div style={styles.emptyTitle}>No pending approvals</div>
              <p style={styles.emptyText}>All user registrations have been processed</p>
              <button
                style={styles.emptyAction}
                onClick={() => navigate('/admin/dashboard')}
                onMouseEnter={(e) => {
                  e.target.style.background = '#0ea5e9';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#0ea5e9';
                }}
              >
                Back to Dashboard
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
              <div style={styles.emptyTitle}>No users found</div>
              <p style={styles.emptyText}>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} waiting for approval
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  style={styles.userCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = '#0ea5e9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>
                      <span>👤</span>
                      {user.name}
                    </div>
                    <div style={styles.userEmail}>
                      <span>✉️</span>
                      {user.email}
                    </div>
                    <div style={styles.userDetails}>
                      <span style={{ ...styles.badge, ...getRoleBadgeStyle(user.role) }}>
                        {user.role}
                      </span>
                      <span style={styles.dateText}>
                        <span>📅</span>
                        Joined {user.joined_at ? new Date(user.joined_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={{
                        ...styles.approveButton,
                        ...(processingId === user.user_id ? styles.disabledButton : {})
                      }}
                      onClick={() => setConfirmDialog({ show: true, user, action: 'approve' })}
                      disabled={processingId === user.user_id}
                      onMouseEnter={(e) => {
                        if (processingId !== user.user_id) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (processingId !== user.user_id) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {processingId === user.user_id ? '⏳ Processing...' : '✓ Approve'}
                    </button>
                    <button
                      style={{
                        ...styles.rejectButton,
                        ...(processingId === user.user_id ? styles.disabledButton : {})
                      }}
                      onClick={() => setConfirmDialog({ show: true, user, action: 'reject' })}
                      disabled={processingId === user.user_id}
                      onMouseEnter={(e) => {
                        if (processingId !== user.user_id) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (processingId !== user.user_id) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
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

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div 
          style={styles.confirmDialog}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmDialog({ show: false, user: null, action: null });
            }
          }}
        >
          <div style={styles.confirmBox}>
            <div style={styles.confirmTitle}>
              {confirmDialog.action === 'approve' ? '✓ Approve User?' : '✗ Reject User?'}
            </div>
            <div style={styles.confirmMessage}>
              Are you sure you want to {confirmDialog.action} <strong>{confirmDialog.user?.name}</strong>?
              <br />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                ({confirmDialog.user?.email})
              </span>
            </div>
            <div style={styles.confirmActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setConfirmDialog({ show: false, user: null, action: null })}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#94a3b8';
                  e.target.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                style={confirmDialog.action === 'approve' ? styles.approveButton : styles.rejectButton}
                onClick={() => handleApproval(confirmDialog.user.user_id, confirmDialog.action === 'approve')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {confirmDialog.action === 'approve' ? '✓ Yes, Approve' : '✗ Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #0ea5e9, #06b6d4); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0284c7, #0891b2); }
      `}</style>
    </div>
  );
}
