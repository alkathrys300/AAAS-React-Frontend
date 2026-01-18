import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>📚 Help Center</h1>
          <p style={styles.subtitle}>Find answers to common questions and get support</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            
            <div style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>How do I upload an assignment?</h3>
              <p style={styles.faqAnswer}>
                Navigate to your class, click on "Upload Assignment", select your file, and submit. 
                The system supports PDF, DOCX, and TXT formats.
              </p>
            </div>

            <div style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>How long does AI evaluation take?</h3>
              <p style={styles.faqAnswer}>
                AI evaluation is typically completed within seconds. You'll receive immediate feedback 
                on grammar, plagiarism, and rubric scoring.
              </p>
            </div>

            <div style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>Can I resubmit an assignment?</h3>
              <p style={styles.faqAnswer}>
                Students can submit one assignment per class. To resubmit, please delete your previous 
                submission first or contact your instructor.
              </p>
            </div>

            <div style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>How do I contact support?</h3>
              <p style={styles.faqAnswer}>
                Visit the Contact Support page or email us at support@umpsa.edu.my for assistance.
              </p>
            </div>
          </div>

          <div style={styles.contactBox}>
            <h3 style={styles.contactTitle}>Need More Help?</h3>
            <p style={styles.contactText}>Contact our support team for personalized assistance</p>
            <button style={styles.contactBtn} onClick={() => navigate('/contact')}>
              Contact Support →
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
    transition: 'all 0.2s',
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
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '24px',
  },
  faqItem: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  faqQuestion: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
  },
  faqAnswer: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
  },
  contactBox: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    padding: '32px',
    borderRadius: '12px',
    textAlign: 'center',
    color: 'white',
  },
  contactTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '12px',
  },
  contactText: {
    fontSize: '1rem',
    marginBottom: '20px',
    opacity: 0.9,
  },
  contactBtn: {
    padding: '12px 32px',
    background: 'white',
    color: '#0ea5e9',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
