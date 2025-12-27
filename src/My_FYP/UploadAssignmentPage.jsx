import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UploadAssignmentPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('❌ Please select a file');
      return;
    }

    if (!topic.trim()) {
      alert('❌ Please enter a topic');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignment_title', topic);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/upload-answer-script/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message || 'Assignment uploaded successfully!'}`);
        navigate(`/class/${classId}`);
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Upload failed'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Error uploading assignment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>AAAS</span>
          </div>
          <button onClick={() => navigate(`/class/${classId}`)} style={styles.backBtn}>
            ← Back to Class
          </button>
        </div>
      </nav>

      <div style={styles.mainContent}>
        <div style={styles.uploadCard}>
          <h1 style={styles.title}>📤 Upload Assignment</h1>
          <p style={styles.subtitle}>Submit your assignment file</p>

          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Assignment Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Smart Home IoT System"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select File *</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
                style={styles.fileInput}
                required
              />
              {file && (
                <div style={styles.filePreview}>
                  📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={uploading}
                style={uploading ? styles.submitBtnDisabled : styles.submitBtn}
              >
                {uploading ? '⏳ Uploading...' : '✅ Upload Assignment'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}`)}
                style={styles.cancelBtn}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  },
  navbar: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '1rem 0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  backBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  mainContent: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 24px',
  },
  uploadCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  fileInput: {
    padding: '12px',
    fontSize: '0.95rem',
    border: '2px dashed #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  filePreview: {
    padding: '12px 16px',
    background: '#f0f9ff',
    borderRadius: '8px',
    color: '#0369a1',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  submitBtnDisabled: {
    flex: 1,
    padding: '14px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'not-allowed',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default UploadAssignmentPage;