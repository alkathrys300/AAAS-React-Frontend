import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function SubmissionsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'evaluated', 'pending'

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Redirect lecturers to classes page
        if (parsedUser.role === 'lecturer') {
            alert('This page is for students only. Redirecting to Classes page where you can view all student submissions.');
            navigate('/classes');
            return;
        }

        fetchSubmissions(token, parsedUser.user_id);
    }, [navigate]);

    const fetchSubmissions = async (token, userId) => {
        try {
            const response = await fetch(`${API_BASE}/student/submissions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const submissionsData = data.submissions || [];

                // Fetch feedback for each submission to get score and status
                const submissionsWithFeedback = await Promise.all(
                    submissionsData.map(async (sub) => {
                        try {
                            const feedbackRes = await fetch(
                                `${API_BASE}/assignment/${sub.script_id}/feedback`,
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
                                    evaluation: feedbackData.evaluation,
                                    review_status: feedbackData.review_status,
                                    final_score: feedbackData.final_score,
                                    can_delete: !feedbackData.evaluation // Can delete if not evaluated
                                };
                            } else if (feedbackRes.status === 403) {
                                // Pending evaluation
                                return {
                                    ...sub,
                                    evaluation: null,
                                    review_status: 'pending',
                                    final_score: null,
                                    can_delete: true
                                };
                            } else {
                                return {
                                    ...sub,
                                    evaluation: null,
                                    review_status: 'pending',
                                    final_score: null,
                                    can_delete: true
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching feedback for ${sub.script_id}:`, err);
                            return {
                                ...sub,
                                evaluation: null,
                                review_status: 'pending',
                                final_score: null,
                                can_delete: true
                            };
                        }
                    })
                );

                setSubmissions(submissionsWithFeedback);
            } else {
                console.error('Failed to fetch submissions');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching submissions:', error);
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

    const handleDelete = async (scriptId) => {
        if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/assignment/${scriptId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh submissions list
                fetchSubmissions(token, user.user_id);
                alert('Submission deleted successfully');
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to delete submission');
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Failed to delete submission. Please try again.');
        }
    };

    const handleResubmit = (submission) => {
        // Navigate to assignment upload page
        navigate(`/class/${submission.class_id}/assignment/${submission.script_id}`);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f3f4f6',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            background: '#2c3e50',
            borderBottom: '1px solid #34495e'
        },
        logo: {
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        nav: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        },
        navLink: {
            padding: '8px 16px',
            background: '#34495e',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            border: '1px solid transparent'
        },
        navLinkActive: {
            background: '#3498db',
            border: '1px solid #2980b9'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        userName: {
            color: 'white',
            fontWeight: '500'
        },
        logoutButton: {
            padding: '8px 16px',
            background: '#e74c3c',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        main: {
            padding: '30px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px'
        },
        subtitle: {
            fontSize: '1rem',
            color: '#7f8c8d',
            marginBottom: '25px'
        },
        filterTabs: {
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            padding: '5px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        filterTab: {
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#7f8c8d',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        activeFilterTab: {
            background: '#3498db',
            color: 'white',
            boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
        },
        submissionsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        submissionCard: {
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
        },
        submissionInfo: {
            flex: 1
        },
        submissionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '6px'
        },
        className: {
            fontSize: '0.95rem',
            color: '#7f8c8d',
            marginBottom: '6px'
        },
        submissionMeta: {
            fontSize: '0.85rem',
            color: '#95a5a6',
            display: 'flex',
            gap: '15px'
        },
        statusBadge: {
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'inline-block'
        },
        statusEvaluated: {
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
        },
        statusPending: {
            background: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7'
        },
        score: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#27ae60',
            marginLeft: '20px'
        },
        actionButtons: {
            display: 'flex',
            gap: '8px',
            marginLeft: '15px'
        },
        deleteButton: {
            padding: '8px 16px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        resubmitButton: {
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        loading: {
            color: '#2c3e50',
            fontSize: '1.2rem',
            textAlign: 'center',
            padding: '40px'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading submissions...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/userpage')}>
                    AAAS
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}>
                        Home
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}>
                        Classes
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/analytics')}>
                        Analytics
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/contact')}>
                        Contact
                    </div>
                </nav>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>{user?.name}</span>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <h1 style={styles.title}>My Submissions</h1>
                <p style={styles.subtitle}>View all your assignment submissions and their status</p>

                {/* Filter Tabs */}
                <div style={styles.filterTabs}>
                    <button
                        style={{
                            ...styles.filterTab,
                            ...(filter === 'all' ? styles.activeFilterTab : {})
                        }}
                        onClick={() => setFilter('all')}
                    >
                        All ({submissions.length})
                    </button>
                    <button
                        style={{
                            ...styles.filterTab,
                            ...(filter === 'evaluated' ? styles.activeFilterTab : {})
                        }}
                        onClick={() => setFilter('evaluated')}
                    >
                        Graded ({submissions.filter(s => s.review_status === 'approved').length})
                    </button>
                    <button
                        style={{
                            ...styles.filterTab,
                            ...(filter === 'pending' ? styles.activeFilterTab : {})
                        }}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({submissions.filter(s => s.review_status !== 'approved').length})
                    </button>
                </div>

                <div style={styles.submissionsList}>
                    {submissions
                        .filter(submission => {
                            if (filter === 'all') return true;
                            if (filter === 'evaluated') return submission.review_status === 'approved';
                            if (filter === 'pending') return submission.review_status !== 'approved';
                            return true;
                        })
                        .map((submission) => {
                            // Determine display status and score
                            let displayStatus = 'Pending Evaluation';
                            let displayScore = null;
                            let statusStyle = styles.statusPending;

                            if (submission.review_status === 'approved') {
                                displayStatus = 'Graded';
                                displayScore = submission.final_score;
                                statusStyle = styles.statusEvaluated;
                            } else if (submission.review_status === 'pending') {
                                displayStatus = 'Awaiting Review';
                                statusStyle = styles.statusPending;
                            } else if (submission.evaluation) {
                                displayStatus = 'Under Review';
                                statusStyle = styles.statusPending;
                            }

                            return (
                                <div
                                    key={submission.script_id}
                                    style={styles.submissionCard}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
                                >
                                    <div style={styles.submissionInfo}>
                                        <div style={styles.submissionTitle}>{submission.assignment_title}</div>
                                        <div style={styles.className}>{submission.class_name}</div>
                                        <div style={styles.submissionMeta}>
                                            <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            ...styles.statusBadge,
                                            ...statusStyle
                                        }}>
                                            {displayStatus}
                                        </div>

                                        {/* Show score only if approved */}
                                        {displayScore !== null && (
                                            <div style={styles.score}>{Math.round(displayScore)}%</div>
                                        )}

                                        {/* View Details Button */}
                                        <button
                                            style={{
                                                ...styles.resubmitButton,
                                                background: '#16a085'
                                            }}
                                            onClick={() => navigate(`/class/${submission.class_id}/assignment/${submission.script_id}`)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#138d75'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#16a085'}
                                        >
                                            View Details
                                        </button>

                                        {/* Action buttons - only show if student can delete */}
                                        {submission.can_delete && (
                                            <div style={styles.actionButtons}>
                                                <button
                                                    style={styles.deleteButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(submission.script_id);
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
                                                    title="Delete this submission"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </main>
        </div>
    );
}
