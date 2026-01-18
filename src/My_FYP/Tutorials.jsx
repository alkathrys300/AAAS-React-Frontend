import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Tutorials() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>🎥 Tutorials</h1>
          <p style={styles.subtitle}>Step-by-step video guides to help you master the system</p>

          <div style={styles.videoSection}>
            <h2 style={styles.sectionTitle}>Getting Started Video</h2>
            <div style={styles.videoCard}>
              <div style={styles.videoPlaceholder}>
                <span style={styles.playIcon}>▶</span>
                <p style={styles.videoTitle}>Complete System Tutorial</p>
              </div>
              <button 
                style={styles.watchBtn}
                onClick={() => window.open('https://youtu.be/97pGA_a_t90', '_blank')}
              >
                Watch Tutorial →
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quick Start Guides</h2>
            
            <div style={styles.tutorialCard}>
              <div style={styles.tutorialIcon}>👨‍🎓</div>
              <div style={styles.tutorialContent}>
                <h3 style={styles.tutorialTitle}>Student Guide</h3>
                <p style={styles.tutorialDesc}>
                  Learn how to enroll in classes, submit assignments, and view your feedback
                </p>
                <ul style={styles.tutorialSteps}>
                  <li>Create an account and get approved</li>
                  <li>Join classes using enrollment codes</li>
                  <li>Upload and submit assignments</li>
                  <li>Review AI-generated feedback</li>
                </ul>
              </div>
            </div>

            <div style={styles.tutorialCard}>
              <div style={styles.tutorialIcon}>👨‍🏫</div>
              <div style={styles.tutorialContent}>
                <h3 style={styles.tutorialTitle}>Lecturer Guide</h3>
                <p style={styles.tutorialDesc}>
                  Learn how to create classes, upload rubrics, and review student submissions
                </p>
                <ul style={styles.tutorialSteps}>
                  <li>Create and manage classes</li>
                  <li>Upload grading rubrics</li>
                  <li>Review AI assessments</li>
                  <li>Provide manual feedback and scores</li>
                </ul>
              </div>
            </div>

            <div style={styles.tutorialCard}>
              <div style={styles.tutorialIcon}>⚙️</div>
              <div style={styles.tutorialContent}>
                <h3 style={styles.tutorialTitle}>Admin Guide</h3>
                <p style={styles.tutorialDesc}>
                  Learn how to manage users, approve registrations, and monitor system analytics
                </p>
                <ul style={styles.tutorialSteps}>
                  <li>Approve pending user registrations</li>
                  <li>Manage user accounts and roles</li>
                  <li>Monitor system usage and analytics</li>
                  <li>Handle support requests</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={styles.tipBox}>
            <h3 style={styles.tipTitle}>💡 Pro Tip</h3>
            <p style={styles.tipText}>
              Watch the complete video tutorial above for a comprehensive walkthrough of all system features!
            </p>
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
  header: {
    background: 'white',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0ea5e9',
    cursor: 'pointer',
  },
  backBtn: {
    padding: '10px 20px',
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 20px',
  },
  content: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    marginBottom: '40px',
  },
  videoSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '20px',
  },
  videoCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
  },
  videoPlaceholder: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    borderRadius: '12px',
    padding: '60px',
    textAlign: 'center',
    color: 'white',
    marginBottom: '16px',
  },
  playIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
  },
  videoTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  watchBtn: {
    width: '100%',
    padding: '14px',
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '40px',
  },
  tutorialCard: {
    display: 'flex',
    gap: '20px',
    padding: '24px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '20px',
  },
  tutorialIcon: {
    fontSize: '3rem',
    flexShrink: 0,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
  },
  tutorialDesc: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '12px',
  },
  tutorialSteps: {
    margin: 0,
    paddingLeft: '20px',
    color: '#64748b',
  },
  tipBox: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid #fde047',
  },
  tipTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#713f12',
    marginBottom: '8px',
  },
  tipText: {
    fontSize: '1rem',
    color: '#854d0e',
    margin: 0,
  },
};
