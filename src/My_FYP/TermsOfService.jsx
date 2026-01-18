import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>📜 Terms of Service</h1>
          <p style={styles.lastUpdated}>Last Updated: January 17, 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Agreement to Terms</h2>
            <p style={styles.text}>
              By accessing and using the Automated Assessment System (AAAS), you agree to be bound 
              by these Terms of Service and all applicable laws and regulations.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Use License</h2>
            <p style={styles.text}>
              Permission is granted to use AAAS for academic purposes within UMPSA Faculty of Computing. 
              This license shall automatically terminate if you violate any of these restrictions.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>User Responsibilities</h2>
            <p style={styles.text}>As a user, you agree to:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Provide accurate and truthful information</li>
              <li style={styles.listItem}>Maintain the confidentiality of your account credentials</li>
              <li style={styles.listItem}>Submit only original work and properly cite sources</li>
              <li style={styles.listItem}>Respect academic integrity policies</li>
              <li style={styles.listItem}>Not attempt to compromise system security</li>
              <li style={styles.listItem}>Not share or distribute assessment materials inappropriately</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Academic Integrity</h2>
            <p style={styles.text}>
              Users must adhere to UMPSA's academic integrity policies. The plagiarism detection 
              system is designed to promote originality. Violations may result in:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Account suspension</li>
              <li style={styles.listItem}>Reporting to academic authorities</li>
              <li style={styles.listItem}>Academic penalties as per university policy</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Prohibited Activities</h2>
            <p style={styles.text}>Users shall not:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Attempt to access unauthorized areas of the system</li>
              <li style={styles.listItem}>Upload malicious files or code</li>
              <li style={styles.listItem}>Share account credentials with others</li>
              <li style={styles.listItem}>Manipulate or falsify assessment data</li>
              <li style={styles.listItem}>Use the system for commercial purposes</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Disclaimer</h2>
            <p style={styles.text}>
              The AI-generated assessments are provided as educational tools to assist in the 
              grading process. Final grades are determined by instructors. The system is provided 
              "as is" without warranties of any kind.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Limitations of Liability</h2>
            <p style={styles.text}>
              UMPSA Faculty of Computing shall not be liable for any damages arising from the use 
              or inability to use AAAS, including but not limited to data loss or system downtime.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Modifications</h2>
            <p style={styles.text}>
              We reserve the right to modify these terms at any time. Continued use of the system 
              after changes constitutes acceptance of the modified terms.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact</h2>
            <p style={styles.contactInfo}>
              For questions about these Terms of Service:<br />
              Email: legal@umpsa.edu.my<br />
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
