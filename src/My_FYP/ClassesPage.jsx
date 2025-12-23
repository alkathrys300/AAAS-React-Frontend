import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function ClassesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchClasses(token, parsedUser.user_id, parsedUser.role);
  }, [navigate]);

  const fetchClasses = async (token, userId, role) => {
    setLoading(true);
    try {
      if (role === 'student') {
        // Fetch enrolled classes
        const enrolledRes = await fetch(`${API_BASE}/student/${userId}/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (enrolledRes.ok) {
          const data = await enrolledRes.json();
          setEnrolledClasses(data.classes || []);
        }

        // Fetch available classes
        const availableRes = await fetch(`${API_BASE}/classes/available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (availableRes.ok) {
          const data = await availableRes.json();
          setAvailableClasses(data.classes || []);
        }
      } else if (role === 'lecturer') {
        // Fetch lecturer's classes
        const res = await fetch(`${API_BASE}/lecturer/${userId}/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEnrolledClasses(data.classes || []);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classItem) => {
    setSelectedClass(classItem);
    setShowEnrollModal(true);
  };

  const confirmEnroll = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/class/${selectedClass.class_id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ student_id: user.user_id })
      });

      if (res.ok) {
        alert('✅ Enrollment request sent! Waiting for lecturer approval.');
        setShowEnrollModal(false);
        fetchClasses(token, user.user_id, user.role);
      } else {
        const error = await res.json();
        alert(`❌ ${error.detail || 'Enrollment failed'}`);
      }
    } catch (error) {
      alert('❌ Failed to enroll in class');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:3001/';
  };

  if (!user) return <div style={styles.loadingContainer}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>AAAS</span>
          </div>
          
          <div style={styles.navLinks}>
            <button
              onClick={() => navigate('/userpage')}
              style={styles.navLink}
              onMouseEnter={(e) => e.target.style.background = 'rgba(14,165,233,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={styles.navIcon}>🏠</span>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/classes')}
              style={styles.navLinkActive}
            >
              <span style={styles.navIcon}>📚</span>
              <span>Classes</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              style={styles.navLink}
              onMouseEnter={(e) => e.target.style.background = 'rgba(14,165,233,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={styles.navIcon}>📊</span>
              <span>Analytics</span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={styles.navLink}
              onMouseEnter={(e) => e.target.style.background = 'rgba(14,165,233,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={styles.navIcon}>📧</span>
              <span>Contact</span>
            </button>
          </div>

          <div style={styles.navRight}>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>
                {user.role === 'student' ? '👨‍🎓' : '👨‍🏫'}
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>📚 My Classes</h1>
            <p style={styles.pageSubtitle}>Manage your classes and track student progress</p>
          </div>
          {user.role === 'student' && (
            <button
              onClick={() => setActiveTab('available')}
              style={styles.enrollButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(16,185,129,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(16,185,129,0.3)';
              }}
            >
              <span>➕ Enroll in Class</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        {user.role === 'student' && (
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab('enrolled')}
              style={activeTab === 'enrolled' ? styles.tabActive : styles.tab}
            >
              Enrolled ({enrolledClasses.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              style={activeTab === 'available' ? styles.tabActive : styles.tab}
            >
              Available ({availableClasses.length})
            </button>
          </div>
        )}

        {/* Classes Grid */}
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading classes...</p>
          </div>
        ) : (
          <>
            {activeTab === 'enrolled' && (
              <div style={styles.classesGrid}>
                {enrolledClasses.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <h3 style={styles.emptyTitle}>No classes found</h3>
                    <p style={styles.emptyText}>
                      {user.role === 'student' 
                        ? 'Enroll in a class to begin your learning journey!'
                        : 'Create a class to start teaching!'}
                    </p>
                  </div>
                ) : (
                  enrolledClasses.map((classItem) => (
                    <div
                      key={classItem.class_id}
                      style={styles.classCard}
                      onClick={() => navigate(`/class/${classItem.class_id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div style={styles.classCardHeader}>
                        <div style={styles.classIcon}>📘</div>
                        <div style={styles.classStatus}>Active</div>
                      </div>
                      <h3 style={styles.className}>{classItem.name}</h3>
                      <p style={styles.classDescription}>{classItem.description || 'No description available'}</p>
                      <div style={styles.classFooter}>
                        <div style={styles.classInfo}>
                          <span style={styles.classInfoIcon}>👤</span>
                          <span>{classItem.lecturer_name || 'Instructor'}</span>
                        </div>
                        <div style={styles.classInfo}>
                          <span style={styles.classInfoIcon}>👥</span>
                          <span>{classItem.student_count || 0} students</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'available' && user.role === 'student' && (
              <div style={styles.classesGrid}>
                {availableClasses.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>✅</div>
                    <h3 style={styles.emptyTitle}>All caught up!</h3>
                    <p style={styles.emptyText}>You've enrolled in all available classes</p>
                  </div>
                ) : (
                  availableClasses.map((classItem) => (
                    <div key={classItem.class_id} style={styles.classCard}>
                      <div style={styles.classCardHeader}>
                        <div style={styles.classIcon}>📗</div>
                        <div style={styles.availableBadge}>Available</div>
                      </div>
                      <h3 style={styles.className}>{classItem.name}</h3>
                      <p style={styles.classDescription}>{classItem.description || 'No description available'}</p>
                      <div style={styles.classFooter}>
                        <div style={styles.classInfo}>
                          <span style={styles.classInfoIcon}>👤</span>
                          <span>{classItem.lecturer_name || 'Instructor'}</span>
                        </div>
                        <div style={styles.classInfo}>
                          <span style={styles.classInfoIcon}>👥</span>
                          <span>{classItem.student_count || 0} students</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(classItem)}
                        style={styles.enrollClassButton}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Enroll Now →
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEnrollModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Enroll in {selectedClass?.name}?</h2>
            <p style={styles.modalText}>
              You're about to request enrollment in this class. The lecturer will review your request.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmEnroll}
                style={styles.confirmButton}
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#0ea5e9',
  },

  // Navbar (same as UserPage)
  navbar: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  logoIcon: { fontSize: '2rem' },
  logoText: { letterSpacing: '1px' },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#0ea5e9',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  navIcon: { fontSize: '1.2rem' },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  userRole: { fontSize: '1.2rem' },
  logoutBtn: {
    padding: '10px 20px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#dc2626',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Main Content
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
  },

  // Page Header
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  pageSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },
  enrollButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
  },

  // Tabs
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0',
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid #0ea5e9',
    color: '#0ea5e9',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  // Classes Grid
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },

  // Class Card
  classCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  classCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  classIcon: {
    fontSize: '2.5rem',
  },
  classStatus: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
    color: '#15803d',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  availableBadge: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    color: '#0369a1',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  className: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  classDescription: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '16px',
    height: '48px',
    overflow: 'hidden',
  },
  classFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  classInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },
  classInfoIcon: {
    fontSize: '1rem',
  },
  enrollClassButton: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Empty State
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },

  // Loading State
  loadingState: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '1.2rem',
    color: '#64748b',
  },
  loadingSpinner: {
    fontSize: '4rem',
    marginBottom: '16px',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  modalText: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '12px 24px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  confirmButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
