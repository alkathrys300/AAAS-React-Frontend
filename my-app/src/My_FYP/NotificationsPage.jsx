import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
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
        fetchNotifications(token, parsedUser.user_id);
    }, [navigate]);

    const fetchNotifications = async (token, userId) => {
        try {
            // Simulate API call - replace with real endpoint
            setTimeout(() => {
                setNotifications([
                    {
                        notification_id: 1,
                        message: 'Your submission for Assignment 1 has been evaluated',
                        status: 'unread',
                        sent_at: '2025-12-02 10:30:00',
                        type: 'evaluation'
                    },
                    {
                        notification_id: 2,
                        message: 'New feedback available for Midterm Essay',
                        status: 'unread',
                        sent_at: '2025-12-01 14:20:00',
                        type: 'feedback'
                    },
                    {
                        notification_id: 3,
                        message: 'Lab Report 2 has been graded - Score: 90%',
                        status: 'read',
                        sent_at: '2025-11-30 09:15:00',
                        type: 'grade'
                    },
                    {
                        notification_id: 4,
                        message: 'You have been enrolled in Introduction to Programming',
                        status: 'read',
                        sent_at: '2025-10-15 08:00:00',
                        type: 'enrollment'
                    }
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(notifications.map(notif =>
            notif.notification_id === notificationId
                ? { ...notif, status: 'read' }
                : notif
        ));
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'evaluation': return '✅';
            case 'feedback': return '💬';
            case 'grade': return '📊';
            case 'enrollment': return '📚';
            default: return '🔔';
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
            marginBottom: '40px'
        },
        notificationsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        notificationCard: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px 25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        unreadCard: {
            background: 'rgba(102, 126, 234, 0.1)',
            border: '2px solid rgba(102, 126, 234, 0.3)'
        },
        notificationIcon: {
            fontSize: '2rem',
            minWidth: '50px',
            textAlign: 'center'
        },
        notificationContent: {
            flex: 1
        },
        notificationMessage: {
            fontSize: '1.05rem',
            color: '#1f2937',
            marginBottom: '5px',
            fontWeight: '500'
        },
        notificationTime: {
            fontSize: '0.85rem',
            color: '#9ca3af'
        },
        unreadBadge: {
            padding: '5px 12px',
            background: '#667eea',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600'
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
                <div style={styles.loading}>Loading notifications...</div>
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
                    🔔 Notifications
                </h1>
                <p style={styles.subtitle}>
                    Stay updated with your academic progress and activities
                </p>

                <div style={styles.notificationsList}>
                    {notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            style={{
                                ...styles.notificationCard,
                                ...(notification.status === 'unread' ? styles.unreadCard : {})
                            }}
                            onClick={() => markAsRead(notification.notification_id)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            <div style={styles.notificationIcon}>
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div style={styles.notificationContent}>
                                <div style={styles.notificationMessage}>
                                    {notification.message}
                                </div>
                                <div style={styles.notificationTime}>
                                    {new Date(notification.sent_at).toLocaleString()}
                                </div>
                            </div>
                            {notification.status === 'unread' && (
                                <div style={styles.unreadBadge}>NEW</div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
