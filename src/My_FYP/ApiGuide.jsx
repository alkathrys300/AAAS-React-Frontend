import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApiGuide() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>🎓 AAAS</div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>🔌 API Guide</h1>
          <p style={styles.subtitle}>Technical documentation for AAAS API integration</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Base URL</h2>
            <div style={styles.codeBlock}>
              http://127.0.0.1:8000
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Authentication</h2>
            <p style={styles.text}>
              All API requests require Bearer token authentication. Include your token in the 
              Authorization header:
            </p>
            <div style={styles.codeBlock}>
              Authorization: Bearer YOUR_ACCESS_TOKEN
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Key Endpoints</h2>
            
            <div style={styles.endpointCard}>
              <div style={styles.method}>POST</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/auth/login</div>
                <p style={styles.endpointDesc}>User authentication</p>
              </div>
            </div>

            <div style={styles.endpointCard}>
              <div style={styles.method}>POST</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/class/create</div>
                <p style={styles.endpointDesc}>Create a new class (Lecturer only)</p>
              </div>
            </div>

            <div style={styles.endpointCard}>
              <div style={styles.methodGet}>GET</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/classes/my-classes</div>
                <p style={styles.endpointDesc}>Get user's classes</p>
              </div>
            </div>

            <div style={styles.endpointCard}>
              <div style={styles.method}>POST</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/class/&#123;class_id&#125;/upload-answer-script</div>
                <p style={styles.endpointDesc}>Upload student assignment</p>
              </div>
            </div>

            <div style={styles.endpointCard}>
              <div style={styles.methodGet}>GET</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/assignment/&#123;script_id&#125;/feedback</div>
                <p style={styles.endpointDesc}>Get AI-generated feedback</p>
              </div>
            </div>

            <div style={styles.endpointCard}>
              <div style={styles.method}>POST</div>
              <div style={styles.endpointInfo}>
                <div style={styles.endpointPath}>/assignment/&#123;script_id&#125;/review</div>
                <p style={styles.endpointDesc}>Submit manual review (Lecturer only)</p>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Response Format</h2>
            <p style={styles.text}>All responses are in JSON format:</p>
            <div style={styles.codeBlock}>
              {'{'}
              <br />
              &nbsp;&nbsp;"success": true,
              <br />
              &nbsp;&nbsp;"data": {'{'} ... {'}'},
              <br />
              &nbsp;&nbsp;"message": "Operation successful"
              <br />
              {'}'}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Error Codes</h2>
            <ul style={styles.errorList}>
              <li style={styles.errorItem}>
                <strong>400</strong> - Bad Request (Invalid parameters)
              </li>
              <li style={styles.errorItem}>
                <strong>401</strong> - Unauthorized (Invalid or missing token)
              </li>
              <li style={styles.errorItem}>
                <strong>403</strong> - Forbidden (Insufficient permissions)
              </li>
              <li style={styles.errorItem}>
                <strong>404</strong> - Not Found (Resource doesn't exist)
              </li>
              <li style={styles.errorItem}>
                <strong>500</strong> - Internal Server Error
              </li>
            </ul>
          </div>

          <div style={styles.noteBox}>
            <h3 style={styles.noteTitle}>📝 Note</h3>
            <p style={styles.noteText}>
              For detailed API documentation and interactive testing, please contact the development team.
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
  section: {
    marginBottom: '40px',
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
  codeBlock: {
    background: '#0f172a',
    color: '#10b981',
    padding: '20px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    overflowX: 'auto',
  },
  endpointCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '12px',
    alignItems: 'center',
  },
  method: {
    padding: '6px 12px',
    background: '#10b981',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  methodGet: {
    padding: '6px 12px',
    background: '#0ea5e9',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  endpointInfo: {
    flex: 1,
  },
  endpointPath: {
    fontFamily: 'monospace',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  endpointDesc: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  errorList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  errorItem: {
    fontSize: '1rem',
    color: '#64748b',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  noteBox: {
    background: '#e0f2fe',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid #0ea5e9',
  },
  noteTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: '8px',
  },
  noteText: {
    fontSize: '1rem',
    color: '#075985',
    margin: 0,
  },
};
