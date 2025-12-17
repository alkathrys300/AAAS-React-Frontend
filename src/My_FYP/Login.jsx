import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      padding: '34px',
      borderRadius: '14px',
      background: '#fff',
      boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
    },
    title: {
      textAlign: 'center',
      marginBottom: 18,
      fontSize: '1.6rem',
      fontWeight: 700,
      color: '#333'
    },
    label: {
      display: 'block',
      marginBottom: 6,
      fontWeight: 600,
      color: '#333'
    },
    input: {
      width: '100%',
      padding: 12,
      borderRadius: 8,
      border: '2px solid #f0f0f0',
      marginBottom: 14,
      outline: 'none',
      fontSize: '1rem',
      transition: 'border-color 0.2s ease'
    },
    button: {
      width: '100%',
      padding: 12,
      borderRadius: 8,
      border: 'none',
      background: '#667eea',
      color: '#fff',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s ease'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    linkRow: {
      marginTop: 12,
      textAlign: 'center',
      color: '#666'
    },
    error: {
      color: '#721c24',
      backgroundColor: '#f8d7da',
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
      textAlign: 'center',
      border: '1px solid #f5c6cb'
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Attempting login...');
      console.log('📧 Email:', form.email.trim());

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // ✅ FIXED: Remove trailing slash from URL
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(), // ✅ FIXED: Normalize email
          password: form.password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', res.status);

      // ✅ FIXED: Better response handling
      let body = null;
      try {
        body = await res.json();
        console.log('📋 Response body:', body);
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        body = null;
      }

      if (!res.ok) {
        // ✅ FIXED: Better error message extraction
        const errorMessage = body?.detail || body?.message || res.statusText || 'Login failed';
        console.error('❌ Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // ✅ FIXED: Better success handling
      if (body?.access_token) {
        localStorage.setItem('access_token', body.access_token);
        console.log('✅ Token saved to localStorage');
      }

      if (body?.user) {
        localStorage.setItem('user', JSON.stringify(body.user));
        console.log('✅ User data saved:', body.user);
      }

      console.log('🎉 Login successful! Redirecting...');

      // Show success message briefly before redirect
      setError(''); // Clear any previous errors

      // Redirect based on user role
      const userRole = body.user?.role || 'student';

      if (userRole === 'admin') {
        alert(`✅ Welcome back, Admin ${body.user?.name || 'User'}!`);
        navigate('/admin/dashboard');
      } else if (userRole === 'lecturer') {
        alert(`✅ Welcome back, ${body.user?.name || 'User'}!`);
        navigate('/userpage'); // or '/lecturer/dashboard' if you have one
      } else {
        alert(`✅ Welcome back, ${body.user?.name || 'User'}!`);
        navigate('/userpage');
      }

    } catch (err) {
      console.error('❌ Login error:', err);

      // ✅ FIXED: Better error handling with timeout
      if (err.name === 'AbortError') {
        setError('⏱️ Request timeout. Server is taking too long to respond. Please try again.');
      } else if (err.name === 'TypeError') {
        setError('❌ Failed to connect to server. Please check if the backend is running.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{
              ...styles.input,
              borderColor: error && !form.email ? '#dc3545' : '#f0f0f0'
            }}
            placeholder="Enter your email address"
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{
              ...styles.input,
              borderColor: error && !form.password ? '#dc3545' : '#f0f0f0'
            }}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#5a67d8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#667eea';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.linkRow}>
          Don't have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
            style={{
              color: '#667eea',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
} 