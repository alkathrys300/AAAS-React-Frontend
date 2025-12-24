import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function AssignmentDetailPage() {
    const { assignmentId, classId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // For now, we'll create a dummy assignment
        // In the future, you can fetch real assignment details from the backend
        setAssignment({
            id: assignmentId,
            title: 'Assignment Submission',
            description: 'Upload your assignment file here',
            due_date: new Date().toISOString(),
            max_score: 100
        });
        setLoading(false);
    }, [navigate, assignmentId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file size (5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignment_title', assignment.title);

            const response = await fetch(`${API_BASE}/class/${classId}/upload-answer-script/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Upload successful:', data);
                setUploadSuccess(true);
                setFile(null);
                
                // Redirect to submissions page after 2 seconds
                setTimeout(() => {
                    navigate('/submissions');
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Upload failed. Please try again.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f3f4f6',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            background: '#2c3e50',
            borderBottom: '1px solid #34495e'
        },
        logo: {
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        nav: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        },
        navLink: {
            padding: '8px 16px',
            background: '#34495e',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            border: '1px solid transparent'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        userName: {
            color: 'white',
            fontWeight: '500'
        },
        logoutButton: {
            padding: '8px 16px',
            background: '#e74c3c',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        main: {
            padding: '30px',
            maxWidth: '800px',
            margin: '0 auto'
        },
        card: {
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px'
        },
        description: {
            fontSize: '1rem',
            color: '#7f8c8d',
            marginBottom: '30px'
        },
        form: {
            marginTop: '30px'
        },
        formGroup: {
            marginBottom: '25px'
        },
        label: {
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '8px'
        },
        fileInput: {
            display: 'none'
        },
        fileLabel: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            background: '#3498db',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        },
        fileName: {
            marginTop: '10px',
            fontSize: '0.9rem',
            color: '#7f8c8d'
        },
        submitButton: {
            width: '100%',
            padding: '15px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '20px'
        },
        submitButtonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        successMessage: {
            padding: '15px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '20px',
            fontWeight: '500',
            border: '1px solid #c3e6cb'
        },
        errorMessage: {
            padding: '15px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '20px',
            fontWeight: '500',
            border: '1px solid #f5c6cb'
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            marginBottom: '20px',
            transition: 'all 0.3s ease'
        },
        loading: {
            color: '#2c3e50',
            fontSize: '1.2rem',
            textAlign: 'center',
            padding: '40px'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/userpage')}>
                    AAAS
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}>
                        Dashboard
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}>
                        Classes
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/submissions')}>
                        Submissions
                    </div>
                </nav>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>{user?.name}</span>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <button 
                    style={styles.backButton}
                    onClick={() => navigate(`/class/${classId}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#7f8c8d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#95a5a6'}
                >
                    ← Back to Class
                </button>

                <div style={styles.card}>
                    <h1 style={styles.title}>Assignment Submission</h1>
                    <p style={styles.description}>Upload your assignment file here</p>

                    {uploadSuccess && (
                        <div style={styles.successMessage}>
                            Assignment uploaded successfully! Redirecting to submissions...
                        </div>
                    )}

                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Upload Your Assignment</label>
                            <input
                                type="file"
                                id="file-upload"
                                style={styles.fileInput}
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            <label 
                                htmlFor="file-upload" 
                                style={styles.fileLabel}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2980b9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#3498db'}
                            >
                                Choose File
                            </label>
                            {file && (
                                <div style={styles.fileName}>
                                    Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                                </div>
                            )}
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#9ca3af' }}>
                                Accepted formats: PDF, DOC, DOCX, TXT (Max 5MB)
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.submitButton,
                                ...(uploading || !file ? styles.submitButtonDisabled : {})
                            }}
                            disabled={uploading || !file}
                            onMouseEnter={(e) => {
                                if (!uploading && file) {
                                    e.currentTarget.style.background = '#2980b9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!uploading && file) {
                                    e.currentTarget.style.background = '#3498db';
                                }
                            }}
                        >
                            {uploading ? 'Uploading...' : 'Submit Assignment'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
