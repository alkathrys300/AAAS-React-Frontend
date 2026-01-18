import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>📖 Documentation</h1>
          <p style={styles.subtitle}>Complete guide to using the Automated Assessment System</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Getting Started</h2>
            <p style={styles.text}>
              Welcome to AAAS! This system helps automate the grading process using AI technology 
              to evaluate student assignments based on grammar, plagiarism, and rubric criteria.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>For Students</h2>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>1. Enrolling in a Class</h3>
              <p style={styles.docText}>
                Use the enrollment code provided by your lecturer to join a class. Navigate to 
                "Classes" and enter the code (format: ENROLL-XX).
              </p>
            </div>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>2. Submitting Assignments</h3>
              <p style={styles.docText}>
                Click on your class, select "Upload Assignment", choose your file (PDF, DOCX, or TXT), 
                and submit before the deadline.
              </p>
            </div>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>3. Viewing Feedback</h3>
              <p style={styles.docText}>
                After submission, view AI-generated feedback including grammar corrections, 
                plagiarism detection, and rubric-based scoring.
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>For Lecturers</h2>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>1. Creating a Class</h3>
              <p style={styles.docText}>
                Navigate to "Classes" and create a new class. Share the enrollment code with students.
              </p>
            </div>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>2. Uploading Rubrics</h3>
              <p style={styles.docText}>
                Upload assignment rubrics to enable rubric-based grading. The AI will evaluate 
                submissions against your criteria.
              </p>
            </div>
            <div style={styles.docItem}>
              <h3 style={styles.docTitle}>3. Reviewing Submissions</h3>
              <p style={styles.docText}>
                Review AI-generated assessments and provide manual feedback. You can override 
                AI scores and add personalized comments.
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>System Features</h2>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}>✓ AI-powered grammar and spelling correction</li>
              <li style={styles.featureItem}>✓ Advanced plagiarism detection</li>
              <li style={styles.featureItem}>✓ Rubric-based assessment</li>
              <li style={styles.featureItem}>✓ Real-time analytics and reporting</li>
              <li style={styles.featureItem}>✓ Customizable grading weights</li>
            </ul>
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
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb',
  },
  text: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.7',
  },
  docItem: {
    marginBottom: '20px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  docTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
  },
  docText: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureItem: {
    fontSize: '1rem',
    color: '#0f172a',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
  },
};
