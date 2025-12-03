import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',  // User will select this
  });

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
    formContainer: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    roleIcon: {
      fontSize: '3rem',
      marginBottom: '10px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px',
    },
    subtitle: {
      color: '#666',
      fontSize: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#333',
    },
    input: {
      padding: '15px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    select: {
      padding: '15px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease',
    },
    button: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '15px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    backButton: {
      position: 'absolute',
      top: '30px',
      left: '30px',
      backgroundColor: 'transparent',
      border: '2px solid white',
      color: 'white',
      borderRadius: '8px',
      padding: '10px 20px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#666',
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
    },
    error: {
      color: '#ff4757',
      fontSize: '0.9rem',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#ffe0e0',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    success: {
      color: '#27ae60',
      fontSize: '0.9rem',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#e8f5e8',
      borderRadius: '8px',
      marginBottom: '20px',
    },
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'lecturer': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.role) {
      setError('Please select your role');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Format data to match your FastAPI UserRegistration model
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      console.log('Sending to FastAPI:', registrationData);

      // ✅ FIXED: Send correct data
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData), // ✅ FIXED: Send registrationData, not broken form object
      });

      // ✅ FIXED: Proper error handling
      const data = await response.json();
      console.log('FastAPI response:', data);

      if (!response.ok) {
        // Extract error message properly - avoid [object Object]
        const errorMessage = data.detail || data.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      // ✅ Success handling
      const successMessage = data.message || 'Registration successful!';

      // Show different message based on role
      if (formData.role === 'admin') {
        alert(`✅ ${successMessage}\n\nYou can login immediately as an admin!\n\nWelcome ${formData.name}!`);
      } else if (formData.role === 'student' || formData.role === 'lecturer') {
        alert(`✅ ${successMessage}\n\nYour account is pending admin approval. You will be able to login once an admin approves your registration.\n\nWelcome ${formData.name}!`);
      } else {
        alert(`✅ ${successMessage}\nWelcome ${formData.name}!`);
      }

      // Navigate to login page
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);

      // ✅ FIXED: Proper error message display (no more [object Object])
      if (error.message) {
        setError(error.message);
      } else if (error.name === 'TypeError') {
        setError('Failed to connect to server. Please check if the backend is running.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.backButton}
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>

      <div style={styles.formContainer}>
        <div style={styles.header}>
          <div style={styles.roleIcon}>{getRoleIcon(formData.role)}</div>
          <h1 style={styles.title}>
            {formData.role ? `Register as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}` : '🎓 Join AAAS'}
          </h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="your.email@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>I am a *</label>
            <select
              style={styles.select}
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose your role</option>
              <option value="student">👨‍🎓 Student</option>
              <option value="lecturer">👨‍🏫 Lecturer</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#5a67d8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#667eea';
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.loginLink}>
          Already have an account? {' '}
          <a
            href="#"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;







