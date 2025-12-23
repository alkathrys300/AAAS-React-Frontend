import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Analytics() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalSubmissions: 0,
        totalClasses: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPlagiarismChecks: 0,
        totalGrammarCorrections: 0,
        monthlyProgress: [],
        recentScores: [],
        performanceByClass: []
    });
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

        // Fetch analytics data
        fetchAnalytics(token, parsedUser.user_id);
    }, [navigate]);

    const fetchAnalytics = async (token, userId) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const userRole = userData?.role;

            if (userRole === 'lecturer') {
                // Fetch lecturer's classes and their statistics
                const classesResponse = await fetch(`${API_BASE}/classes/my-classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (classesResponse.ok) {
                    const classesData = await classesResponse.json();
                    const classes = classesData.classes || [];

                    let totalStudents = 0;
                    let totalSubmissions = 0;
                    let totalPending = 0;
                    const classSummary = [];

                    for (const cls of classes) {
                        totalStudents += cls.student_count || 0;
                        totalPending += cls.pending_enrollments || 0;

                        // Fetch submissions for each class
                        try {
                            const assignmentsResponse = await fetch(`${API_BASE}/class/${cls.class_id}/assignments/`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (assignmentsResponse.ok) {
                                const assignmentsData = await assignmentsResponse.json();
                                const submissions = assignmentsData.submissions || [];
                                totalSubmissions += submissions.length;

                                classSummary.push({
                                    class: cls.class_name,
                                    students: cls.student_count || 0,
                                    submissions: submissions.length,
                                    pending: cls.pending_enrollments || 0
                                });
                            }
                        } catch (err) {
                            console.error(`Error fetching submissions for class ${cls.class_id}:`, err);
                        }
                    }

                    setAnalytics({
                        totalClasses: classes.length,
                        totalStudents: totalStudents,
                        totalSubmissions: totalSubmissions,
                        pendingEnrollments: totalPending,
                        evaluatedSubmissions: totalSubmissions, // Assuming all are evaluated
                        unreadNotifications: totalPending,
                        classSummary: classSummary,
                        role: 'lecturer'
                    });
                }
            } else {
                // Student analytics - fetch enrolled classes and submissions
                const classesResponse = await fetch(`${API_BASE}/classes/enrolled`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (classesResponse.ok) {
                    const classesData = await classesResponse.json();
                    const classes = classesData.classes || [];

                    let totalSubmissions = 0;
                    let evaluatedSubmissions = 0;
                    const recentScores = [];
                    const performanceByClass = [];
                    const monthlyProgress = {};

                    for (const cls of classes) {
                        try {
                            const assignmentsResponse = await fetch(`${API_BASE}/class/${cls.class_id}/assignments/`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (assignmentsResponse.ok) {
                                const assignmentsData = await assignmentsResponse.json();
                                const submissions = assignmentsData.submissions || [];
                                totalSubmissions += submissions.length;

                                // Group by month
                                submissions.forEach(sub => {
                                    const date = new Date(sub.submitted_at);
                                    const monthKey = date.toLocaleString('default', { month: 'short' });
                                    monthlyProgress[monthKey] = (monthlyProgress[monthKey] || 0) + 1;
                                });

                                // Get scores for performance tracking
                                for (const sub of submissions) {
                                    try {
                                        const feedbackResponse = await fetch(`${API_BASE}/assignment/${sub.script_id}/feedback?class_id=${cls.class_id}`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });

                                        if (feedbackResponse.ok) {
                                            const feedback = await feedbackResponse.json();
                                            if (feedback.score !== undefined) {
                                                evaluatedSubmissions++;
                                                recentScores.push({
                                                    assignment: sub.assignment_title || 'Assignment',
                                                    score: feedback.score,
                                                    date: new Date(sub.submitted_at).toLocaleDateString(),
                                                    class: cls.class_name
                                                });
                                            }
                                        }
                                    } catch (err) {
                                        console.error('Error fetching feedback:', err);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error(`Error fetching submissions for class ${cls.class_id}:`, err);
                        }
                    }

                    // Calculate monthly progress
                    const months = ['Sep', 'Oct', 'Nov', 'Dec'];
                    const monthlyData = months.map(month => ({
                        month,
                        assignments: monthlyProgress[month] || 0
                    }));

                    // Calculate performance by class
                    const classPerformance = classes.map(cls => {
                        const classScores = recentScores.filter(s => s.class === cls.class_name);
                        const avgScore = classScores.length > 0
                            ? Math.round(classScores.reduce((acc, s) => acc + s.score, 0) / classScores.length)
                            : 0;
                        return {
                            class: cls.class_name,
                            submissions: classScores.length,
                            avgScore: avgScore
                        };
                    });

                    setAnalytics({
                        totalClasses: classes.length,
                        totalSubmissions: totalSubmissions,
                        evaluatedSubmissions: evaluatedSubmissions,
                        pendingReview: totalSubmissions - evaluatedSubmissions,
                        feedbackReceived: evaluatedSubmissions,
                        unreadNotifications: 0,
                        monthlyProgress: monthlyData,
                        recentScores: recentScores.slice(-3).reverse(),
                        performanceByClass: classPerformance,
                        role: 'student'
                    });
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleCardClick = (cardType) => {
        switch (cardType) {
            case 'classes':
                navigate('/classes');
                break;
            case 'submissions':
                navigate('/submissions');
                break;
            case 'evaluated':
                navigate('/submissions');
                break;
            case 'pending':
                navigate('/submissions');
                break;
            case 'feedback':
                navigate('/submissions');
                break;
            case 'notifications':
                navigate('/notifications');
                break;
            default:
                break;
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        nav: {
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        navLinkActive: {
            background: 'rgba(255,255,255,0.2)',
            fontWeight: '600'
        },
        userMenu: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            background: 'rgba(255,255,255,0.1)',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer'
        },
        main: {
            padding: '40px',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        pageTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '10px',
            textAlign: 'center'
        },
        pageSubtitle: {
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '40px',
            textAlign: 'center'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
        },
        statCard: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
        },
        statIcon: {
            fontSize: '2.5rem',
            marginBottom: '15px'
        },
        statValue: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '5px'
        },
        statLabel: {
            fontSize: '0.95rem',
            color: '#6b7280',
            fontWeight: '500'
        },
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginBottom: '40px'
        },
        card: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        cardTitle: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        progressBar: {
            height: '30px',
            background: '#e5e7eb',
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '15px'
        },
        progressFill: {
            height: '100%',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '15px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'width 0.5s ease'
        },
        monthBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
        },
        monthLabel: {
            minWidth: '50px',
            fontWeight: '600',
            color: '#4b5563'
        },
        scoreList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        scoreItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        },
        scoreInfo: {
            flex: 1
        },
        scoreName: {
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px'
        },
        scoreDate: {
            fontSize: '0.85rem',
            color: '#6b7280'
        },
        scoreBadge: {
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1.1rem'
        },
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1.2rem'
        },
        spinner: {
            fontSize: '4rem',
            animation: 'spin 2s linear infinite'
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return { bg: '#d1fae5', color: '#065f46' };
        if (score >= 80) return { bg: '#dbeafe', color: '#1e40af' };
        if (score >= 70) return { bg: '#fef3c7', color: '#92400e' };
        return { bg: '#fee2e2', color: '#991b1b' };
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}>📊</div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/userpage')}>
                    <span>🤖</span>
                    AAAS
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}>
                        🏠 Home
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}>
                        📚 Classes
                    </div>
                    <div style={{ ...styles.navLink, ...styles.navLinkActive }}>
                        📊 Analytics
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/contact')}>
                        📞 Contact
                    </div>
                </nav>
                <div style={styles.userMenu} onClick={handleLogout}>
                    <span>👤</span>
                    <span>{user?.name}</span>
                    <span style={{ fontSize: '0.8rem' }}>Logout</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <h1 style={styles.pageTitle}>📊 {analytics.role === 'lecturer' ? 'Teaching Analytics' : 'My Performance Analytics'}</h1>
                <p style={styles.pageSubtitle}>
                    {analytics.role === 'lecturer'
                        ? `Overview of your classes and student performance`
                        : `Your personal academic progress for ${user?.name}`}
                </p>

                {/* Stats Overview */}
                {analytics.role === 'lecturer' ? (
                    <div style={styles.statsGrid}>
                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('classes')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>📚</div>
                            <div style={styles.statValue}>{analytics.totalClasses}</div>
                            <div style={styles.statLabel}>My Classes</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('students')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>👥</div>
                            <div style={styles.statValue}>{analytics.totalStudents}</div>
                            <div style={styles.statLabel}>Total Students</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('submissions')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>📝</div>
                            <div style={styles.statValue}>{analytics.totalSubmissions}</div>
                            <div style={styles.statLabel}>Total Submissions</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('pending')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>⏳</div>
                            <div style={styles.statValue}>{analytics.pendingEnrollments}</div>
                            <div style={styles.statLabel}>Pending Enrollments</div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.statsGrid}>
                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('classes')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>📚</div>
                            <div style={styles.statValue}>{analytics.totalClasses}</div>
                            <div style={styles.statLabel}>Enrolled Classes</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('submissions')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>📝</div>
                            <div style={styles.statValue}>{analytics.totalSubmissions}</div>
                            <div style={styles.statLabel}>Total Submissions</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('evaluated')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>✅</div>
                            <div style={styles.statValue}>{analytics.evaluatedSubmissions}</div>
                            <div style={styles.statLabel}>Evaluated</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('pending')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>⏳</div>
                            <div style={styles.statValue}>{analytics.pendingReview}</div>
                            <div style={styles.statLabel}>Pending Review</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('feedback')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>💬</div>
                            <div style={styles.statValue}>{analytics.feedbackReceived}</div>
                            <div style={styles.statLabel}>Feedback Received</div>
                        </div>

                        <div
                            style={styles.statCard}
                            onClick={() => handleCardClick('notifications')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={styles.statIcon}>🔔</div>
                            <div style={styles.statValue}>{analytics.unreadNotifications}</div>
                            <div style={styles.statLabel}>Notifications</div>
                        </div>
                    </div>
                )}

                {/* Charts Section - Different for lecturer vs student */}
                {analytics.role === 'lecturer' ? (
                    /* Lecturer View - Class Summary */
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <span>📊</span> Class Summary
                        </h3>
                        {analytics.classSummary && analytics.classSummary.length > 0 ? (
                            analytics.classSummary.map((data, index) => (
                                <div key={index} style={{ marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.1rem' }}>{data.class}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                            {data.students} students • {data.submissions} submissions
                                            {data.pending > 0 && <span style={{ color: '#f59e0b', fontWeight: '600' }}> • {data.pending} pending</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{data.students}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Students</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{data.submissions}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Submissions</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{data.pending}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Pending</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No classes yet</p>
                        )}
                    </div>
                ) : (
                    /* Student View - Charts */
                    <div style={styles.chartsGrid}>
                        {/* Monthly Progress */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                <span>📈</span> My Monthly Submissions
                            </h3>
                            {analytics.monthlyProgress && analytics.monthlyProgress.length > 0 ? (
                                analytics.monthlyProgress.map((data, index) => {
                                    const maxAssignments = Math.max(...analytics.monthlyProgress.map(d => d.assignments), 1);
                                    const percentage = (data.assignments / maxAssignments) * 100;
                                    return (
                                        <div key={index} style={styles.monthBar}>
                                            <div style={styles.monthLabel}>{data.month}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.progressBar}>
                                                    <div style={{ ...styles.progressFill, width: `${percentage}%` }}>
                                                        {data.assignments} assignment{data.assignments !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center', color: '#6b7280' }}>No submissions yet</p>
                            )}
                        </div>

                        {/* Recent Scores */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                <span>🎯</span> My Recent Scores
                            </h3>
                            {analytics.recentScores && analytics.recentScores.length > 0 ? (
                                <div style={styles.scoreList}>
                                    {analytics.recentScores.map((item, index) => {
                                        const colors = getScoreColor(item.score);
                                        return (
                                            <div key={index} style={styles.scoreItem}>
                                                <div style={styles.scoreInfo}>
                                                    <div style={styles.scoreName}>{item.assignment}</div>
                                                    <div style={styles.scoreDate}>
                                                        {item.class} • {item.date}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    ...styles.scoreBadge,
                                                    background: colors.bg,
                                                    color: colors.color
                                                }}>
                                                    {item.score}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#6b7280' }}>No scores available yet</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Performance by Class - Only for students */}
                {analytics.role === 'student' && analytics.performanceByClass && analytics.performanceByClass.length > 0 && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <span>📚</span> My Performance by Class
                        </h3>
                        {analytics.performanceByClass.map((data, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{data.class}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                        {data.submissions} submission{data.submissions !== 1 ? 's' : ''} • Avg: {data.avgScore}%
                                    </div>
                                </div>
                                <div style={styles.progressBar}>
                                    <div style={{ ...styles.progressFill, width: `${data.avgScore}%` }}>
                                        {data.avgScore}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
