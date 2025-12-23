import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

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
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#about" style={styles.navLink}>About</a>
            <a href="#contact" style={styles.navLink}>Contact</a>
          </div>

          <div style={styles.navButtons}>
            <button
              onClick={() => navigate('/login')}
              style={styles.signInBtn}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f9ff';
                e.target.style.borderColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#0ea5e9';
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              style={styles.getStartedBtn}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}>⚡</span>
              <span style={styles.badgeText}>AI-Powered Assessment</span>
            </div>
            
            <h1 style={styles.heroTitle}>
              The #1 AI Exam<br/>
              Assessment for<br/>
              <span style={styles.highlightText}>Our University</span>
            </h1>
            
            <p style={styles.heroSubtitle}>
              Automate answer script assessment with speed and accuracy. Evaluate 
              student responses in minutes using a smart AI module that delivers 
              fast, specific, and rubric-based feedback.
            </p>

            <div style={styles.heroFeatures}>
              <div style={styles.heroFeature}>
                <span style={styles.featureCheckIcon}>✓</span>
                <span>Save Time</span>
              </div>
              <div style={styles.heroFeature}>
                <span style={styles.featureCheckIcon}>✓</span>
                <span>Assessment Accuracy</span>
              </div>
              <div style={styles.heroFeature}>
                <span style={styles.featureCheckIcon}>✓</span>
                <span>Assessment Reliability</span>
              </div>
            </div>

            <div style={styles.heroCTA}>
              <button
                onClick={() => navigate('/register')}
                style={styles.primaryCTA}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(14,165,233,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(14,165,233,0.4)';
                }}
              >
                <span>Start Grading Smarter</span>
                <span style={styles.ctaArrow}>→</span>
              </button>
              
              <button
                style={styles.secondaryCTA}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <span style={styles.playIcon}>▶</span>
                <span>Watch Demo</span>
              </button>
            </div>

            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>500+</div>
                <div style={styles.statLabel}>Active Users</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>10K+</div>
                <div style={styles.statLabel}>Graded Assignments</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>95%</div>
                <div style={styles.statLabel}>Accuracy Rate</div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroImageContainer}>
              <div style={styles.floatingCard1}>
                <div style={styles.cardIcon}>📊</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardTitle}>Analytics</div>
                  <div style={styles.cardValue}>Real-time insights</div>
                </div>
              </div>
              
              <div style={styles.floatingCard2}>
                <div style={styles.cardIcon}>💻</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardTitle}>Smart Grading</div>
                  <div style={styles.cardValue}>AI-powered</div>
                </div>
              </div>
              
              <div style={styles.floatingCard3}>
                <div style={styles.cardIcon}>📝</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardTitle}>Feedback</div>
                  <div style={styles.cardValue}>Instant results</div>
                </div>
              </div>

              <div style={styles.mainImage}>
                <span style={styles.mainImageIcon}>🎯</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Powerful Features</h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to streamline your grading process
            </p>
          </div>

          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>🤖</span>
              </div>
              <h3 style={styles.featureTitle}>AI-Powered Grading</h3>
              <p style={styles.featureDescription}>
                Advanced AI algorithms analyze student responses and provide 
                accurate, consistent grading based on your rubrics.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>⚡</span>
              </div>
              <h3 style={styles.featureTitle}>Lightning Fast</h3>
              <p style={styles.featureDescription}>
                Grade hundreds of assignments in minutes instead of hours. 
                Save time and focus on what matters most.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>🎯</span>
              </div>
              <h3 style={styles.featureTitle}>Rubric-Based</h3>
              <p style={styles.featureDescription}>
                Create custom rubrics and let AI evaluate responses against 
                your specific criteria and standards.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>📊</span>
              </div>
              <h3 style={styles.featureTitle}>Detailed Analytics</h3>
              <p style={styles.featureDescription}>
                Track performance trends, identify knowledge gaps, and gain 
                insights into student learning patterns.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>🔍</span>
              </div>
              <h3 style={styles.featureTitle}>Plagiarism Detection</h3>
              <p style={styles.featureDescription}>
                Automatically detect copied content and ensure academic 
                integrity with advanced plagiarism checking.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>💬</span>
              </div>
              <h3 style={styles.featureTitle}>Instant Feedback</h3>
              <p style={styles.featureDescription}>
                Students receive immediate, constructive feedback to help 
                them learn and improve their understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={styles.howItWorksSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionSubtitle}>
              Get started in three simple steps
            </p>
          </div>

          <div style={styles.stepsContainer}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Create Your Class</h3>
                <p style={styles.stepDescription}>
                  Set up your class, add students, and create assignments 
                  with custom rubrics tailored to your course.
                </p>
              </div>
            </div>

            <div style={styles.stepConnector}>→</div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Students Submit</h3>
                <p style={styles.stepDescription}>
                  Students upload their answer scripts through an easy-to-use 
                  interface with automatic format validation.
                </p>
              </div>
            </div>

            <div style={styles.stepConnector}>→</div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>AI Grades Instantly</h3>
                <p style={styles.stepDescription}>
                  Our AI analyzes responses, assigns grades, and provides 
                  detailed feedback in minutes, not hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Branding Section */}
      <section id="about" style={styles.universitySection}>
        <div style={styles.sectionContainer}>
          <div style={styles.universityContent}>
            <div style={styles.universityLogo}>🏛️</div>
            <h2 style={styles.universityTitle}>
              Faculty of Computing
            </h2>
            <h3 style={styles.universityName}>
              Universiti Malaysia Pahang Al-Sultan Abdullah
            </h3>
            <p style={styles.universityDescription}>
              AAAS is developed specifically for UMPSA Faculty of Computing to 
              enhance the teaching and learning experience through cutting-edge 
              AI technology.
            </p>
            <div style={styles.universityStats}>
              <div style={styles.universityStat}>
                <div style={styles.universityStatNumber}>20+</div>
                <div style={styles.universityStatLabel}>Courses</div>
              </div>
              <div style={styles.universityStat}>
                <div style={styles.universityStatNumber}>50+</div>
                <div style={styles.universityStatLabel}>Lecturers</div>
              </div>
              <div style={styles.universityStat}>
                <div style={styles.universityStatNumber}>1000+</div>
                <div style={styles.universityStatLabel}>Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContainer}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your Grading?</h2>
          <p style={styles.ctaSubtitle}>
            Join hundreds of lecturers and students already using AAAS
          </p>
          <button
            onClick={() => navigate('/register')}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 20px 40px rgba(14,165,233,0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 15px 30px rgba(14,165,233,0.4)';
            }}
          >
            <span>Start Grading Smarter</span>
            <span style={styles.ctaButtonArrow}>→</span>
          </button>
          <p style={styles.ctaNote}>
            For Lecturers, Students, and Admins
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerTitle}>
                <span style={styles.footerLogoIcon}>🎓</span>
                AAAS
              </h4>
              <p style={styles.footerDescription}>
                Automated Assessment System
              </p>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialIcon}>𝕏</a>
                <a href="#" style={styles.socialIcon}>📘</a>
                <a href="#" style={styles.socialIcon}>🔗</a>
                <a href="https://fk.umpsa.edu.my/" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>▶</a>
              </div>
            </div>

            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>Support</h4>
              <a href="#" style={styles.footerLink}>Help Center</a>
              <a href="#" style={styles.footerLink}>Contact Support</a>
              <a href="#" style={styles.footerLink}>Documentation</a>
            </div>

            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>Resources</h4>
              <a href="#" style={styles.footerLink}>Tutorials</a>
              <a href="#" style={styles.footerLink}>API Guide</a>
              <a href="#" style={styles.footerLink}>Best Practices</a>
            </div>

            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>Legal</h4>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Terms of Service</a>
              <a href="#" style={styles.footerLink}>Cookie Policy</a>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p style={styles.footerCopyright}>
              © 2025 UMPSA Faculty of Computing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
  },

  // Navbar
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
  },
  navContainer: {
    maxWidth: '1280px',
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
    gap: '32px',
  },
  navLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  signInBtn: {
    padding: '10px 24px',
    background: 'transparent',
    border: '2px solid #0ea5e9',
    borderRadius: '10px',
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  getStartedBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(14,165,233,0.3)',
  },

  // Hero Section
  hero: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '100px 40px',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '80px',
  },
  heroLeft: {
    flex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'white',
    borderRadius: '100px',
    border: '2px solid #0ea5e9',
    marginBottom: '24px',
  },
  badgeIcon: {
    fontSize: '1.2rem',
  },
  badgeText: {
    color: '#0ea5e9',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '900',
    lineHeight: '1.1',
    color: '#0f172a',
    marginBottom: '24px',
    margin: '0 0 24px 0',
  },
  highlightText: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    lineHeight: '1.8',
    marginBottom: '32px',
    maxWidth: '600px',
  },
  heroFeatures: {
    display: 'flex',
    gap: '24px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  heroFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#334155',
    fontWeight: '600',
  },
  featureCheckIcon: {
    color: '#0ea5e9',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
    marginBottom: '60px',
  },
  primaryCTA: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 36px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(14,165,233,0.4)',
  },
  ctaArrow: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  secondaryCTA: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 36px',
    background: 'white',
    color: '#0f172a',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  playIcon: {
    fontSize: '0.8rem',
    color: '#0ea5e9',
  },
  stats: {
    display: 'flex',
    gap: '48px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  heroRight: {
    flex: 1,
  },
  heroImageContainer: {
    position: 'relative',
    height: '500px',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 25px 50px rgba(14,165,233,0.3)',
  },
  mainImageIcon: {
    fontSize: '10rem',
  },
  floatingCard1: {
    position: 'absolute',
    top: '20px',
    right: '-20px',
    background: 'white',
    padding: '16px 20px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  floatingCard2: {
    position: 'absolute',
    bottom: '100px',
    left: '-40px',
    background: 'white',
    padding: '16px 20px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  floatingCard3: {
    position: 'absolute',
    top: '50%',
    left: '-60px',
    background: 'white',
    padding: '16px 20px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  cardIcon: {
    fontSize: '2rem',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: '1rem',
    color: '#0f172a',
    fontWeight: '700',
  },

  // Features Section
  featuresSection: {
    padding: '100px 40px',
    background: 'white',
  },
  sectionContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  sectionSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
  },
  featureCard: {
    padding: '40px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureIconWrapper: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  featureIcon: {
    fontSize: '2.5rem',
  },
  featureTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.7',
    margin: 0,
  },

  // How It Works Section
  howItWorksSection: {
    padding: '100px 40px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px',
    marginTop: '60px',
  },
  step: {
    flex: 1,
    padding: '40px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: '900',
    marginBottom: '24px',
  },
  stepContent: {},
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  stepDescription: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.7',
    margin: 0,
  },
  stepConnector: {
    fontSize: '2rem',
    color: '#0ea5e9',
    fontWeight: 'bold',
  },

  // University Section
  universitySection: {
    padding: '100px 40px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    textAlign: 'center',
  },
  universityContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  universityLogo: {
    fontSize: '5rem',
    marginBottom: '24px',
  },
  universityTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  universityName: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '24px',
    opacity: 0.95,
    margin: '0 0 24px 0',
  },
  universityDescription: {
    fontSize: '1.2rem',
    lineHeight: '1.8',
    opacity: 0.9,
    marginBottom: '60px',
  },
  universityStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '80px',
  },
  universityStat: {},
  universityStatNumber: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '8px',
  },
  universityStatLabel: {
    fontSize: '1rem',
    opacity: 0.9,
    fontWeight: '600',
  },

  // CTA Section
  ctaSection: {
    padding: '100px 40px',
    background: 'white',
  },
  ctaContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  ctaSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    marginBottom: '40px',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 48px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 15px 30px rgba(14,165,233,0.4)',
  },
  ctaButtonArrow: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  ctaNote: {
    marginTop: '24px',
    color: '#64748b',
    fontSize: '0.95rem',
  },

  // Footer
  footer: {
    background: '#0f172a',
    color: 'white',
    padding: '60px 40px 40px',
  },
  footerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '60px',
    marginBottom: '60px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  footerTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginBottom: '8px',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerLogoIcon: {
    fontSize: '1.8rem',
  },
  footerDescription: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: 0,
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  socialIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  footerColumnTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  },
  footerBottom: {
    paddingTop: '40px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  footerCopyright: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
  },
};
