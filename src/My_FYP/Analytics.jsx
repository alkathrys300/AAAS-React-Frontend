import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
    fetchAnalytics(token, parsedUser.user_id, parsedUser.role);
  }, [navigate]);

  const fetchAnalytics = async (token, userId, role) => {
    setLoading(true);
    try {
      if (role === 'student') {
        // Fetch enrolled classes
        const classesRes = await fetch(`${API_BASE}/classes/enrolled`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch submissions data
        const submissionsRes = await fetch(`${API_BASE}/student/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        let enrolledClasses = [];
        let submissions = [];
        let evaluated = 0;
        let pending = 0;
        let feedbackReceived = 0;
        let totalScore = 0;
        let scoredSubmissions = 0;

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          enrolledClasses = classesData.classes || [];
        }

        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          submissions = submissionsData.submissions || [];

          // Fetch feedback for each submission to get accurate stats
          for (const sub of submissions) {
            try {
              const feedbackRes = await fetch(`${API_BASE}/assignment/${sub.script_id}/feedback`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (feedbackRes.ok) {
                const feedbackData = await feedbackRes.json();

                // Update submission with feedback data
                sub.score = feedbackData.score;
                sub.review_status = feedbackData.review_status;
                sub.has_feedback = feedbackData.review_status === 'approved';

                // Count evaluated (has evaluation, approved or not)
                if (feedbackData.evaluation_id) {
                  evaluated++;
                }

                // Count approved feedback
                if (feedbackData.review_status === 'approved') {
                  feedbackReceived++;
                }

                // Count pending review
                if (feedbackData.review_status === 'pending' || !feedbackData.evaluation_id) {
                  pending++;
                }

                // Calculate average score from approved feedback with scores
                if (feedbackData.score !== null && feedbackData.score !== undefined) {
                  totalScore += feedbackData.score;
                  scoredSubmissions++;
                }
              } else if (feedbackRes.status === 403) {
                // Pending review
                pending++;
                sub.review_status = 'pending';
                sub.has_feedback = false;
              }
            } catch (err) {
              console.error(`Error fetching feedback for submission ${sub.script_id}:`, err);
              pending++;
            }
          }
        }

        // Calculate average score
        const avgScore = scoredSubmissions > 0
          ? Math.round(totalScore / scoredSubmissions)
          : 0;

        const analyticsData = {
          role: 'student',
          enrolled_classes: enrolledClasses.filter(c => c.enrollment_status === 'approved').length,
          total_submissions: submissions.length,
          evaluated: evaluated,
          pending_review: pending,
          feedback_received: feedbackReceived,
          avg_score: avgScore,
          notifications: 0,
          classes: enrolledClasses,
          submissions: submissions,
          recent_submissions: submissions.slice(-5).reverse() // Last 5 submissions
        };

        setAnalytics(analyticsData);
      } else if (role === 'lecturer') {
        const classesRes = await fetch(`${API_BASE}/classes/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          const myClasses = classesData.classes || [];

          let totalAssignments = 0;
          let evaluated = 0;
          let pending = 0;
          let feedbackGiven = 0;
          let totalStudents = 0;

          // Fetch submissions for each class
          for (const cls of myClasses) {
            totalStudents += cls.student_count || 0;

            try {
              const submissionsRes = await fetch(`${API_BASE}/class/${cls.class_id}/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (submissionsRes.ok) {
                const submissionsData = await submissionsRes.json();
                const submissions = submissionsData.submissions || [];
                totalAssignments += submissions.length;

                // Check each submission's feedback status
                for (const sub of submissions) {
                  try {
                    const feedbackRes = await fetch(`${API_BASE}/assignment/${sub.script_id}/feedback`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (feedbackRes.ok) {
                      const feedbackData = await feedbackRes.json();

                      // Count evaluated (has evaluation)
                      if (feedbackData.evaluation_id) {
                        evaluated++;
                      }

                      // Count pending review
                      if (feedbackData.review_status === 'pending' || !feedbackData.evaluation_id) {
                        pending++;
                      }

                      // Count approved feedback
                      if (feedbackData.review_status === 'approved') {
                        feedbackGiven++;
                      }
                    } else {
                      // No feedback yet - pending
                      pending++;
                    }
                  } catch (err) {
                    console.error(`Error fetching feedback for submission ${sub.script_id}:`, err);
                    pending++;
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching submissions for class ${cls.class_id}:`, err);
            }
          }

          const avgClassSize = myClasses.length > 0 ? Math.round(totalStudents / myClasses.length) : 0;

          setAnalytics({
            role: 'lecturer',
            total_classes: myClasses.length,
            total_assignments: totalAssignments,
            graded: evaluated,
            pending: pending,
            feedback_given: feedbackGiven,
            pending_enrollments: myClasses.reduce((sum, c) => sum + (c.pending_enrollments || 0), 0),
            total_students: totalStudents,
            avg_class_size: avgClassSize,
            classes: myClasses
          });
        } else {
          setAnalytics({ role: 'lecturer', total_classes: 0, classes: [] });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({ role, enrolled_classes: 0, total_submissions: 0, classes: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to home page with replace
    navigate('/', { replace: true });
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
              style={styles.navLink}
              onMouseEnter={(e) => e.target.style.background = 'rgba(14,165,233,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={styles.navIcon}>📚</span>
              <span>Classes</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              style={styles.navLinkActive}
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
            <h1 style={styles.pageTitle}>📊 My Performance Analytics</h1>
            <p style={styles.pageSubtitle}>
              Your personal academic progress for {user.name}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📚</div>
                <div style={styles.statNumber}>
                  {analytics.role === 'lecturer'
                    ? (analytics.total_classes || 0)
                    : (analytics.enrolled_classes || 0)}
                </div>
                <div style={styles.statLabel}>
                  {analytics.role === 'lecturer' ? 'Total Classes' : 'Enrolled Classes'}
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>📝</div>
                <div style={styles.statNumber}>
                  {analytics.role === 'lecturer'
                    ? (analytics.total_assignments || 0)
                    : (analytics.total_submissions || 0)}
                </div>
                <div style={styles.statLabel}>
                  {analytics.role === 'lecturer' ? 'Total Assignments' : 'Total Submissions'}
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statNumber}>
                  {analytics.role === 'lecturer'
                    ? (analytics.graded || 0)
                    : (analytics.evaluated || 0)}
                </div>
                <div style={styles.statLabel}>Evaluated</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>⏳</div>
                <div style={styles.statNumber}>
                  {analytics.role === 'lecturer'
                    ? (analytics.pending || 0)
                    : (analytics.pending_review || 0)}
                </div>
                <div style={styles.statLabel}>Pending Review</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>💬</div>
                <div style={styles.statNumber}>
                  {analytics.role === 'lecturer'
                    ? (analytics.feedback_given || 0)
                    : (analytics.feedback_received || 0)}
                </div>
                <div style={styles.statLabel}>
                  {analytics.role === 'lecturer' ? 'Feedback Given' : 'Feedback Received'}
                </div>
              </div>

              {analytics.role === 'lecturer' && (
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🔔</div>
                  <div style={styles.statNumber}>{analytics.pending_enrollments || 0}</div>
                  <div style={styles.statLabel}>Pending Enrollments</div>
                </div>
              )}

              {analytics.role === 'student' && (
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🔔</div>
                  <div style={styles.statNumber}>0</div>
                  <div style={styles.statLabel}>Notifications</div>
                </div>
              )}
            </div>

            {/* Additional Content */}
            {analytics.role === 'student' && (
              <div style={styles.additionalContent}>
                {/* Performance Chart Placeholder */}
                <div style={styles.performanceCard}>
                  <h3 style={styles.cardTitle}>📈 Performance Overview</h3>
                  <p style={styles.cardText}>
                    Your academic performance has been {analytics.avg_score > 75 ? 'excellent' : 'good'}!
                    Keep up the great work.
                  </p>
                  {analytics.avg_score !== undefined && (
                    <div style={styles.scoreDisplay}>
                      <div style={styles.scoreCircle}>
                        <div style={styles.scoreNumber}>{analytics.avg_score}%</div>
                        <div style={styles.scoreLabel}>Average Score</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                {analytics.recent_submissions && analytics.recent_submissions.length > 0 && (
                  <div style={styles.activityCard}>
                    <h3 style={styles.cardTitle}>📋 Recent Submissions</h3>
                    <div style={styles.activityList}>
                      {analytics.recent_submissions.map((sub, idx) => (
                        <div key={idx} style={styles.activityItem}>
                          <div style={styles.activityIcon}>📄</div>
                          <div style={styles.activityContent}>
                            <div style={styles.activityTitle}>{sub.class_name || 'Unknown Class'}</div>
                            <div style={styles.activityTime}>
                              {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div style={styles.activityScore}>
                            {sub.score !== null && sub.score !== undefined ? `${Math.round(sub.score)}%` :
                              sub.review_status === 'pending' ? 'Pending' : 'Not Graded'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analytics.role === 'lecturer' && (
              <div style={styles.additionalContent}>
                {/* Class Summary */}
                <div style={styles.performanceCard}>
                  <h3 style={styles.cardTitle}>📊 Class Summary</h3>
                  <p style={styles.cardText}>
                    You're teaching {analytics.total_classes || 0} classes with{' '}
                    {analytics.total_students || 0} students. Great job!
                  </p>
                  <div style={styles.summaryStats}>
                    <div style={styles.summaryItem}>
                      <div style={styles.summaryNumber}>{analytics.total_students || 0}</div>
                      <div style={styles.summaryLabel}>Total Students</div>
                    </div>
                    <div style={styles.summaryItem}>
                      <div style={styles.summaryNumber}>{analytics.avg_class_size || 0}</div>
                      <div style={styles.summaryLabel}>Avg Class Size</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <h3 style={styles.emptyTitle}>No data available</h3>
            <p style={styles.emptyText}>Start submitting assignments to see your analytics</p>
          </div>
        )}
      </div>
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

  // Page Header
  pageHeader: {
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

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#64748b',
    fontWeight: '600',
  },

  // Additional Content
  additionalContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  performanceCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  cardText: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  scoreDisplay: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0',
  },
  scoreCircle: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '8px solid #0ea5e9',
  },
  scoreNumber: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0ea5e9',
  },
  scoreLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },

  // Summary Stats
  summaryStats: {
    display: 'flex',
    gap: '32px',
    justifyContent: 'center',
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#0ea5e9',
    marginBottom: '8px',
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },

  // Activity Card
  activityCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  activityIcon: {
    fontSize: '2rem',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '4px',
  },
  activityTime: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  activityScore: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0ea5e9',
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

  // Empty State
  emptyState: {
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
};
