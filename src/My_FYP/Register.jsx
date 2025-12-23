import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.role) {
      setError('Please select your role');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
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
        const errorMessage = body?.detail || body?.message || res.statusText || 'Registration failed';
        throw new Error(errorMessage);
      }

      // Registration successful - navigate to login
      alert('✅ Registration successful! Please sign in with your credentials.');
      navigate('/login');

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Server is taking too long to respond.');
      } else if (err.name === 'TypeError') {
        setError('Failed to connect to server. Please check if the backend is running.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
            <h1 style={styles.brandTitle}>Join AAAS</h1>
            <p style={styles.brandSubtitle}>Start your journey with automated assessment</p>
          </div>
          
          <div style={styles.universityBranding}>
            <div style={styles.universityLogo}>🏛️</div>
            <h2 style={styles.universityName}>Faculty of Computing</h2>
            <p style={styles.universityFullName}>
              Universiti Malaysia Pahang<br/>Al-Sultan Abdullah
            </p>
          </div>

          <div style={styles.benefitsList}>
            <div style={styles.benefitItem}>
              <span style={styles.benefitIcon}>🚀</span>
              <div>
                <h3 style={styles.benefitTitle}>For Students</h3>
                <p style={styles.benefitText}>Get instant feedback on assignments</p>
              </div>
            </div>
            <div style={styles.benefitItem}>
              <span style={styles.benefitIcon}>📊</span>
              <div>
                <h3 style={styles.benefitTitle}>For Lecturers</h3>
                <p style={styles.benefitText}>Automate grading and save time</p>
              </div>
            </div>
            <div style={styles.benefitItem}>
              <span style={styles.benefitIcon}>🔒</span>
              <div>
                <h3 style={styles.benefitTitle}>Secure & Reliable</h3>
                <p style={styles.benefitText}>Your data is safe with us</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f9ff';
              e.target.style.borderColor = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#cbd5e1';
            }}
          >
            <span style={styles.backArrow}>←</span>
            <span>Back to Home</span>
          </button>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                  onFocus={(e) => e.target.parentElement.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.parentElement.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
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
              <label style={styles.label}>I am a *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🎯</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.select}
                  required
                  onFocus={(e) => e.target.parentElement.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.parentElement.style.borderColor = '#e5e7eb'}
                >
                  <option value="">Choose your role</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Create a password (min 6 characters)"
                  required
                  autoComplete="new-password"
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  onFocus={(e) => e.target.parentElement.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.parentElement.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showPasswordBtn}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span style={styles.buttonArrow}>→</span>
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>Already have an account?</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button
            onClick={() => navigate('/login')}
            style={styles.loginButton}
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
            <span>Sign In Instead</span>
            <span style={styles.loginArrow}>→</span>
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
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  benefitIcon: {
    fontSize: '2rem',
  },
  benefitTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '4px',
    margin: '0 0 4px 0',
  },
  benefitText: {
    fontSize: '0.9rem',
    opacity: 0.9,
    margin: 0,
  },
  
  // Right Panel Styles
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#f8fafc',
    overflowY: 'auto',
  },
  formContainer: {
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    padding: '48px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
  },
  
  // Back Button
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: '2px solid #cbd5e1',
    borderRadius: '10px',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
  },
  backArrow: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
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
    gap: '20px',
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
  select: {
    flex: 1,
    padding: '14px 16px 14px 52px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    background: 'transparent',
    color: '#0f172a',
    cursor: 'pointer',
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
  
  // Login Button
  loginButton: {
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
  loginArrow: {
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







