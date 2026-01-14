import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function AssignmentDetailPage() {
    const { assignmentId, submissionId, classId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Lecturer review controls
    const [isEditing, setIsEditing] = useState(false);
    const [editedScore, setEditedScore] = useState('');
    const [editedComment, setEditedComment] = useState('');
    const [savingReview, setSavingReview] = useState(false);
    const [approving, setApproving] = useState(false);
    const [reEvaluating, setReEvaluating] = useState(false);

    const scriptId = submissionId || assignmentId;
    const isViewMode = true; // Always view mode - we're viewing an existing submission
    const isLecturer = user?.role === 'lecturer';

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Always fetch feedback for the submission
        if (scriptId) {
            fetchFeedback(token);
        }
    }, [navigate, scriptId]);

    const fetchFeedback = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/assignment/${scriptId}/feedback`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data);
                // Initialize edit fields with current values
                setEditedScore(data.manual_score !== null ? data.manual_score : data.score || '');
                setEditedComment(data.lecturer_comment || '');
            } else if (response.status === 403) {
                // Feedback pending approval - this is normal, not an error
                setFeedback({
                    status: 'pending_review',
                    message: 'Your submission is awaiting instructor review'
                });
            } else {
                setError('Failed to load submission details');
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError('Error loading submission details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReview = async () => {
        setSavingReview(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/assignment/${scriptId}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    score: editedScore ? parseInt(editedScore) : null,
                    comment: editedComment || null
                })
            });

            if (response.ok) {
                // Refresh feedback
                await fetchFeedback(token);
                setIsEditing(false);
                alert('Review saved successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to save review');
            }
        } catch (err) {
            console.error('Error saving review:', err);
            alert('Error saving review');
        } finally {
            setSavingReview(false);
        }
    };

    const handleApprove = async () => {
        if (!feedback.evaluation_id) {
            alert('No evaluation found to approve');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to approve this evaluation? Students will be able to view the feedback.');
        if (!confirmed) return;

        setApproving(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/evaluation/${feedback.evaluation_id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.msg || 'Evaluation approved!');
                // Refresh feedback
                await fetchFeedback(token);
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to approve evaluation');
            }
        } catch (err) {
            console.error('Error approving evaluation:', err);
            alert('Error approving evaluation');
        } finally {
            setApproving(false);
        }
    };

    const handleReEvaluate = async () => {
        const confirmed = window.confirm('Are you sure you want to re-evaluate this submission? This will clear the cached analysis and generate a fresh evaluation.');
        if (!confirmed) return;

        setReEvaluating(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/assignment/${scriptId}/re-evaluate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert('✅ ' + (data.msg || 'Re-evaluation triggered successfully!') + '\n\nRefreshing feedback...');
                // Refresh feedback to get new evaluation
                await fetchFeedback(token);
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to re-evaluate submission');
            }
        } catch (err) {
            console.error('Error re-evaluating:', err);
            alert('Error re-evaluating submission');
        } finally {
            setReEvaluating(false);
        }
    };

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
        // Clear all session data
        localStorage.clear();
        sessionStorage.clear();
        // Navigate to home page with replace
        navigate('/', { replace: true });
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
                    {user?.role === 'student' && (
                        <div style={styles.navLink} onClick={() => navigate('/submissions')}>
                            Submissions
                        </div>
                    )}
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

                {isViewMode && feedback ? (
                    <div style={styles.card}>
                        <h1 style={styles.title}>📝 Submission Details</h1>

                        {feedback.status === 'pending_review' ? (
                            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⏳</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                                    Awaiting Review
                                </h2>
                                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '24px' }}>
                                    {feedback.message || 'Your submission is awaiting instructor review'}
                                </p>
                                <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde047', maxWidth: '500px', margin: '0 auto' }}>
                                    <p style={{ margin: 0, color: '#713f12', fontSize: '0.95rem' }}>
                                        ✨ Your instructor will review your submission soon. You'll be able to view detailed feedback once it's been reviewed.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Score Summary */}
                                <div style={{ marginBottom: '24px', padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>📊 Final Score</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{feedback.score || 0}/100</div>
                                            {feedback.score_method && (
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{feedback.score_method}</div>
                                            )}
                                        </div>
                                        {feedback.rubric_score !== null && feedback.rubric_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>📋 Rubric Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{feedback.rubric_score}/100</div>
                                            </div>
                                        )}
                                        {feedback.ai_score !== null && feedback.ai_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>✍️ Grammar Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{feedback.ai_score}/100</div>
                                            </div>
                                        )}
                                        {feedback.plagiarism_score !== null && feedback.plagiarism_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>🔍 Plagiarism Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{feedback.plagiarism_score}/100</div>
                                                {feedback.similarity_percentage !== null && feedback.similarity_percentage !== undefined && (
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                                        {feedback.similarity_percentage}% similarity
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Plagiarism Detection Results */}
                                {feedback.similarity_percentage !== null && feedback.similarity_percentage !== undefined && feedback.similarity_percentage > 0 && (
                                    <div style={{
                                        marginBottom: '24px',
                                        padding: '20px',
                                        background: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#fee2e2' :
                                            feedback.plagiarism_risk === 'MEDIUM' ? '#fef3c7' : '#f0fdf4',
                                        borderRadius: '12px',
                                        border: `2px solid ${feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#fca5a5' :
                                            feedback.plagiarism_risk === 'MEDIUM' ? '#fde047' : '#86efac'}`
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#991b1b' :
                                                feedback.plagiarism_risk === 'MEDIUM' ? '#854d0e' : '#166534',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>🔍</span> Plagiarism Detection Results
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#991b1b' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#854d0e' : '#166534'
                                                }}>
                                                    Similarity Detected:
                                                </div>
                                                <div style={{
                                                    fontSize: '1.8rem', fontWeight: '700',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#dc2626' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#f59e0b' : '#059669'
                                                }}>
                                                    {feedback.similarity_percentage}%
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#991b1b' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#854d0e' : '#166534'
                                                }}>
                                                    Risk Level:
                                                </div>
                                                <div style={{
                                                    fontSize: '1.3rem', fontWeight: '700',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#dc2626' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#f59e0b' : '#059669'
                                                }}>
                                                    {feedback.plagiarism_risk ? feedback.plagiarism_risk.replace('_', ' ') : 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#991b1b' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#854d0e' : '#166534'
                                                }}>
                                                    Originality Score:
                                                </div>
                                                <div style={{
                                                    fontSize: '1.8rem', fontWeight: '700',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#dc2626' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#f59e0b' : '#059669'
                                                }}>
                                                    {feedback.plagiarism_score}/100
                                                </div>
                                            </div>
                                        </div>
                                        {/* Similar Students List - LECTURER ONLY */}
                                        {isLecturer && feedback.similar_to_students && feedback.similar_to_students.length > 0 && (
                                            <div style={{ 
                                                marginTop: '16px', 
                                                padding: '16px', 
                                                background: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? 'rgba(254, 226, 226, 0.5)' :
                                                    feedback.plagiarism_risk === 'MEDIUM' ? 'rgba(254, 243, 199, 0.5)' : 'rgba(240, 253, 244, 0.5)',
                                                borderRadius: '8px', 
                                                border: `2px solid ${feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#fca5a5' :
                                                    feedback.plagiarism_risk === 'MEDIUM' ? '#fde047' : '#86efac'}`
                                            }}>
                                                <h4 style={{
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    marginBottom: '12px',
                                                    color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#991b1b' :
                                                        feedback.plagiarism_risk === 'MEDIUM' ? '#854d0e' : '#166534',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <span>👥</span> Similar Submissions Detected ({feedback.similar_to_students.length})
                                                </h4>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', fontStyle: 'italic' }}>
                                                    🔒 This information is only visible to lecturers
                                                </div>
                                                {feedback.similar_to_students.map((student, idx) => (
                                                    <div key={idx} style={{
                                                        padding: '14px',
                                                        background: 'white',
                                                        borderRadius: '8px',
                                                        marginBottom: idx < feedback.similar_to_students.length - 1 ? '10px' : '0',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '6px', fontSize: '1rem' }}>
                                                                {student.student_name}
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                ID: {student.student_id}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{
                                                                fontSize: '2rem', 
                                                                fontWeight: '700',
                                                                color: student.similarity_percentage >= 70 ? '#dc2626' :
                                                                    student.similarity_percentage >= 50 ? '#f59e0b' : '#059669'
                                                            }}>
                                                                {student.similarity_percentage}%
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>similarity</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {feedback.plagiarism_method && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: feedback.plagiarism_risk === 'VERY_HIGH' || feedback.plagiarism_risk === 'HIGH' ? '#7f1d1d' :
                                                    feedback.plagiarism_risk === 'MEDIUM' ? '#78350f' : '#14532d',
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(255,255,255,0.5)',
                                                borderRadius: '8px'
                                            }}>
                                                <strong>Detection Method:</strong> {feedback.plagiarism_method}
                                                <div style={{ marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                    {feedback.plagiarism_risk === 'VERY_HIGH' && '⚠️ Very high similarity detected. This submission may require review for academic integrity.'}
                                                    {feedback.plagiarism_risk === 'HIGH' && '⚠️ High similarity detected. Please review for potential plagiarism.'}
                                                    {feedback.plagiarism_risk === 'MEDIUM' && '⚡ Moderate similarity detected. Some content may overlap with other submissions.'}
                                                    {(feedback.plagiarism_risk === 'LOW' || feedback.plagiarism_risk === 'MINIMAL') && '✅ Low similarity detected. Content appears largely original.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rubric Evaluation */}
                                {feedback.rubric_assessment && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #86efac' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#166534', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>📋</span> Rubric Evaluation
                                        </h3>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#166534', lineHeight: '1.6' }}>
                                            {feedback.rubric_assessment}
                                        </div>
                                        {feedback.rubric_criteria && feedback.rubric_criteria.length > 0 && (
                                            <div style={{ marginTop: '16px' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>Criteria Breakdown:</h4>
                                                {feedback.rubric_criteria.map((criterion, idx) => (
                                                    <div key={idx} style={{ padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #bbf7d0' }}>
                                                        <div style={{ fontWeight: '600', color: '#166534', marginBottom: '4px' }}>{criterion.criterion}</div>
                                                        <div style={{ fontSize: '0.9rem', color: '#15803d' }}>{criterion.feedback}</div>
                                                        {criterion.score !== null && criterion.score !== undefined && (
                                                            <div style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: '600', color: '#14532d' }}>
                                                                Score: {criterion.score}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Grammar & Spelling Analysis */}
                                {feedback.languagetool_feedback && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #fde047' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#854d0e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>✍️</span> Grammar & Spelling Analysis
                                        </h3>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#713f12', marginBottom: '16px' }}>
                                            {feedback.languagetool_feedback}
                                        </div>

                                        {/* Error Breakdown */}
                                        {feedback.errors_by_type && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                                                {Object.entries(feedback.errors_by_type).map(([type, count]) => (
                                                    <div key={type} style={{ padding: '12px', background: 'white', borderRadius: '8px', textAlign: 'center', border: '1px solid #fde047' }}>
                                                        <div style={{ fontSize: '0.85rem', color: '#78350f', textTransform: 'capitalize', marginBottom: '4px' }}>{type}</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#854d0e' }}>{count}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Detailed Errors */}
                                        {feedback.languagetool_details && feedback.languagetool_details.length > 0 && (
                                            <div style={{ marginTop: '16px' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#854d0e', marginBottom: '12px' }}>Detailed Issues:</h4>
                                                {feedback.languagetool_details.slice(0, 10).map((detail, idx) => (
                                                    <div key={idx} style={{ padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #fde047' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#78350f', textTransform: 'uppercase' }}>{detail.category}</span>
                                                            {detail.error_text && (
                                                                <span style={{ fontSize: '0.9rem', color: '#b45309', fontFamily: 'monospace', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                                                                    "{detail.error_text}"
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: '#713f12', marginBottom: '8px' }}>{detail.message}</div>
                                                        {detail.suggestions && detail.suggestions.length > 0 && (
                                                            <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '4px' }}>
                                                                💡 Suggestions: {detail.suggestions.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {feedback.languagetool_details.length > 10 && (
                                                    <div style={{ fontSize: '0.85rem', color: '#78350f', fontStyle: 'italic', marginTop: '8px' }}>
                                                        ... and {feedback.languagetool_details.length - 10} more issues
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Corrected Versions */}
                                {(feedback.languagetool_corrected || feedback.t5_corrected) && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🔧</span> AI Corrections
                                        </h3>

                                        {feedback.languagetool_corrected && feedback.languagetool_corrected !== feedback.content && (
                                            <div style={{ marginBottom: '16px', padding: '16px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>LanguageTool Corrections:</h4>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: 'system-ui' }}>
                                                    {feedback.languagetool_corrected}
                                                </div>
                                            </div>
                                        )}

                                        {feedback.t5_corrected && feedback.t5_corrected !== feedback.content && (
                                            <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>T5 AI Model Corrections:</h4>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: 'system-ui' }}>
                                                    {feedback.t5_corrected}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Suggestions */}
                                {feedback.suggestions && feedback.suggestions.length > 0 && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '2px solid #93c5fd' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e40af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>💡</span> Improvement Suggestions
                                        </h3>
                                        <ul style={{ margin: 0, paddingLeft: '24px', color: '#1e40af' }}>
                                            {feedback.suggestions.map((suggestion, idx) => (
                                                <li key={idx} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Instructor Manual Feedback */}
                                {isLecturer && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>👨‍🏫</span> Lecturer Review & Grading
                                        </h3>

                                        {!isEditing ? (
                                            <>
                                                <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>Final Score:</div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0891b2' }}>
                                                            {feedback.manual_score !== null && feedback.manual_score !== undefined ? feedback.manual_score : feedback.score || 0}/100
                                                        </div>
                                                    </div>
                                                    {feedback.lecturer_comment && (
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>Comment:</div>
                                                            <div style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                                                {feedback.lecturer_comment}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        style={{ flex: 1, padding: '12px 24px', background: 'white', color: '#0891b2', border: '2px solid white', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        ✏️ Edit Score & Comment
                                                    </button>
                                                    <button
                                                        onClick={handleReEvaluate}
                                                        disabled={reEvaluating}
                                                        style={{ flex: 1, padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: reEvaluating ? 0.6 : 1 }}
                                                    >
                                                        {reEvaluating ? '⏳ Re-evaluating...' : '🔄 Re-evaluate'}
                                                    </button>
                                                    {feedback.review_status === 'pending' && feedback.evaluation_id && (
                                                        <button
                                                            onClick={handleApprove}
                                                            disabled={approving}
                                                            style={{ flex: 1, padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: approving ? 0.6 : 1 }}
                                                        >
                                                            {approving ? '⏳ Approving...' : '✅ Approve & Release to Student'}
                                                        </button>
                                                    )}
                                                    {feedback.review_status === 'approved' && (
                                                        <div style={{ flex: 1, padding: '12px 24px', background: '#10b981', color: 'white', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', textAlign: 'center' }}>
                                                            ✅ Approved - Student Can View
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px', borderRadius: '8px' }}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                                        Final Score (0-100):
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editedScore}
                                                        onChange={(e) => setEditedScore(e.target.value)}
                                                        style={{ width: '100%', padding: '10px', border: '2px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                                                        placeholder={`Current: ${feedback.score || 0}`}
                                                    />
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                                        Comments for Student:
                                                    </label>
                                                    <textarea
                                                        value={editedComment}
                                                        onChange={(e) => setEditedComment(e.target.value)}
                                                        rows="5"
                                                        style={{ width: '100%', padding: '10px', border: '2px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
                                                        placeholder="Enter your feedback for the student..."
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button
                                                        onClick={handleSaveReview}
                                                        disabled={savingReview}
                                                        style={{ flex: 1, padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: savingReview ? 0.6 : 1 }}
                                                    >
                                                        {savingReview ? '⏳ Saving...' : '💾 Save Review'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setEditedScore(feedback.manual_score !== null ? feedback.manual_score : feedback.score || '');
                                                            setEditedComment(feedback.lecturer_comment || '');
                                                        }}
                                                        style={{ flex: 1, padding: '12px 24px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        ❌ Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Student View of Instructor Feedback */}
                                {!isLecturer && feedback.lecturer_comment && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #fde047' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#854d0e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>👨‍🏫</span> Instructor Feedback
                                        </h3>
                                        {feedback.manual_score !== null && feedback.manual_score !== undefined && (
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#713f12', marginBottom: '12px' }}>
                                                Final Score: {feedback.manual_score}/100
                                            </div>
                                        )}
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#713f12', lineHeight: '1.6' }}>
                                            {feedback.lecturer_comment}
                                        </div>
                                        {feedback.manual_last_updated && (
                                            <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '12px', fontStyle: 'italic' }}>
                                                Last updated: {new Date(feedback.manual_last_updated).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Legacy Instructor Manual Feedback - keep for backward compatibility */}
                                {feedback.lecturer_comment && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '2px solid #fde047', display: isLecturer ? 'none' : 'block' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#854d0e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>👨‍🏫</span> Instructor Feedback
                                        </h3>
                                        {feedback.manual_score !== null && feedback.manual_score !== undefined && (
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#713f12', marginBottom: '12px' }}>
                                                Manual Score: {feedback.manual_score}/100
                                            </div>
                                        )}
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#713f12', lineHeight: '1.6' }}>
                                            {feedback.lecturer_comment}
                                        </div>
                                        {feedback.manual_last_updated && (
                                            <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '12px', fontStyle: 'italic' }}>
                                                Last updated: {new Date(feedback.manual_last_updated).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Original Content */}
                                {feedback.content && (
                                    <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>📄</span> Original Submission
                                        </h3>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#475569', lineHeight: '1.6', fontSize: '0.95rem', fontFamily: 'system-ui' }}>
                                            {feedback.content}
                                        </div>
                                    </div>
                                )}

                                {/* Analysis Info */}
                                {feedback.analysis_method && (
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginTop: '24px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div>Analysis Method: {feedback.analysis_method}</div>
                                        {feedback.analysis_date && (
                                            <div style={{ marginTop: '4px' }}>Analyzed: {new Date(feedback.analysis_date).toLocaleString()}</div>
                                        )}
                                        {feedback.cached && <div style={{ marginTop: '4px', color: '#059669' }}>⚡ Cached Results - Instant Load</div>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
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
                )}
            </main>
        </div>
    );
}
