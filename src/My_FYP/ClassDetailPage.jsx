import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserPage.css';

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [rubricFile, setRubricFile] = useState(null);
  const [rubricTitle, setRubricTitle] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadingAssignment, setUploadingAssignment] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchClassDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Class details:', data);
        setClassDetails(data);
      } else {
        console.error('Failed to fetch class details, status:', response.status);
        setError('Failed to fetch class details');
      }
    } catch (err) {
      setError('Error loading class details');
      console.error('Error:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔍 Fetching submissions for class:', classId);
      const response = await fetch(`http://localhost:8000/class/${classId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Submissions data:', data);
        const submissionsData = data.submissions || [];

        // Fetch feedback for each submission to get score and status
        const submissionsWithFeedback = await Promise.all(
          submissionsData.map(async (sub) => {
            try {
              const feedbackRes = await fetch(
                `http://localhost:8000/assignment/${sub.script_id}/feedback`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );

              if (feedbackRes.ok) {
                const feedbackData = await feedbackRes.json();
                return {
                  ...sub,
                  review_status: feedbackData.review_status,
                  final_score: feedbackData.final_score,
                  evaluation: feedbackData.evaluation
                };
              } else {
                return {
                  ...sub,
                  review_status: 'pending',
                  final_score: null,
                  evaluation: null
                };
              }
            } catch (err) {
              console.error(`Error fetching feedback for ${sub.script_id}:`, err);
              return {
                ...sub,
                review_status: 'pending',
                final_score: null,
                evaluation: null
              };
            }
          })
        );

        setSubmissions(submissionsWithFeedback);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch submissions:', errorData);
      }
      setLoading(false);
    } catch (err) {
      console.error('💥 Error fetching submissions:', err);
      setLoading(false);
    }
  };

  const fetchRubric = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/rubric`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Rubric:', data);
        setRubric(data.rubric);
      }
    } catch (err) {
      console.error('Error fetching rubric:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Students:', data);
        setStudents(data.students || []);
        setPendingStudents(data.pending_students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchSubmissions();
    fetchRubric();
    if (user && user.role === 'lecturer') {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, user]);

  const handleRubricUpload = async () => {
    if (!rubricFile) {
      alert('❌ Please select a rubric file');
      return;
    }

    if (!rubricTitle.trim()) {
      alert('❌ Please enter a rubric title');
      return;
    }

    if (!assignmentTitle.trim()) {
      alert('❌ Please enter an assignment title');
      return;
    }

    setUploadingRubric(true);
    try {
      const formData = new FormData();
      formData.append('file', rubricFile);
      formData.append('rubric_title', rubricTitle.trim());
      formData.append('assignment_title', assignmentTitle.trim());
      formData.append('deadline', deadline);
      formData.append('replace_existing', rubric ? 'true' : 'false');

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/upload-rubric/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message || 'Rubric uploaded successfully'}`);
        setShowRubricModal(false);
        setRubricFile(null);
        setRubricTitle('');
        setAssignmentTitle('');
        setDeadline('');
        fetchRubric();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to upload rubric'}`);
      }
    } catch (err) {
      console.error('Error uploading rubric:', err);
      alert('❌ Error uploading rubric');
    } finally {
      setUploadingRubric(false);
    }
  };

  const handleDeleteRubric = async () => {
    if (!window.confirm('Are you sure you want to delete this rubric?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/rubric/${rubric.rubric_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Rubric deleted successfully');
        setRubric(null);
        fetchRubric();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to delete rubric'}`);
      }
    } catch (err) {
      console.error('Error deleting rubric:', err);
      alert('❌ Error deleting rubric');
    }
  };

  const handleDeleteSubmission = async (scriptId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/submission/${scriptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Submission deleted successfully');
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to delete submission'}`);
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert('❌ Error deleting submission');
    }
  };

  const handleApproveEnrollment = async (enrollmentId, studentName) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/enrollment/${enrollmentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`✅ Approved enrollment for ${studentName}`);
        fetchStudents(); // Refresh the students list
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to approve enrollment'}`);
      }
    } catch (err) {
      console.error('Error approving enrollment:', err);
      alert('❌ Error approving enrollment');
    }
  };

  const handleRejectEnrollment = async (enrollmentId, studentName) => {
    if (!window.confirm(`Are you sure you want to reject ${studentName}'s enrollment request?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/enrollment/${enrollmentId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`✅ Rejected enrollment for ${studentName}`);
        fetchStudents(); // Refresh the students list
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to reject enrollment'}`);
      }
    } catch (err) {
      console.error('Error rejecting enrollment:', err);
      alert('❌ Error rejecting enrollment');
    }
  };

  const handleRemoveStudent = async (studentId, studentName, enrollmentId) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this class? This will delete all their submissions!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`✅ Removed ${studentName} from the class`);
        fetchStudents();
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to remove student'}`);
      }
    } catch (err) {
      console.error('Error removing student:', err);
      alert('❌ Error removing student');
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm(`Are you sure you want to DELETE this entire class?\n\nThis will permanently delete:\n- All student enrollments\n- All submissions\n- All rubrics\n- The class itself\n\nThis action CANNOT be undone!`)) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm class deletion:');
    if (confirmText !== 'DELETE') {
      alert('Class deletion cancelled');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Class deleted successfully');
        navigate('/classes');
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to delete class'}`);
      }
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('❌ Error deleting class');
    }
  };

  const handleAssignmentUpload = async () => {
    if (!uploadFile) {
      alert('❌ Please select a file to upload');
      return;
    }

    if (!uploadTopic.trim()) {
      alert('❌ Please enter a topic/title for your assignment');
      return;
    }

    setUploadingAssignment(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('assignment_title', uploadTopic.trim());

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/upload-answer-script/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message || 'Assignment uploaded successfully'}`);
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTopic('');
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to upload assignment'}`);
      }
    } catch (err) {
      console.error('Error uploading assignment:', err);
      alert('❌ Error uploading assignment');
    } finally {
      setUploadingAssignment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Loading class details...</p>
      </div>
    );
  }

  const isLecturer = user && user.role === 'lecturer';
  const isStudent = user && user.role === 'student';
  const isDeadlinePassed = rubric && rubric.deadline && new Date(rubric.deadline) < new Date();

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
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.breadcrumb}>
              <span onClick={() => navigate('/classes')} style={styles.breadcrumbLink}>Classes</span>
              <span style={styles.breadcrumbSeparator}>›</span>
              <span style={styles.breadcrumbCurrent}>{classDetails?.class_name}</span>
            </div>
            <h1 style={styles.pageTitle}>📘 {classDetails?.class_name || 'Class Details'}</h1>
            <p style={styles.pageSubtitle}>Class Code: {classDetails?.class_code}</p>
          </div>
          {isLecturer && (
            <button
              onClick={handleDeleteClass}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(239,68,68,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
              }}
            >
              🗑️ Delete Class
            </button>
          )}
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Rubric Section - Lecturer Only */}
        {isLecturer && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📋 Class Rubric</h2>
              <div style={styles.buttonGroup}>
                {rubric && (
                  <>
                    <button
                      onClick={() => {
                        setShowRubricModal(true);
                        setRubricTitle(rubric.rubric_title || '');
                        setAssignmentTitle(rubric.assignment_title || '');
                        if (rubric.deadline) {
                          const date = new Date(rubric.deadline);
                          const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          setDeadline(localDateTime);
                        }
                      }}
                      style={styles.updateBtn}
                      onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
                      onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'}
                    >
                      ✏️ Update
                    </button>
                    <button
                      onClick={handleDeleteRubric}
                      style={styles.deleteBtn}
                      onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'}
                      onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowRubricModal(true)}
                  style={styles.uploadBtn}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                  }}
                >
                  📤 {rubric ? 'Replace Rubric' : 'Upload Rubric'}
                </button>
              </div>
            </div>

            {rubric ? (
              <div style={styles.rubricInfo}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Rubric Title:</span>
                    <span style={styles.infoValue}>{rubric.rubric_title}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Assignment:</span>
                    <span style={styles.infoValue}>{rubric.assignment_title || 'N/A'}</span>
                  </div>
                  {rubric.deadline && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>📅 Deadline:</span>
                      <span style={{ ...styles.infoValue, color: isDeadlinePassed ? '#dc2626' : '#059669' }}>
                        {new Date(rubric.deadline).toLocaleString()}
                        {isDeadlinePassed && <span style={{ marginLeft: '8px', fontSize: '0.85em' }}>⏰ Closed</span>}
                      </span>
                    </div>
                  )}
                  {rubric.created_at && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Uploaded:</span>
                      <span style={styles.infoValue}>{new Date(rubric.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <p style={styles.emptyText}>No rubric uploaded yet. Upload a rubric to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Enrolled Students Section - Lecturer Only */}
        {isLecturer && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>👥 Enrolled Students ({students.length})</h2>
            </div>

            {students.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👥</div>
                <p style={styles.emptyText}>No students enrolled yet</p>
              </div>
            ) : (
              <div style={styles.studentsGrid}>
                {students.map((student) => (
                  <div key={student.student_id} style={styles.studentCard}>
                    <div style={styles.studentHeader}>
                      <div style={styles.studentAvatar}>
                        {student.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.studentInfo}>
                        <h3 style={styles.studentName}>{student.student_name}</h3>
                        <p style={styles.studentEmail}>{student.student_email}</p>
                      </div>
                    </div>
                    <div style={styles.studentStats}>
                      <div style={styles.statItem}>
                        <span style={styles.statIcon}>📝</span>
                        <div>
                          <div style={styles.statValue}>{student.submission_count}</div>
                          <div style={styles.statLabel}>Submissions</div>
                        </div>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statIcon}>📅</span>
                        <div>
                          <div style={styles.statValue}>
                            {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div style={styles.statLabel}>Enrolled</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemoveStudent(student.student_id, student.student_name, student.enrollment_id)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                        }}
                      >
                        🗑️ Remove Student
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Students Section - Lecturer Only */}
        {isLecturer && pendingStudents.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>⏳ Pending Enrollment Requests ({pendingStudents.length})</h2>
            </div>

            <div style={styles.studentsGrid}>
              {pendingStudents.map((student) => (
                <div key={student.student_id} style={{ ...styles.studentCard, borderLeft: '4px solid #f59e0b' }}>
                  <div style={styles.studentHeader}>
                    <div style={{ ...styles.studentAvatar, background: '#fbbf24' }}>
                      {student.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.studentInfo}>
                      <h3 style={styles.studentName}>{student.student_name}</h3>
                      <p style={styles.studentEmail}>{student.student_email}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleApproveEnrollment(student.enrollment_id, student.student_name)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectEnrollment(student.enrollment_id, student.student_name)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{isLecturer ? '📝 Student Submissions' : '📝 My Submissions'}</h2>
            {isStudent && (
              <>
                {isDeadlinePassed ? (
                  <div style={{ textAlign: 'right' }}>
                    <button
                      disabled
                      style={styles.deadlinePassedBtn}
                      title="Deadline has passed"
                    >
                      ⏰ Deadline Passed
                    </button>
                    <div style={styles.deadlineWarning}>
                      Submissions closed on {new Date(rubric.deadline).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    style={styles.uploadBtn}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                    }}
                  >
                    <div>📤 Upload Assignment</div>
                    {rubric && rubric.deadline && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.9 }}>
                        Due: {new Date(rubric.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {submissions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <p style={styles.emptyText}>
                {isLecturer ? 'No student submissions yet' : 'You haven\'t submitted any assignments yet'}
              </p>
              {isStudent && !isDeadlinePassed && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  style={{ ...styles.uploadBtn, marginTop: '16px' }}
                >
                  📤 Upload Your First Assignment
                </button>
              )}
            </div>
          ) : (
            <div style={styles.submissionsList}>
              {submissions.map((submission) => (
                <div
                  key={submission.script_id}
                  style={styles.submissionCard}
                  onClick={() => navigate(`/class/${classId}/submission/${submission.script_id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={styles.submissionHeader}>
                    <div>
                      {isLecturer && <h3 style={styles.submissionTitle}>👤 {submission.student_name}</h3>}
                      {isStudent && <h3 style={styles.submissionTitle}>📄 Assignment Submission</h3>}
                      <p style={styles.submissionTopic}>{submission.topic || 'No topic specified'}</p>
                    </div>
                    <div style={styles.submissionDate}>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.submissionFooter}>
                    <div style={styles.scoreContainer}>
                      <span style={styles.scoreLabel}>
                        {submission.review_status === 'approved' && submission.final_score !== null && !isNaN(submission.final_score) ? 'Score:' : 'Status:'}
                      </span>
                      <span style={{
                        ...styles.scoreValue,
                        color: submission.review_status === 'approved' && submission.final_score !== null && !isNaN(submission.final_score)
                          ? (submission.final_score >= 70 ? '#059669' : submission.final_score >= 50 ? '#f59e0b' : '#dc2626')
                          : '#f59e0b'
                      }}>
                        {submission.review_status === 'approved' && submission.final_score !== null && !isNaN(submission.final_score)
                          ? `${Math.round(submission.final_score)}/100`
                          : submission.review_status === 'approved'
                            ? 'Approved'
                            : submission.evaluation
                              ? 'Evaluated'
                              : submission.review_status === 'pending'
                                ? 'Awaiting Review'
                                : 'Pending Evaluation'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isStudent && (
                        <button
                          style={styles.deleteSubmissionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubmission(submission.script_id);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                      <button
                        style={styles.viewDetailsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/class/${classId}/submission/${submission.script_id}`);
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rubric Upload Modal */}
      {showRubricModal && (
        <div className="modal-overlay" onClick={() => setShowRubricModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📋 {rubric ? 'Update' : 'Upload'} Rubric</h2>

            <div className="form-group">
              <label>Rubric Title:</label>
              <input
                type="text"
                value={rubricTitle}
                onChange={(e) => setRubricTitle(e.target.value)}
                placeholder="e.g., IoT Project Rubric"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Assignment Title:</label>
              <input
                type="text"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="e.g., Smart Home System Project"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Deadline:</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Select Rubric File:</label>
              <input
                type="file"
                onChange={(e) => setRubricFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={handleRubricUpload}
                disabled={uploadingRubric}
                className="submit-btn"
              >
                {uploadingRubric ? '⏳ Uploading...' : '✅ Upload'}
              </button>
              <button
                onClick={() => {
                  setShowRubricModal(false);
                  setRubricFile(null);
                  setRubricTitle('');
                  setAssignmentTitle('');
                  setDeadline('');
                }}
                className="cancel-btn"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📤 Upload Assignment</h2>

            <div className="form-group">
              <label>Assignment Topic/Title:</label>
              <input
                type="text"
                value={uploadTopic}
                onChange={(e) => setUploadTopic(e.target.value)}
                placeholder="e.g., Smart Home IoT System"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Select Your File:</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
                className="form-input"
              />
              {uploadFile && (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                  📎 {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {rubric && rubric.deadline && (
              <div style={{
                padding: '12px',
                background: 'rgba(34,197,94,0.1)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600' }}>
                  ⏰ Deadline: {new Date(rubric.deadline).toLocaleString()}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={handleAssignmentUpload}
                disabled={uploadingAssignment}
                className="submit-btn"
              >
                {uploadingAssignment ? '⏳ Uploading...' : '✅ Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadTopic('');
                }}
                className="cancel-btn"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Navigation
  navbar: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px',
  },
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
    color: '#94a3b8',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(14,165,233,0.2)',
    color: '#60a5fa',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  navIcon: {
    fontSize: '1.2rem',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  userRole: {
    fontSize: '1.5rem',
  },
  logoutBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
  },

  // Main Content
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  // Page Header
  pageHeader: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '0.9rem',
  },
  breadcrumbLink: {
    color: '#0ea5e9',
    cursor: 'pointer',
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    color: '#64748b',
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
    fontWeight: '500',
  },

  // Error Banner
  errorBanner: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#991b1b',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #fca5a5',
  },
  errorIcon: {
    fontSize: '1.5rem',
  },

  // Card
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },

  // Buttons
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  uploadBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  updateBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(251,191,36,0.3)',
  },
  deleteBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
  },
  deadlinePassedBtn: {
    padding: '12px 24px',
    background: '#e5e7eb',
    color: '#9ca3af',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  // Rubric Info
  rubricInfo: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#0f172a',
    fontWeight: '700',
  },

  // Deadline Warning
  deadlineWarning: {
    fontSize: '0.85rem',
    color: '#dc2626',
    marginTop: '8px',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },

  // Students Grid
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  studentCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  studentAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '900',
    flexShrink: 0,
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  studentEmail: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  studentStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '12px',
    borderRadius: '8px',
  },
  statIcon: {
    fontSize: '1.5rem',
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    marginTop: '4px',
  },

  // Submissions List
  submissionsList: {
    display: 'grid',
    gap: '16px',
  },
  submissionCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  submissionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  submissionTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  submissionTopic: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  submissionDate: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  submissionFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: '1.2rem',
    fontWeight: '900',
  },
  viewDetailsBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  deleteSubmissionBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
  },

  // Modal Styles (keep existing modal styles from CSS)
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
};

export default ClassDetailPage;
