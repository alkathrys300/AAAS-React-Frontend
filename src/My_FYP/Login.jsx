import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userDataString = localStorage.getItem('user') || localStorage.getItem('userData');
    
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/userpage', { replace: true });
        }
      } catch (e) {
        // Invalid data, clear it
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let body = null;
      try {
        body = await res.json();
      } catch (parseError) {
        body = null;
      }

      if (!res.ok) {
        const errorMessage = body?.detail || body?.message || res.statusText || 'Login failed';
        throw new Error(errorMessage);
      }

      if (body?.access_token) {
        localStorage.setItem('access_token', body.access_token);
      }

      if (body?.user) {
        localStorage.setItem('user', JSON.stringify(body.user));
        localStorage.setItem('userData', JSON.stringify(body.user));
      }

      const userRole = body.user?.role || 'student';

      // Use replace to prevent back navigation to login
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/userpage', { replace: true });
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Server is taking too long to respond.');
      } else if (err.name === 'TypeError') {
        setError('Failed to connect to server. Please check if the backend is running.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoCircle}>
              <span style={styles.logoIcon}>🎓</span>
            </div>
            <h1 style={styles.brandTitle}>AAAS</h1>
            <p style={styles.brandSubtitle}>Automated Assignment Assessment System</p>
          </div>
          
          <div style={styles.universityBranding}>
            <div style={styles.universityLogo}>🏛️</div>
            <h2 style={styles.universityName}>Faculty of Computing</h2>
            <p style={styles.universityFullName}>
              Universiti Malaysia Pahang<br/>Al-Sultan Abdullah
            </p>
          </div>

          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span style={styles.featureText}>AI-Powered Grading</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span style={styles.featureText}>Plagiarism Detection</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span style={styles.featureText}>Instant Feedback</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="your.email@umpsa.edu.my"
                  required
                  autoComplete="email"
                  onFocus={(e) => e.target.parentElement.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.parentElement.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  onFocus={(e) => e.target.parentElement.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.parentElement.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordBtn}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(14,165,233,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={styles.loadingSpinner}>⏳</span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span style={styles.buttonArrow}>→</span>
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>New to AAAS?</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button
            onClick={() => navigate('/register')}
            style={styles.registerButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#f0f9ff';
              e.target.style.borderColor = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#0ea5e9';
            }}
          >
            <span>Create an Account</span>
            <span style={styles.registerArrow}>→</span>
          </button>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              © 2025 UMPSA Faculty of Computing. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  
  // Left Panel Styles
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandingContent: {
    maxWidth: '500px',
    color: 'white',
    zIndex: 1,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  logoCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  logoIcon: {
    fontSize: '3rem',
  },
  brandTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '12px',
    letterSpacing: '2px',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    fontWeight: '400',
    marginTop: '12px',
  },
  universityBranding: {
    textAlign: 'center',
    padding: '40px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    marginBottom: '40px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  universityLogo: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  universityName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  universityFullName: {
    fontSize: '0.95rem',
    opacity: 0.9,
    lineHeight: '1.6',
    margin: 0,
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  featureIcon: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  
  // Right Panel Styles
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#f8fafc',
  },
  formContainer: {
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    padding: '48px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
  },
  formHeader: {
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: 0,
  },
  
  // Error Alert
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  errorIcon: {
    fontSize: '1.25rem',
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  
  // Form Styles
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    background: 'white',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '1.25rem',
    pointerEvents: 'none',
  },
  input: {
    flex: 1,
    padding: '14px 16px 14px 52px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    background: 'transparent',
    color: '#0f172a',
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
  },
  
  // Submit Button
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(14,165,233,0.3)',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  loadingSpinner: {
    fontSize: '1.25rem',
  },
  buttonArrow: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease',
  },
  
  // Divider
  divider: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    margin: '32px 0',
    gap: '16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  
  // Register Button
  registerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#0ea5e9',
    border: '2px solid #0ea5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  registerArrow: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  
  // Footer
  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: 0,
  },
};
