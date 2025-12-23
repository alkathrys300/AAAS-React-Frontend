import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Contact() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role === 'student') {
      fetchLecturers(token, parsedUser.user_id);
    }
  }, [navigate]);

  const fetchLecturers = async (token, studentId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/student/${studentId}/lecturers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLecturers(data.lecturers || []);
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    } finally {
      setLoading(false);
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
              style={styles.navLinkActive}
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
          <h1 style={styles.pageTitle}>📧 Contact & Support</h1>
          <p style={styles.pageSubtitle}>Get in touch with faculty and support</p>
        </div>

        {/* Faculty Contact Cards */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏛️ Faculty of Computing - UMPSA</h2>
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📞</div>
              <h3 style={styles.contactCardTitle}>General Inquiries</h3>
              <p style={styles.contactDetail}>09-431 5011</p>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>🎓</div>
              <h3 style={styles.contactCardTitle}>Academic Office</h3>
              <p style={styles.contactDetail}>09-431 5071</p>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>✉️</div>
              <h3 style={styles.contactCardTitle}>Email</h3>
              <a 
                href="mailto:fk@umpsa.edu.my" 
                style={styles.contactLink}
                onMouseEnter={(e) => e.target.style.color = '#0284c7'}
                onMouseLeave={(e) => e.target.style.color = '#0ea5e9'}
              >
                fk@umpsa.edu.my
              </a>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>🌐</div>
              <h3 style={styles.contactCardTitle}>Website</h3>
              <a 
                href="https://fk.umpsa.edu.my/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.contactLink}
                onMouseEnter={(e) => e.target.style.color = '#0284c7'}
                onMouseLeave={(e) => e.target.style.color = '#0ea5e9'}
              >
                fk.umpsa.edu.my
              </a>
            </div>
          </div>
        </div>

        {/* Office Information */}
        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>⏰ Office Hours</h3>
            <p style={styles.infoText}>Monday - Friday: 8:00 AM - 5:00 PM</p>
            <p style={styles.infoText}>Saturday - Sunday: Closed</p>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📍 Address</h3>
            <p style={styles.infoText}>
              Faculty of Computing<br/>
              Universiti Malaysia Pahang Al-Sultan Abdullah<br/>
              Lebuhraya Tun Razak, 26300 Gambang<br/>
              Kuantan, Pahang, Malaysia
            </p>
          </div>
        </div>

        {/* My Lecturers Section (for students) */}
        {user.role === 'student' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>👨‍🏫 My Lecturers</h2>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.loadingSpinner}>⏳</div>
                <p>Loading lecturers...</p>
              </div>
            ) : lecturers.length > 0 ? (
              <div style={styles.lecturersGrid}>
                {lecturers.map((lecturer) => (
                  <div key={lecturer.user_id} style={styles.lecturerCard}>
                    <div style={styles.lecturerAvatar}>
                      {lecturer.name ? lecturer.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <h3 style={styles.lecturerName}>{lecturer.name}</h3>
                    <p style={styles.lecturerClass}>{lecturer.class_name}</p>
                    <a 
                      href={`mailto:${lecturer.email}`}
                      style={styles.lecturerEmail}
                      onMouseEnter={(e) => e.target.style.color = '#0284c7'}
                      onMouseLeave={(e) => e.target.style.color = '#0ea5e9'}
                    >
                      {lecturer.email}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👨‍🏫</div>
                <h3 style={styles.emptyTitle}>No lecturers yet</h3>
                <p style={styles.emptyText}>Enroll in classes to see your lecturers</p>
              </div>
            )}
          </div>
        )}

        {/* Support Section */}
        <div style={styles.supportSection}>
          <h2 style={styles.supportTitle}>💬 Need Help?</h2>
          <p style={styles.supportText}>
            If you have any questions about AAAS or need technical support, 
            please contact your lecturer or the faculty office.
          </p>
          <div style={styles.supportButtons}>
            <button
              onClick={() => window.location.href = 'mailto:fk@umpsa.edu.my'}
              style={styles.supportButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
              }}
            >
              <span>📧 Email Faculty</span>
            </button>
            <button
              onClick={() => window.open('https://fk.umpsa.edu.my/', '_blank')}
              style={styles.websiteButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f9ff';
                e.target.style.borderColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#0ea5e9';
              }}
            >
              <span>🌐 Visit Website</span>
            </button>
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
  },

  // Page Header
  pageHeader: {
    marginBottom: '48px',
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 12px 0',
  },
  pageSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0,
  },

  // Section
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '24px',
    margin: '0 0 24px 0',
  },

  // Contact Grid
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  contactCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  contactIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  contactCardTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  contactDetail: {
    fontSize: '1rem',
    color: '#64748b',
    fontWeight: '600',
    margin: 0,
  },
  contactLink: {
    fontSize: '1rem',
    color: '#0ea5e9',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },

  // Info Section
  infoSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  infoCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  infoTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  infoText: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '8px',
  },

  // Lecturers Grid
  lecturersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '24px',
  },
  lecturerCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  lecturerAvatar: {
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
  lecturerName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  lecturerClass: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '12px',
  },
  lecturerEmail: {
    fontSize: '0.9rem',
    color: '#0ea5e9',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },

  // Support Section
  supportSection: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    padding: '48px',
    borderRadius: '20px',
    textAlign: 'center',
    border: '2px solid #0ea5e9',
  },
  supportTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  supportText: {
    fontSize: '1.1rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '32px',
    maxWidth: '600px',
    margin: '0 auto 32px',
  },
  supportButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  supportButton: {
    padding: '16px 32px',
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
  websiteButton: {
    padding: '16px 32px',
    background: 'white',
    color: '#0ea5e9',
    border: '2px solid #0ea5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Loading State
  loadingState: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '1.2rem',
    color: '#64748b',
  },
  loadingSpinner: {
    fontSize: '3rem',
    marginBottom: '16px',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0,
  },
};
