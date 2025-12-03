import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function UserPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [stats, setStats] = useState({ totalUploads: 0, avgScore: 0, completedTasks: 0 });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch real user stats from backend
        fetchUserStats(token, parsedUser.user_id);
    }, [navigate]);

    const fetchUserStats = async (token, userId) => {
        try {
            const response = await fetch(`${API_BASE}/user/${userId}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setRecentActivities(data.recent_activities || []);
            }
        } catch (error) {
            console.log('Could not fetch stats:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1.2rem'
        }}>
            Loading...
        </div>
    );

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
            fontWeight: 'bold'
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
            cursor: 'pointer',
            position: 'relative'
        },
        navLinkHover: {
            background: 'rgba(255,255,255,0.2)',
            transform: 'translateY(-2px)'
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
            maxWidth: '1200px',
            margin: '0 auto'
        },
        welcome: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        welcomeTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px'
        },
        welcomeSubtitle: {
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '20px'
        },
        rolebadge: {
            display: 'inline-block',
            padding: '6px 16px',
            background: user?.role === 'lecturer' ? '#10b981' : '#3b82f6',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        dashboard: {
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '30px',
            marginTop: '40px'
        },
        card: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
        },
        welcomeCard: {
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
        },
        welcomeIcon: {
            fontSize: '4rem',
            marginBottom: '20px'
        },
        welcomeText: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '10px'
        },
        welcomeDescription: {
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '20px'
        },
        classesButton: {
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        statCard: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '4px'
        },
        statLabel: {
            fontSize: '0.9rem',
            opacity: 0.9
        },
        activityItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            borderBottom: '1px solid #f3f4f6'
        },
        activityIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            upload: { icon: '📤', bg: '#3b82f6' },
            check: { icon: '✅', bg: '#10b981' },
            feedback: { icon: '💬', bg: '#f59e0b' }
        };
        return icons[type] || icons.upload;
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo}>
                    <span>🤖</span>
                    AAAS
                </div>
                <nav style={styles.nav}>
                    <div
                        style={styles.navLink}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        🏠 Home
                    </div>
                    <div
                        style={styles.navLink}
                        onClick={() => navigate('/classes')}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        📚 Classes
                    </div>
                    <div
                        style={styles.navLink}
                        onClick={() => navigate('/analytics')}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        📊 Analytics
                    </div>
                    <div
                        style={styles.navLink}
                        onClick={() => navigate('/contact')}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        📞 Contact
                    </div>
                </nav>
                <div style={styles.userMenu} onClick={handleLogout}>
                    <span>👤</span>
                    <span>{user.name}</span>
                    <span style={{ fontSize: '0.8rem' }}>Logout</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.welcome}>
                    <h1 style={styles.welcomeTitle}>Welcome, {user.name}! 👋</h1>
                    <p style={styles.welcomeSubtitle}>Ready to enhance your academic journey?</p>
                    <span style={styles.rolebadge}>
                        {user.role === 'lecturer' ? '👨‍🏫 Lecturer' : '🎓 Student'}
                    </span>
                </div>

                <div style={styles.dashboard}>
                    {/* Welcome Section - No Upload */}
                    <div style={{ ...styles.card, ...styles.welcomeCard }}>
                        <div style={styles.welcomeIcon}>
                            {user.role === 'lecturer' ? '👨‍🏫' : '📚'}
                        </div>
                        <h3 style={styles.welcomeText}>
                            {user.role === 'lecturer'
                                ? 'Manage Your Classes'
                                : 'Access Your Classes'
                            }
                        </h3>
                        <p style={styles.welcomeDescription}>
                            {user.role === 'lecturer'
                                ? 'Create classes, upload rubrics, and evaluate student submissions'
                                : 'Join classes and submit your assignments for evaluation'
                            }
                        </p>
                        <button
                            style={styles.classesButton}
                            onClick={() => navigate('/classes')}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#2563eb';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 10px 20px rgba(59,130,246,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#3b82f6';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            📚 Go to Classes
                        </button>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Stats */}
                        <div style={styles.card}>
                            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>📈 Your Progress</h3>
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={styles.statNumber}>{stats.totalUploads}</div>
                                    <div style={styles.statLabel}>Uploads</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statNumber}>{stats.avgScore}%</div>
                                    <div style={styles.statLabel}>Avg Score</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statNumber}>{stats.completedTasks}</div>
                                    <div style={styles.statLabel}>Completed</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ ...styles.card, marginTop: '20px' }}>
                            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>⚡ Recent Activity</h3>
                            {recentActivities.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                                    No activity yet. Join a class to get started!
                                </p>
                            ) : (
                                recentActivities.map(activity => {
                                    const iconData = getActivityIcon(activity.type);
                                    return (
                                        <div key={activity.id} style={styles.activityItem}>
                                            <div style={{ ...styles.activityIcon, background: iconData.bg }}>
                                                {iconData.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#1f2937' }}>{activity.action}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{activity.time}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}