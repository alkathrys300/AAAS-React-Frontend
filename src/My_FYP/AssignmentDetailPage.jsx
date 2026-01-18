import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

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
    const [hideAIScores, setHideAIScores] = useState(false);
    const [rubricWeight, setRubricWeight] = useState(50);
    const [grammarWeight, setGrammarWeight] = useState(40);
    const [plagiarismWeight, setPlagiarismWeight] = useState(10);
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
                setHideAIScores(data.hide_ai_scores || false);
                setRubricWeight(data.rubric_weight || 50);
                setGrammarWeight(data.grammar_weight || 40);
                setPlagiarismWeight(data.plagiarism_weight || 10);
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
                    comment: editedComment || null,
                    hide_ai_scores: hideAIScores,
                    rubric_weight: rubricWeight,
                    grammar_weight: grammarWeight,
                    plagiarism_weight: plagiarismWeight
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

    const handleDownloadPDF = () => {
        if (!feedback) return;

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Helper function to add text with word wrapping
        const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
            if (!text) return;
            
            pdf.setFontSize(fontSize);
            pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
            pdf.setTextColor(...color);
            
            // Split text into lines that fit the page width
            const textStr = String(text).trim();
            const lines = pdf.splitTextToSize(textStr, maxWidth);
            const lineHeight = fontSize * 0.5;
            
            lines.forEach(line => {
                if (yPosition + lineHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(line, margin, yPosition);
                yPosition += lineHeight;
            });
            yPosition += 2;
        };

        const addSection = (title) => {
            yPosition += 5;
            pdf.setDrawColor(59, 130, 246);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
            addText(title, 12, true, [37, 99, 235]);
        };

        // Header
        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AUTOMATED ASSESSMENT SYSTEM (AAAS)', pageWidth / 2, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('EVALUATION REPORT', pageWidth / 2, 25, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text('UMPSA Faculty of Computing', pageWidth / 2, 33, { align: 'center' });
        
        yPosition = 50;
        pdf.setTextColor(0, 0, 0);

        // Document Info
        addText(`Submission ID: ${scriptId}`, 10, true);
        addText(`Generated: ${new Date().toLocaleString()}`, 9);

        // Score Summary
        addSection('SCORE SUMMARY');
        const finalScore = feedback.manual_score !== null && feedback.manual_score !== undefined ? feedback.manual_score : feedback.score || 0;
        pdf.setFillColor(16, 185, 129);
        pdf.roundedRect(margin, yPosition, maxWidth, 25, 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Final Score: ${finalScore}/100`, margin + 5, yPosition + 15);
        yPosition += 30;
        pdf.setTextColor(0, 0, 0);
        
        if (feedback.score_method) addText(`Score Method: ${feedback.score_method}`, 9);
        
        yPosition += 3;
        addText('Component Scores:', 10, true);
        if (feedback.rubric_score !== null && feedback.rubric_score !== undefined) {
            addText(`  • Rubric Score: ${Math.round(feedback.rubric_score * 10) / 10}/100`, 9);
        }
        if (feedback.ai_score !== null && feedback.ai_score !== undefined) {
            addText(`  • Grammar Score: ${Math.round(feedback.ai_score * 10) / 10}/100`, 9);
        }
        if (feedback.plagiarism_score !== null && feedback.plagiarism_score !== undefined) {
            addText(`  • Plagiarism Score: ${Math.round(feedback.plagiarism_score * 10) / 10}/100`, 9);
        }

        // Plagiarism Detection
        addSection('PLAGIARISM DETECTION');
        if (feedback.similarity_percentage !== null && feedback.similarity_percentage !== undefined) {
            addText(`Similarity Percentage: ${Math.round(feedback.similarity_percentage * 10) / 10}%`, 10, true);
            addText(`Risk Level: ${feedback.plagiarism_risk || 'N/A'}`, 9);
            addText(`Originality Score: ${Math.round(feedback.plagiarism_score * 10) / 10}/100`, 9);
            if (feedback.plagiarism_method) addText(`Detection Method: ${feedback.plagiarism_method}`, 9);
        } else {
            addText('No plagiarism detected', 9);
        }

        if (feedback.similar_to_students && feedback.similar_to_students.length > 0) {
            yPosition += 3;
            addText(`Similar Submissions Detected (${feedback.similar_to_students.length}):`, 10, true);
            feedback.similar_to_students.forEach((s, i) => {
                addText(`  ${i + 1}. ${s.student_name} (ID: ${s.student_id}) - ${s.similarity_percentage}% similarity`, 9);
            });
        }

        // Rubric Assessment
        if (feedback.rubric_assessment) {
            addSection('RUBRIC ASSESSMENT');
            addText(feedback.rubric_assessment, 9);
        }

        // Grammar & Spelling
        if (feedback.languagetool_feedback && feedback.languagetool_feedback !== 'No issues found') {
            addSection('GRAMMAR & SPELLING ANALYSIS');
            addText(feedback.languagetool_feedback, 9);
        }

        // Lecturer Feedback
        if (feedback.lecturer_comment) {
            addSection('LECTURER FEEDBACK');
            addText(feedback.lecturer_comment, 9);
        }

        // Original Submission
        addSection('ORIGINAL SUBMISSION');
        const originalContent = (feedback.content || 'No content available').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        addText(originalContent, 9);

        // Suggested Corrections
        if (feedback.languagetool_corrected && feedback.languagetool_corrected !== feedback.content) {
            addSection('SUGGESTED CORRECTIONS (Grammar)');
            const correctedContent = feedback.languagetool_corrected.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            addText(correctedContent, 9);
        }

        // Improved Version
        if (feedback.t5_corrected && feedback.t5_corrected !== feedback.content) {
            addSection('IMPROVED VERSION (AI Enhanced)');
            const improvedContent = feedback.t5_corrected.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            addText(improvedContent, 9);
        }

        // Footer on last page
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Save PDF
        pdf.save(`Evaluation_Report_${scriptId}_${new Date().toISOString().split('T')[0]}.pdf`);
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
                        <div style={{ marginBottom: '20px', padding: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, marginBottom: '4px' }}>📝 Submission Details</h1>
                                {feedback.student_name && (
                                    <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: '500' }}>
                                        👤 Student: {feedback.student_name}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                {feedback.manual_score !== null && feedback.manual_score !== undefined ? Math.round(feedback.manual_score * 10) / 10 : Math.round((feedback.score || 0) * 10) / 10}/100
                                            </div>
                                            {feedback.score_method && (
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{feedback.score_method}</div>
                                            )}
                                        </div>
                                        {feedback.rubric_score !== null && feedback.rubric_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>📋 Rubric Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{Math.round(feedback.rubric_score * 10) / 10}/100</div>
                                            </div>
                                        )}
                                        {feedback.ai_score !== null && feedback.ai_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>✍️ Grammar Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{Math.round(feedback.ai_score * 10) / 10}/100</div>
                                            </div>
                                        )}
                                        {feedback.plagiarism_score !== null && feedback.plagiarism_score !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>🔍 Plagiarism Score</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{Math.round(feedback.plagiarism_score * 10) / 10}/100</div>
                                                {feedback.similarity_percentage !== null && feedback.similarity_percentage !== undefined && (
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                                        {Math.round(feedback.similarity_percentage * 10) / 10}% similarity
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
                                                    {Math.round(feedback.similarity_percentage * 10) / 10}%
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
                                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>
                                                                {student.student_name}
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
                                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#854d0e', marginBottom: '12px' }}>Detailed Issues Found:</h4>
                                                {(() => {
                                                    // Remove duplicate errors
                                                    const uniqueErrors = [];
                                                    const seenErrors = new Set();
                                                    
                                                    feedback.languagetool_details.forEach((detail) => {
                                                        const errorKey = `${detail.message}|${detail.error_text}`;
                                                        if (!seenErrors.has(errorKey)) {
                                                            seenErrors.add(errorKey);
                                                            uniqueErrors.push(detail);
                                                        }
                                                    });

                                                    return uniqueErrors.slice(0, 15).map((detail, idx) => (
                                                        <div key={idx} style={{ padding: '14px', background: 'white', borderRadius: '8px', marginBottom: '10px', border: '1px solid #fde047', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                <span style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    fontWeight: '700', 
                                                                    color: '#fff', 
                                                                    background: detail.category === 'WHITESPACE' ? '#94a3b8' : 
                                                                               detail.category === 'MISSPELLING' ? '#ef4444' : 
                                                                               detail.category === 'GRAMMAR' ? '#f59e0b' : '#78350f',
                                                                    padding: '3px 8px', 
                                                                    borderRadius: '10px',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.3px'
                                                                }}>
                                                                    {detail.category}
                                                                </span>
                                                                {detail.error_text && (
                                                                    <span style={{ 
                                                                        fontSize: '0.85rem', 
                                                                        color: '#dc2626', 
                                                                        fontFamily: 'monospace', 
                                                                        background: '#fee2e2', 
                                                                        padding: '3px 8px', 
                                                                        borderRadius: '4px',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        "{detail.error_text}"
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#713f12', marginBottom: '8px', lineHeight: '1.5' }}>
                                                                {detail.message}
                                                            </div>
                                                            {detail.suggestions && detail.suggestions.length > 0 && (
                                                                <div style={{ 
                                                                    fontSize: '0.85rem', 
                                                                    color: '#059669',
                                                                    marginTop: '8px'
                                                                }}>
                                                                    <span style={{ fontWeight: '600' }}>💡 Fix: </span>
                                                                    {detail.suggestions.slice(0, 3).map((suggestion, sIdx) => (
                                                                        <span key={sIdx}>
                                                                            <span style={{ 
                                                                                background: '#dcfce7', 
                                                                                padding: '2px 6px', 
                                                                                borderRadius: '3px',
                                                                                fontWeight: '600',
                                                                                color: '#047857',
                                                                                marginRight: '6px'
                                                                            }}>
                                                                                {suggestion}
                                                                            </span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ));
                                                })()}
                                                {(() => {
                                                    const uniqueCount = new Set(feedback.languagetool_details.map(d => `${d.message}|${d.error_text}`)).size;
                                                    return uniqueCount > 15 && (
                                                        <div style={{ 
                                                            fontSize: '0.85rem', 
                                                            color: '#78350f', 
                                                            fontStyle: 'italic', 
                                                            marginTop: '8px',
                                                            textAlign: 'center'
                                                        }}>
                                                            📋 Showing 15 of {uniqueCount} unique issues
                                                        </div>
                                                    );
                                                })()}
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
                                        <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.95rem', fontFamily: 'system-ui' }}>
                                            {(() => {
                                                // Fix broken text formatting (word-per-line issue)
                                                let displayText = feedback.content;
                                                
                                                // Check if text appears to be broken (many single-word lines)
                                                const lines = displayText.split('\n');
                                                const shortLines = lines.filter(line => line.trim() && line.trim().split(/\s+/).length <= 2);
                                                const isBroken = lines.length > 20 && (shortLines.length / lines.length) > 0.6;
                                                
                                                if (isBroken) {
                                                    // Join all lines into proper paragraphs
                                                    displayText = lines
                                                        .map(line => line.trim())
                                                        .filter(line => line.length > 0)
                                                        .join(' ')
                                                        // Add paragraph breaks for numbered sections
                                                        .replace(/(\d+\.\s*[A-Z])/g, '\n\n$1')
                                                        // Add breaks for common section headers
                                                        .replace(/\b(INTRODUCTION|METHODOLOGY|RESULTS|CONCLUSION|DISCUSSION|ABSTRACT|REFERENCES)\b/g, '\n\n$1')
                                                        // Clean up multiple spaces
                                                        .replace(/\s+/g, ' ')
                                                        // Clean up multiple newlines
                                                        .replace(/\n{3,}/g, '\n\n')
                                                        .trim();
                                                }
                                                
                                                // Split into paragraphs and display nicely
                                                const paragraphs = displayText.split('\n\n').filter(p => p.trim());
                                                
                                                return paragraphs.map((paragraph, idx) => (
                                                    <p key={idx} style={{ 
                                                        marginBottom: idx < paragraphs.length - 1 ? '16px' : '0',
                                                        textAlign: 'justify',
                                                        textIndent: paragraph.match(/^\d+\./) ? '0' : '0'
                                                    }}>
                                                        {paragraph.trim()}
                                                    </p>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Improvement Suggestions */}
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

                                {/* Suggested Corrections */}
                                {(feedback.languagetool_corrected || feedback.t5_corrected) && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🔧</span> Suggested Corrections
                                        </h3>

                                        {/* Combined AI Correction - Best of both models */}
                                        {(() => {
                                            // Use T5 as primary (better for academic enhancement)
                                            // Fall back to LanguageTool if T5 not available
                                            const correctedVersion = feedback.t5_corrected && feedback.t5_corrected !== feedback.content 
                                                ? feedback.t5_corrected 
                                                : feedback.languagetool_corrected && feedback.languagetool_corrected !== feedback.content 
                                                    ? feedback.languagetool_corrected 
                                                    : null;

                                            return correctedVersion && (
                                                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', borderRadius: '12px', border: '2px solid #60a5fa', boxShadow: '0 2px 8px rgba(96, 165, 250, 0.2)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>Improved Version</h4>
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', color: '#1e3a8a', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'system-ui', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                                                        {correctedVersion}
                                                    </div>
                                                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>💡</span>
                                                        <span>This version combines grammar corrections with enhanced clarity and flow</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Download PDF Button - Available for both Students and Lecturers */}
                                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                    <button
                                        onClick={handleDownloadPDF}
                                        style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        📄 Download Evaluation Report
                                    </button>
                                </div>

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
                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        style={{ flex: 1, minWidth: '200px', padding: '12px 24px', background: 'white', color: '#0891b2', border: '2px solid white', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        ✏️ Edit Score & Comment
                                                    </button>
                                                    <button
                                                        onClick={handleDownloadPDF}
                                                        style={{ flex: 1, minWidth: '200px', padding: '12px 24px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        📄 Download Report
                                                    </button>
                                                    <button
                                                        onClick={handleReEvaluate}
                                                        disabled={reEvaluating}
                                                        style={{ flex: 1, minWidth: '200px', padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: reEvaluating ? 0.6 : 1 }}
                                                    >
                                                        {reEvaluating ? '⏳ Re-evaluating...' : '🔄 Re-evaluate'}
                                                    </button>
                                                    {feedback.review_status === 'pending' && feedback.evaluation_id && (
                                                        <button
                                                            onClick={handleApprove}
                                                            disabled={approving}
                                                            style={{ flex: 1, minWidth: '200px', padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: approving ? 0.6 : 1 }}
                                                        >
                                                            {approving ? '⏳ Approving...' : '✅ Approve & Release to Student'}
                                                        </button>
                                                    )}
                                                    {feedback.review_status === 'approved' && (
                                                        <div style={{ flex: 1, minWidth: '200px', padding: '12px 24px', background: '#10b981', color: 'white', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', textAlign: 'center' }}>
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
                                                <div style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde047' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#854d0e' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={hideAIScores}
                                                            onChange={(e) => setHideAIScores(e.target.checked)}
                                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                        />
                                                        <span>🔒 Hide AI Scores from Student</span>
                                                    </label>
                                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#78350f', marginLeft: '28px' }}>
                                                        When enabled, students will only see your manual score and won't see individual AI, rubric, grammar, or plagiarism scores.
                                                    </div>
                                                </div>

                                                {/* Score Calculation Weights */}
                                                {(feedback.rubric_score !== null || feedback.ai_score !== null || feedback.plagiarism_score !== null) && (
                                                    <div style={{ marginBottom: '16px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e40af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>⚖️</span> Customize Score Weights
                                                        </h4>
                                                        <div style={{ fontSize: '0.8rem', color: '#1e3a8a', marginBottom: '12px' }}>
                                                            Adjust how each component contributes to the final score (must total 100%)
                                                        </div>
                                                        
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                                            {feedback.rubric_score !== null && feedback.rubric_score !== undefined && (
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                                                                        📋 Rubric Weight (%)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={rubricWeight}
                                                                        onChange={(e) => setRubricWeight(parseInt(e.target.value) || 0)}
                                                                        style={{ width: '100%', padding: '8px', border: '2px solid #93c5fd', borderRadius: '6px', fontSize: '0.95rem' }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {feedback.ai_score !== null && feedback.ai_score !== undefined && (
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                                                                        ✍️ Grammar Weight (%)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={grammarWeight}
                                                                        onChange={(e) => setGrammarWeight(parseInt(e.target.value) || 0)}
                                                                        style={{ width: '100%', padding: '8px', border: '2px solid #93c5fd', borderRadius: '6px', fontSize: '0.95rem' }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {feedback.plagiarism_score !== null && feedback.plagiarism_score !== undefined && (
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                                                                        🔍 Plagiarism Weight (%)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={plagiarismWeight}
                                                                        onChange={(e) => setPlagiarismWeight(parseInt(e.target.value) || 0)}
                                                                        style={{ width: '100%', padding: '8px', border: '2px solid #93c5fd', borderRadius: '6px', fontSize: '0.95rem' }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Total validation */}
                                                        {(() => {
                                                            const total = (feedback.rubric_score !== null ? rubricWeight : 0) + 
                                                                         (feedback.ai_score !== null ? grammarWeight : 0) + 
                                                                         (feedback.plagiarism_score !== null ? plagiarismWeight : 0);
                                                            const isValid = total === 100;
                                                            return (
                                                                <div style={{ 
                                                                    marginTop: '12px', 
                                                                    padding: '10px', 
                                                                    background: isValid ? '#dcfce7' : '#fee2e2', 
                                                                    borderRadius: '6px',
                                                                    border: `1px solid ${isValid ? '#86efac' : '#fca5a5'}`,
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isValid ? '#166534' : '#991b1b' }}>
                                                                        Total: {total}%
                                                                    </span>
                                                                    {isValid ? (
                                                                        <span style={{ fontSize: '0.85rem', color: '#166534' }}>✅ Valid</span>
                                                                    ) : (
                                                                        <span style={{ fontSize: '0.85rem', color: '#991b1b' }}>❌ Must equal 100%</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
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
                                                            setHideAIScores(feedback.hide_ai_scores || false);
                                                            setRubricWeight(feedback.rubric_weight || 50);
                                                            setGrammarWeight(feedback.grammar_weight || 40);
                                                            setPlagiarismWeight(feedback.plagiarism_weight || 10);
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
