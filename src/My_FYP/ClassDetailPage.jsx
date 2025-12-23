import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [user, setUser] = useState(null);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  
  // Assignment upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetchClassDetails(token);
    fetchAssignments(token);
    if (parsedUser.role === 'lecturer') {
      fetchEnrolledStudents(token);
    }
  }, [navigate, classId]);

  const fetchClassDetails = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/class/${classId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/class/${classId}/assignments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchEnrolledStudents = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/class/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrolledStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleUploadAssignment = async () => {
    if (!uploadFile || !assignmentTitle.trim()) {
      alert('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', assignmentTitle);
    formData.append('class_id', classId);

    try {
      const res = await fetch(`${API_BASE}/upload-assignment/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert('Assignment uploaded successfully!');
        setShowUploadModal(false);
        setUploadFile(null);
        setAssignmentTitle('');
        fetchAssignments(token);
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading assignment:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/assignment/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Assignment deleted successfully');
        fetchAssignments(token);
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Delete failed');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the class?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/class/${classId}/student/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Student removed successfully');
        fetchEnrolledStudents(token);
      } else {
        alert('Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Remove failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:3001/';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Loading class details...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div style={styles.errorContainer}>
        <h2>Class not found</h2>
        <button onClick={() => navigate('/classes')} style={styles.backButton}>
          Back to Classes
        </button>
      </div>
    );
  }

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
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>
                {user?.role === 'student' ? '👨‍🎓' : '👨‍🏫'}
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Class Header */}
        <div style={styles.classHeader}>
          <button 
            onClick={() => navigate('/classes')}
            style={styles.backBtn}
            onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
            onMouseLeave={(e) => e.target.style.background = 'white'}
          >
            ← Back
          </button>
          <h1 style={styles.className}>{classData.class_name}</h1>
          <p style={styles.classDesc}>{classData.description || 'No description available'}</p>
          <div style={styles.classStats}>
            <div style={styles.statBadge}>
              <span style={styles.statIcon}>👨‍🎓</span>
              <span>{enrolledStudents.length} Students</span>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statIcon}>📝</span>
              <span>{assignments.length} Assignments</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('assignments')}
            style={activeTab === 'assignments' ? styles.tabActive : styles.tab}
          >
            📝 Assignments
          </button>
          {user?.role === 'lecturer' && (
            <button
              onClick={() => setActiveTab('students')}
              style={activeTab === 'students' ? styles.tabActive : styles.tab}
            >
              👨‍🎓 Students
            </button>
          )}
        </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div style={styles.tabContent}>
            {user?.role === 'student' && (
              <div style={styles.actionBar}>
                <button
                  onClick={() => setShowUploadModal(true)}
                  style={styles.uploadBtn}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
                  }}
                >
                  <span>📤 Upload Assignment</span>
                </button>
              </div>
            )}

            {assignments.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <h3 style={styles.emptyTitle}>No assignments yet</h3>
                <p style={styles.emptyText}>
                  {user?.role === 'student' 
                    ? 'Upload your first assignment to get started'
                    : 'Students will upload their assignments here'
                  }
                </p>
              </div>
            ) : (
              <div style={styles.assignmentsGrid}>
                {assignments.map((assignment) => (
                  <div key={assignment.assignment_id} style={styles.assignmentCard}>
                    <div style={styles.assignmentHeader}>
                      <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                      {assignment.score && (
                        <div style={styles.scoreBadge}>
                          {assignment.score}/100
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.assignmentInfo}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>👤 Student:</span>
                        <span style={styles.infoValue}>{assignment.student_name}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>📅 Submitted:</span>
                        <span style={styles.infoValue}>
                          {new Date(assignment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>📎 File:</span>
                        <span style={styles.infoValue}>{assignment.filename}</span>
                      </div>
                    </div>

                    {assignment.feedback && (
                      <div style={styles.feedbackSection}>
                        <div style={styles.feedbackLabel}>💬 Feedback:</div>
                        <div style={styles.feedbackText}>{assignment.feedback}</div>
                      </div>
                    )}

                    <div style={styles.assignmentActions}>
                      <a
                        href={`${API_BASE}/download-assignment/${assignment.assignment_id}`}
                        download
                        style={styles.downloadBtn}
                        onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        ⬇️ Download
                      </a>
                      
                      {(user?.role === 'student' && user?.user_id === assignment.student_id) && (
                        <button
                          onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                          style={styles.deleteBtn}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#dc2626';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = '#dc2626';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab (Lecturer Only) */}
        {activeTab === 'students' && user?.role === 'lecturer' && (
          <div style={styles.tabContent}>
            {enrolledStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👨‍🎓</div>
                <h3 style={styles.emptyTitle}>No students enrolled</h3>
                <p style={styles.emptyText}>Students will appear here once they enroll</p>
              </div>
            ) : (
              <div style={styles.studentsGrid}>
                {enrolledStudents.map((student) => (
                  <div key={student.user_id} style={styles.studentCard}>
                    <div style={styles.studentAvatar}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 style={styles.studentName}>{student.name}</h3>
                    <p style={styles.studentEmail}>{student.email}</p>
                    <div style={styles.studentStats}>
                      <div style={styles.studentStat}>
                        <span style={styles.statNumber}>
                          {assignments.filter(a => a.student_id === student.user_id).length}
                        </span>
                        <span style={styles.statLabel}>Submissions</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.user_id)}
                      style={styles.removeStudentBtn}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#dc2626';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#dc2626';
                      }}
                    >
                      Remove Student
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>📤 Upload Assignment</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Assignment Title</label>
              <input
                type="text"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Enter assignment title"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>File</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={styles.fileInput}
                accept=".pdf,.doc,.docx,.txt"
              />
              {uploadFile && (
                <div style={styles.fileName}>
                  📎 {uploadFile.name}
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={styles.cancelBtn}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAssignment}
                style={styles.submitBtn}
                disabled={uploading}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '16px',
  },
  loadingSpinner: {
    fontSize: '3rem',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '24px',
  },
  backButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // Navbar
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

  // Class Header
  classHeader: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  backBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '2px solid #0ea5e9',
    borderRadius: '8px',
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
  },
  className: {
    fontSize: '2.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  classDesc: {
    fontSize: '1.1rem',
    color: '#64748b',
    marginBottom: '24px',
  },
  classStats: {
    display: 'flex',
    gap: '16px',
  },
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0ea5e9',
  },
  statIcon: {
    fontSize: '1.3rem',
  },

  // Tabs
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    background: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    padding: '14px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
  },

  // Tab Content
  tabContent: {
    minHeight: '400px',
  },

  // Action Bar
  actionBar: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  uploadBtn: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(14,165,233,0.3)',
  },

  // Assignments Grid
  assignmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  assignmentCard: {
    background: 'white',
    padding: '28px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
  },
  assignmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  assignmentTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    flex: 1,
  },
  scoreBadge: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  assignmentInfo: {
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '0.9rem',
    color: '#0f172a',
    fontWeight: '600',
  },
  feedbackSection: {
    background: '#f0f9ff',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #0ea5e9',
  },
  feedbackLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0ea5e9',
    marginBottom: '8px',
  },
  feedbackText: {
    fontSize: '0.95rem',
    color: '#0f172a',
    lineHeight: '1.6',
  },
  assignmentActions: {
    display: 'flex',
    gap: '12px',
  },
  downloadBtn: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #0ea5e9',
    borderRadius: '10px',
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #dc2626',
    borderRadius: '10px',
    color: '#dc2626',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Students Grid
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  studentCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  studentAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 auto 16px',
  },
  studentName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  studentEmail: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '20px',
  },
  studentStats: {
    marginBottom: '20px',
  },
  studentStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  removeStudentBtn: {
    width: '100%',
    padding: '12px',
    background: 'white',
    border: '2px solid #dc2626',
    borderRadius: '10px',
    color: '#dc2626',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '32px',
    margin: '0 0 32px 0',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border 0.2s ease',
  },
  fileInput: {
    width: '100%',
    padding: '14px',
    fontSize: '0.95rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  fileName: {
    marginTop: '12px',
    padding: '12px',
    background: '#f0f9ff',
    borderRadius: '8px',
    color: '#0ea5e9',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  modalActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(14,165,233,0.3)',
  },
};
