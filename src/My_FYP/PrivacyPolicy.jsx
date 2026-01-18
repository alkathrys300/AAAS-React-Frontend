import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>🔒 Privacy Policy</h1>
          <p style={styles.lastUpdated}>Last Updated: January 17, 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Introduction</h2>
            <p style={styles.text}>
              The Automated Assessment System (AAAS) is committed to protecting the privacy and 
              security of your personal information. This Privacy Policy explains how we collect, 
              use, and safeguard your data.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Information We Collect</h2>
            <p style={styles.text}>We collect the following types of information:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Personal Information:</strong> Name, email address, student/staff ID
              </li>
              <li style={styles.listItem}>
                <strong>Academic Content:</strong> Assignment submissions, grades, and feedback
              </li>
              <li style={styles.listItem}>
                <strong>Usage Data:</strong> Login times, system interactions, and analytics
              </li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>How We Use Your Information</h2>
            <p style={styles.text}>Your information is used to:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Provide automated assessment and feedback services</li>
              <li style={styles.listItem}>Facilitate communication between students and lecturers</li>
              <li style={styles.listItem}>Improve system functionality and user experience</li>
              <li style={styles.listItem}>Generate academic analytics and reports</li>
              <li style={styles.listItem}>Ensure academic integrity through plagiarism detection</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Data Security</h2>
            <p style={styles.text}>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Encrypted data transmission (HTTPS/TLS)</li>
              <li style={styles.listItem}>Secure authentication and authorization</li>
              <li style={styles.listItem}>Regular security audits and updates</li>
              <li style={styles.listItem}>Access controls and user permissions</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Data Sharing</h2>
            <p style={styles.text}>
              Your data is shared only with:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Your enrolled course lecturers</li>
              <li style={styles.listItem}>System administrators (for technical support)</li>
              <li style={styles.listItem}>University Computing Faculty officials (when required)</li>
            </ul>
            <p style={styles.text}>
              We do not sell or share your personal information with third parties for marketing purposes.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Rights</h2>
            <p style={styles.text}>You have the right to:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Access your personal data</li>
              <li style={styles.listItem}>Request corrections to your information</li>
              <li style={styles.listItem}>Request deletion of your account (subject to academic record requirements)</li>
              <li style={styles.listItem}>Opt-out of non-essential communications</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Us</h2>
            <p style={styles.text}>
              For privacy-related questions or concerns, please contact:
            </p>
            <p style={styles.contactInfo}>
              Email: privacy@umpsa.edu.my<br />
              Faculty of Computing<br />
              Universiti Malaysia Pahang Al-Sultan Abdullah
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
    marginBottom: '8px',
  },
  lastUpdated: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '16px',
  },
  text: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '12px',
  },
  list: {
    marginTop: '12px',
    paddingLeft: '24px',
  },
  listItem: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '8px',
  },
  contactInfo: {
    fontSize: '1rem',
    color: '#0f172a',
    lineHeight: '1.8',
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
};
