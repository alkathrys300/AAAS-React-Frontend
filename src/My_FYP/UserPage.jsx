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
        window.location.href = 'http://localhost:3001/';
    };

    if (loading) return (
        <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <div style={styles.loadingText}>Loading your dashboard...</div>
        </div>
    );

    return (
        <div style={styles.page}>
            {/* Modern Navigation Bar */}
            <nav style={styles.navbar}>
                <div style={styles.navContainer}>
                    <div style={styles.logo}>
                        <span style={styles.logoIcon}>🎓</span>
                        <span style={styles.logoText}>AAAS</span>
                    </div>
                    
                    <div style={styles.navLinks}>
                        <button
                            onClick={() => navigate('/userpage')}
                            style={styles.navLinkActive}
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
                            <div style={styles.userAvatar}>
                                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                            </div>
                            <div style={styles.userDetails}>
                                <div style={styles.userName}>{user.name || 'User'}</div>
                                <div style={styles.userRole}>
                                    {user.role === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Lecturer'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutBtn}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#fee2e2';
                                e.target.style.borderColor = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.borderColor = '#e5e7eb';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Welcome Header */}
                <div style={styles.welcomeSection}>
                    <h1 style={styles.welcomeTitle}>
                        Welcome, {user.name}! 👋
                    </h1>
                    <p style={styles.welcomeSubtitle}>
                        Ready to enhance your academic journey?
                    </p>
                    <div style={styles.roleBadge}>
                        <span style={styles.roleBadgeIcon}>
                            {user.role === 'student' ? '👨‍🎓' : '👨‍🏫'}
                        </span>
                        <span style={styles.roleBadgeText}>
                            {user.role === 'student' ? 'Student' : 'Lecturer'}
                        </span>
                    </div>
                </div>

                <div style={styles.contentGrid}>
                    {/* Left Column - Main Content */}
                    <div style={styles.leftColumn}>
                        {/* Quick Access Card */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardIcon}>📚</div>
                                <h2 style={styles.cardTitle}>Access Your Classes</h2>
                            </div>
                            <p style={styles.cardDescription}>
                                Join classes and submit your assignments for evaluation
                            </p>
                            <button
                                onClick={() => navigate('/classes')}
                                style={styles.primaryButton}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
                                }}
                            >
                                <span>📚 Go to Classes</span>
                                <span style={styles.buttonArrow}>→</span>
                            </button>
                        </div>

                        {/* Recent Activity Card */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardIconSmall}>⚡</div>
                                <h3 style={styles.cardTitleSmall}>Recent Activity</h3>
                            </div>
                            {recentActivities.length > 0 ? (
                                <div style={styles.activityList}>
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} style={styles.activityItem}>
                                            <div style={styles.activityIconWrapper}>
                                                <span style={styles.activityIcon}>📄</span>
                                            </div>
                                            <div style={styles.activityContent}>
                                                <div style={styles.activityTitle}>{activity.title || 'Uploaded assignment'}</div>
                                                <div style={styles.activityTime}>{activity.time || '7 days ago'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>📭</div>
                                    <p style={styles.emptyText}>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Stats Sidebar */}
                    <div style={styles.rightColumn}>
                        {/* Progress Card */}
                        <div style={styles.statsCard}>
                            <div style={styles.statsHeader}>
                                <span style={styles.statsIcon}>📊</span>
                                <h3 style={styles.statsTitle}>Your Progress</h3>
                            </div>

                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.totalUploads || 1}</div>
                                <div style={styles.statLabel}>Uploads</div>
                            </div>

                            <div style={styles.statDivider}></div>

                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.avgScore || 75}%</div>
                                <div style={styles.statLabel}>Avg Score</div>
                            </div>

                            <div style={styles.statDivider}></div>

                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.completedTasks || 1}</div>
                                <div style={styles.statLabel}>Completed</div>
                            </div>
                        </div>

                        {/* Quick Links Card */}
                        <div style={styles.quickLinksCard}>
                            <h3 style={styles.quickLinksTitle}>Quick Actions</h3>
                            <div style={styles.quickLinksList}>
                                <button
                                    onClick={() => navigate('/classes')}
                                    style={styles.quickLinkBtn}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={styles.quickLinkIcon}>📚</span>
                                    <span>View Classes</span>
                                </button>
                                <button
                                    onClick={() => navigate('/analytics')}
                                    style={styles.quickLinkBtn}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={styles.quickLinkIcon}>📊</span>
                                    <span>View Analytics</span>
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    style={styles.quickLinkBtn}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={styles.quickLinkIcon}>📧</span>
                                    <span>Contact Support</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

    // Loading State
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        gap: '20px',
    },
    loadingSpinner: {
        fontSize: '4rem',
        animation: 'spin 2s linear infinite',
    },
    loadingText: {
        fontSize: '1.2rem',
        color: '#0ea5e9',
        fontWeight: '600',
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
    logoIcon: {
        fontSize: '2rem',
    },
    logoText: {
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
    navIcon: {
        fontSize: '1.2rem',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: '700',
    },
    userDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    userName: {
        fontSize: '0.95rem',
        fontWeight: '700',
        color: '#0f172a',
    },
    userRole: {
        fontSize: '0.8rem',
        color: '#64748b',
        fontWeight: '600',
    },
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

    // Welcome Section
    welcomeSection: {
        marginBottom: '40px',
        textAlign: 'center',
    },
    welcomeTitle: {
        fontSize: '3rem',
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: '12px',
        margin: '0 0 12px 0',
    },
    welcomeSubtitle: {
        fontSize: '1.2rem',
        color: '#64748b',
        marginBottom: '20px',
    },
    roleBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
        borderRadius: '100px',
        border: '2px solid #0ea5e9',
    },
    roleBadgeIcon: {
        fontSize: '1.3rem',
    },
    roleBadgeText: {
        color: '#0ea5e9',
        fontWeight: '700',
        fontSize: '0.95rem',
    },

    // Content Grid
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },

    // Cards
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
    },
    cardIcon: {
        fontSize: '3rem',
    },
    cardIconSmall: {
        fontSize: '1.5rem',
    },
    cardTitle: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: 0,
    },
    cardTitleSmall: {
        fontSize: '1.3rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: 0,
    },
    cardDescription: {
        fontSize: '1rem',
        color: '#64748b',
        marginBottom: '24px',
        lineHeight: '1.6',
    },
    primaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 20px rgba(14,165,233,0.3)',
    },
    buttonArrow: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
    },

    // Activity List
    activityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '20px',
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
    activityIconWrapper: {
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityIcon: {
        fontSize: '1.5rem',
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

    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '16px',
    },
    emptyText: {
        fontSize: '1rem',
        color: '#64748b',
        margin: 0,
    },

    // Stats Card
    statsCard: {
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
    },
    statsHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
    },
    statsIcon: {
        fontSize: '1.8rem',
    },
    statsTitle: {
        fontSize: '1.3rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: 0,
    },
    statItem: {
        textAlign: 'center',
        padding: '20px 0',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#64748b',
        fontWeight: '600',
    },
    statDivider: {
        height: '1px',
        background: '#e5e7eb',
        margin: '16px 0',
    },

    // Quick Links
    quickLinksCard: {
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
    },
    quickLinksTitle: {
        fontSize: '1.2rem',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '20px',
        margin: '0 0 20px 0',
    },
    quickLinksList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    quickLinkBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        color: '#0f172a',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
    },
    quickLinkIcon: {
        fontSize: '1.3rem',
    },
};
