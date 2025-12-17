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
        fetchSubmissions(token, parsedUser.user_id);
    }, [navigate]);

    const fetchSubmissions = async (token, userId) => {
        try {
            // Simulate API call - replace with real endpoint
            setTimeout(() => {
                setSubmissions([
                    {
                        script_id: 1,
                        class_name: 'Introduction to Programming',
                        assignment_title: 'Assignment 1',
                        submitted_at: '2025-12-01',
                        status: 'evaluated',
                        score: 88
                    },
                    {
                        script_id: 2,
                        class_name: 'English Literature',
                        assignment_title: 'Midterm Essay',
                        submitted_at: '2025-11-20',
                        status: 'evaluated',
                        score: 85
                    },
                    {
                        script_id: 3,
                        class_name: 'Physics 101',
                        assignment_title: 'Lab Report 2',
                        submitted_at: '2025-11-15',
                        status: 'evaluated',
                        score: 90
                    },
                    {
                        script_id: 4,
                        class_name: 'Introduction to Programming',
                        assignment_title: 'Assignment 2',
                        submitted_at: '2025-12-02',
                        status: 'pending',
                        score: null
                    }
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
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
            gap: '15px',
            alignItems: 'center'
        },
        navLink: {
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
        },
        navLinkActive: {
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
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
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        main: {
            padding: '40px',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '30px'
        },
        filterTabs: {
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            background: 'rgba(255,255,255,0.1)',
            padding: '10px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
        },
        filterTab: {
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        activeFilterTab: {
            background: 'rgba(255,255,255,0.95)',
            color: '#667eea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        submissionsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        submissionCard: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
        },
        submissionInfo: {
            flex: 1
        },
        submissionTitle: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
        },
        className: {
            fontSize: '1rem',
            color: '#6b7280',
            marginBottom: '8px'
        },
        submissionMeta: {
            fontSize: '0.9rem',
            color: '#9ca3af',
            display: 'flex',
            gap: '20px'
        },
        statusBadge: {
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        statusEvaluated: {
            background: '#d1fae5',
            color: '#065f46'
        },
        statusPending: {
            background: '#fef3c7',
            color: '#92400e'
        },
        score: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginLeft: '30px'
        },
        loading: {
            color: 'white',
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
                    📚 AAAS
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}>
                        🏠 Home
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}>
                        📚 Classes
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/analytics')}>
                        📊 Analytics
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/contact')}>
                        📞 Contact
                    </div>
                </nav>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>👤 {user?.name}</span>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <h1 style={styles.title}>
                    📝 My Submissions
                </h1>
                <p style={styles.subtitle}>
                    View all your assignment submissions and their status
                </p>

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
                        ✅ Evaluated ({submissions.filter(s => s.status === 'evaluated').length})
                    </button>
                    <button
                        style={{
                            ...styles.filterTab,
                            ...(filter === 'pending' ? styles.activeFilterTab : {})
                        }}
                        onClick={() => setFilter('pending')}
                    >
                        ⏳ Pending ({submissions.filter(s => s.status === 'pending').length})
                    </button>
                </div>

                <div style={styles.submissionsList}>
                    {submissions
                        .filter(submission => {
                            if (filter === 'all') return true;
                            return submission.status === filter;
                        })
                        .map((submission) => (
                            <div
                                key={submission.script_id}
                                style={styles.submissionCard}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={styles.submissionInfo}>
                                    <div style={styles.submissionTitle}>{submission.assignment_title}</div>
                                    <div style={styles.className}>📚 {submission.class_name}</div>
                                    <div style={styles.submissionMeta}>
                                        <span>📅 Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{
                                        ...styles.statusBadge,
                                        ...(submission.status === 'evaluated' ? styles.statusEvaluated : styles.statusPending)
                                    }}>
                                        {submission.status === 'evaluated' ? '✅ Evaluated' : '⏳ Pending Review'}
                                    </div>
                                    {submission.score !== null && (
                                        <div style={styles.score}>{submission.score}%</div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}
