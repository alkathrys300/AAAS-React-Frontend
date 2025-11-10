import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const styles = {
        // Container styles
        container: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            margin: 0,
            padding: 0,
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },

        // Header styles
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 50px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },

        logoSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },

        logo: {
            width: '50px',
            height: '50px',
            fontSize: '2rem',
        },

        logoText: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
        },

        nav: {
            display: 'flex',
            gap: '60px',
            alignItems: 'center',
        },

        navLink: {
            color: '#666',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
        },

        authButtons: {
            display: 'flex',
            gap: '15px',
        },

        signInBtn: {
            padding: '8px 20px',
            backgroundColor: 'transparent',
            border: '2px solid #667eea',
            borderRadius: '5px',
            color: '#667eea',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
        },

        getStartedBtn: {
            padding: '8px 20px',
            backgroundColor: '#333',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
        },

        // Main content styles
        mainContent: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '60px 50px',
            color: 'white',
            maxWidth: '1200px',
            margin: '0 auto',
        },

        leftSection: {
            flex: '1',
            maxWidth: '600px',
        },

        mainTitle: {
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            lineHeight: '1.2',
        },

        description: {
            fontSize: '1.2rem',
            marginBottom: '40px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
        },

        features: {
            display: 'flex',
            gap: '40px',
            marginBottom: '190px',
        },

        feature: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },

        featureIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
        },

        featureText: {
            fontSize: '1rem',
            fontWeight: '500',
        },

        ctaButton: {
            padding: '15px 30px',
            backgroundColor: '#312e2eff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
            display: 'block',
            width: 'fit-content',
            marginTop: '0',
            marginLeft: 'auto',
            marginRight: '-100px',
        },

        ctaSubtext: {
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.8)',
            width: 'fit-content',
            marginLeft: 'auto',
            marginRight: '-50px',
        },

        rightSection: {
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },

        illustration: {
            width: '400px',
            height: '300px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            backdropFilter: 'blur(10px)',
        },

        // Footer styles
        footer: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            padding: '40px 50px',
            marginTop: '80px',
        },

        footerContent: {
            display: 'flex',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            margin: '0 auto',
            color: 'white',
        },

        footerSection: {
            flex: '1',
        },

        footerTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '15px',
        },

        footerLinks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },

        footerLink: {
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '0.9rem',
        },

        socialIcons: {
            display: 'flex',
            gap: '15px',
            marginTop: '20px',
        },

        socialIcon: {
            width: '30px',
            height: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1rem',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logo}>🎓</div>
                    <h1 style={styles.logoText}>AAAS</h1>
                </div>

                <nav style={styles.nav}>
                    <a href="#about" style={styles.navLink}>About us</a>
                    <a href="#contact" style={styles.navLink}>Contact us</a>
                    <a href="#faq" style={styles.navLink}>FAQ / Help</a>
                </nav>

                <div style={styles.authButtons}>
                    <button
                        style={styles.signInBtn}
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                    <button
                        style={styles.getStartedBtn}
                        onClick={() => navigate('/register')}
                    >
                        Get Started
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.mainContent}>
                <div style={styles.leftSection}>
                    <h2 style={styles.mainTitle}>
                        The #1 AI Exam Assessment for Our University
                    </h2>

                    <p style={styles.description}>
                        Automate answer script assessment with speed and accuracy.
                        Evaluate student responses in minutes using a smart AI module that delivers
                        fast, specific, and rubric-based feedback.
                    </p>

                    <div style={styles.features}>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>⏱️</div>
                            <span style={styles.featureText}>Save Time</span>
                        </div>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>🎯</div>
                            <span style={styles.featureText}>Assessment accuracy</span>
                        </div>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>✅</div>
                            <span style={styles.featureText}>Assessment reliability</span>
                        </div>
                    </div>

                    <button
                        style={styles.ctaButton}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#312e2eff'}
                        onClick={() => navigate('/register')}
                    >
                        Start Grading Smarter
                    </button>

                    <p style={styles.ctaSubtext}>
                        For Lecturers, Students,<br />
                        and Admins
                    </p>
                </div>

                <div style={styles.rightSection}>
                    <div style={styles.illustration}>
                        📊💻📝
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>AAES | Automated Assessment System</h3>
                        <div style={styles.socialIcons}>
                            <a href="#" style={styles.socialIcon}>𝕏</a>
                            <a href="#" style={styles.socialIcon}>📷</a>
                            <a href="#" style={styles.socialIcon}>🔗</a>
                            <a href="#" style={styles.socialIcon}>▶️</a>
                        </div>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Support</h4>
                        <div style={styles.footerLinks}>
                            <a href="#" style={styles.footerLink}>Help Center</a>
                            <a href="#" style={styles.footerLink}>Contact Support</a>
                            <a href="#" style={styles.footerLink}>Documentation</a>
                        </div>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Resources</h4>
                        <div style={styles.footerLinks}>
                            <a href="#" style={styles.footerLink}>Tutorials</a>
                            <a href="#" style={styles.footerLink}>API Guide</a>
                            <a href="#" style={styles.footerLink}>Best Practices</a>
                        </div>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Legal</h4>
                        <div style={styles.footerLinks}>
                            <a href="#" style={styles.footerLink}>Privacy Policy</a>
                            <a href="#" style={styles.footerLink}>Terms of Service</a>
                            <a href="#" style={styles.footerLink}>Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;