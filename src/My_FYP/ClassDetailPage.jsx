import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Add plagiarism imports
import { usePlagiarism } from './usePlagiarism';
import { PlagiarismSection, StudentPlagiarismCard, PlagiarismModal } from './PlagiarismComponents';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function ClassDetailPage() {
    const navigate = useNavigate();
    const { classId } = useParams();
    const [user, setUser] = useState(null);
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Upload states
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [rubricTitle, setRubricTitle] = useState('');

    // Assignment states
    const [assignments, setAssignments] = useState([]);
    const [rubrics, setRubrics] = useState([]);

    // Feedback modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [manualScore, setManualScore] = useState('');
    const [manualComment, setManualComment] = useState('');
    const [currentEvaluationId, setCurrentEvaluationId] = useState(null);
    const [reviewStatus, setReviewStatus] = useState(null);
    const [savingReview, setSavingReview] = useState(false);
    const [approvingReview, setApprovingReview] = useState(false);

    // Pending enrollments states  
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [loadingPending, setLoadingPending] = useState(false);

    // Rubric states
    const [existingRubric, setExistingRubric] = useState(null);
    const [loadingRubric, setLoadingRubric] = useState(false);

    // Plagiarism hook
    const {
        plagiarismResults,
        isCheckingPlagiarism,
        showPlagiarismModal,
        allowStudentView,
        plagiarismStats,
        canCheckPlagiarism,
        checkPlagiarism,
        setShowPlagiarismModal,
        setAllowStudentView,
        getStudentPlagiarismStatus
    } = usePlagiarism(classId, assignments, user);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        fetchClassDetails(token);
        fetchAssignments(token);

        // Fetch pending enrollments for lecturers
        if (parsedUser.role === 'lecturer') {
            fetchPendingEnrollments(token);
            fetchExistingRubric(token);
        }
    }, [navigate, classId]);

    const fetchClassDetails = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/class/${classId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setClassData(data);
            } else {
                console.error('Failed to fetch class details');
                navigate('/classes');
            }
        } catch (error) {
            console.error('Error fetching class details:', error);
            navigate('/classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/class/${classId}/assignments/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAssignments(data.submissions || []);
                setRubrics(data.rubrics || []);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    // Fetch pending enrollments
    const fetchPendingEnrollments = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/class/${classId}/enrollment-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPendingEnrollments(data.pending_requests || []);
            } else {
                console.error('Failed to fetch pending enrollments');
            }
        } catch (error) {
            console.error('Error fetching pending enrollments:', error);
        }
    };

    // Fetch existing rubric
    const fetchExistingRubric = async (token) => {
        setLoadingRubric(true);
        try {
            const response = await fetch(`${API_BASE}/class/${classId}/rubric`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.exists) {
                    setExistingRubric(data.rubric);
                } else {
                    setExistingRubric(null);
                }
            } else {
                setExistingRubric(null);
            }
        } catch (error) {
            console.error('Error fetching rubric:', error);
            setExistingRubric(null);
        } finally {
            setLoadingRubric(false);
        }
    };

    // Delete rubric
    const handleDeleteRubric = async (rubricId) => {
        if (!window.confirm('Are you sure you want to delete this rubric? This action cannot be undone.')) {
            return;
        }

        // ✅ Immediately clear UI state for instant feedback (before API call)
        const previousRubric = existingRubric;
        setExistingRubric(null);
        
        // Also clear form fields
        setRubricTitle('');
        setAssignmentTitle('');
        setFile(null);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/rubric/${rubricId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // ✅ Refresh to confirm deletion (should return null now)
                await fetchExistingRubric(token);
                // Show success message after UI has updated
                setTimeout(() => {
                    alert('Rubric deleted successfully');
                }, 100);
            } else {
                const error = await response.json();
                // Restore previous state if deletion failed
                setExistingRubric(previousRubric);
                alert('Failed to delete rubric: ' + (error.detail || 'Unknown error'));
                // Refresh to get actual state
                await fetchExistingRubric(token);
            }
        } catch (error) {
            // Restore previous state if deletion failed
            setExistingRubric(previousRubric);
            alert('Error deleting rubric: ' + error.message);
            // Refresh to get actual state
            const token = localStorage.getItem('access_token');
            await fetchExistingRubric(token);
        }
    };

    // Approve enrollment
    const handleApproveEnrollment = async (enrollmentId) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/enrollment/${enrollmentId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.msg);
                // Refresh data
                fetchPendingEnrollments(token);
                fetchClassDetails(token);
            } else {
                const error = await response.json();
                alert('Failed to approve: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error approving enrollment: ' + error.message);
        }
    };

    // Reject enrollment
    const handleRejectEnrollment = async (enrollmentId) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/enrollment/${enrollmentId}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.msg);
                // Refresh data
                fetchPendingEnrollments(token);
                fetchClassDetails(token);
            } else {
                const error = await response.json();
                alert('Failed to reject: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error rejecting enrollment: ' + error.message);
        }
    };

    const fetchAssignmentFeedback = async (scriptId) => {
        setLoadingFeedback(true);
        try {
            const token = localStorage.getItem('access_token');
            console.log(`🔍 Fetching feedback for script ${scriptId} in class ${classId}`);

            // ✅ Load feedback FIRST (fast with cache) - User sees it immediately!
            const feedbackResponse = await fetch(`${API_BASE}/assignment/${scriptId}/feedback?class_id=${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let feedbackData = null;

            if (feedbackResponse.ok) {
                feedbackData = await feedbackResponse.json();
                console.log('📊 Feedback received:', feedbackData);
                
                // Set feedback immediately - user sees it right away!
                setFeedbackData({
                    ...feedbackData,
                    plagiarism: null  // Will load separately
                });
                
                if (user?.role === 'lecturer') {
                    setManualScore(
                        feedbackData.manual_score === null || feedbackData.manual_score === undefined
                            ? ''
                            : String(feedbackData.manual_score)
                    );
                    setManualComment(feedbackData.lecturer_comment || '');
                    setCurrentEvaluationId(feedbackData.evaluation_id || null);
                    setReviewStatus(feedbackData.review_status || feedbackData.feedback_status || null);
                } else {
                    setManualScore('');
                    setManualComment('');
                    setCurrentEvaluationId(null);
                    setReviewStatus(feedbackData.review_status || feedbackData.feedback_status || null);
                }
            } else {
                console.error('Failed to fetch feedback:', feedbackResponse.status);
                let errorMessage = `Failed to load feedback: ${feedbackResponse.status} ${feedbackResponse.statusText}`;
                try {
                    const errorJson = await feedbackResponse.json();
                    errorMessage = errorJson.detail || errorMessage;
                } catch (err) {
                    const errorText = await feedbackResponse.text();
                    console.error('Error details:', errorText);
                }

                setManualScore('');
                setManualComment('');
                setCurrentEvaluationId(null);
                setReviewStatus('pending');

                feedbackData = {
                    error: errorMessage
                };
                setFeedbackData(feedbackData);
            }

            // ✅ Load plagiarism in background (non-blocking) - User already sees feedback!
            // This doesn't block the UI - plagiarism loads separately
            setTimeout(async () => {
                try {
                    const plagiarismResponse = await fetch(`${API_BASE}/assignment/${scriptId}/plagiarism?limit=5`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (plagiarismResponse.ok) {
                        const plagiarismData = await plagiarismResponse.json();
                        console.log('🔍 Plagiarism data received:', plagiarismData);
                        // Update feedback data with plagiarism (non-blocking)
                        setFeedbackData(prev => ({
                            ...prev,
                            plagiarism: plagiarismData
                        }));
                    } else {
                        console.log('No plagiarism data available for this assignment');
                    }
                } catch (error) {
                    console.log('Plagiarism check skipped (non-critical):', error);
                    // Don't show error - plagiarism is optional
                }
            }, 100);  // Small delay to show feedback first

        } catch (error) {
            console.error('Error fetching feedback:', error);
            setFeedbackData({
                error: "Could not load feedback at this time: " + error.message
            });
        } finally {
            setLoadingFeedback(false);  // Hide loading - feedback is ready!
        }
    };

    const handleSaveManualReview = async () => {
        if (!selectedAssignment || user?.role !== 'lecturer') return;

        setSavingReview(true);
        try {
            const token = localStorage.getItem('access_token');
            const scoreValue = manualScore === '' ? null : Number(manualScore);
            if (scoreValue !== null && (Number.isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100)) {
                throw new Error('Score must be between 0 and 100');
            }

            const payload = {
                score: scoreValue,
                comment: manualComment && manualComment.trim() ? manualComment : null
            };

            const response = await fetch(`${API_BASE}/assignment/${selectedAssignment.script_id}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to save review');
            }

            alert(data.message || 'Review saved');
            setCurrentEvaluationId(data.evaluation_id || null);
            setReviewStatus(data.review_status || 'pending');
            fetchAssignmentFeedback(selectedAssignment.script_id);
        } catch (error) {
            alert(error.message || 'Failed to save review');
        } finally {
            setSavingReview(false);
        }
    };

    const handleApproveReview = async () => {
        if (!selectedAssignment || user?.role !== 'lecturer') return;
        if (!currentEvaluationId) {
            alert('Please save your review before approving.');
            return;
        }

        setApprovingReview(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/evaluation/${currentEvaluationId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to approve evaluation');
            }

            alert(data.msg || 'Evaluation approved');
            setReviewStatus('approved');
            fetchAssignmentFeedback(selectedAssignment.script_id);
        } catch (error) {
            alert(error.message || 'Failed to approve evaluation');
        } finally {
            setApprovingReview(false);
        }
    };

    const handleAssignmentClick = (assignment) => {
        setSelectedAssignment(assignment);
        setShowFeedbackModal(true);
        setFeedbackData(null);
        setManualScore('');
        setManualComment('');
        setCurrentEvaluationId(null);
        setReviewStatus(null);
        fetchAssignmentFeedback(assignment.script_id);
    };

    // Highlighted Text Component
    const HighlightedText = ({ originalText, errors }) => {
        const [hoveredError, setHoveredError] = useState(null);

        useEffect(() => {
            const style = document.createElement('style');
            style.id = 'grammar-error-styles';
            style.textContent = `
                    .grammar-error {
                        background-color: #fee2e2;
                        border-bottom: 2px wavy #dc2626;
                        cursor: help;
                        position: relative;
                        padding: 1px 2px;
                        border-radius: 2px;
                    }
                    .grammar-error:hover {
                        background-color: #fecaca;
                    }
                `;

            if (!document.getElementById('grammar-error-styles')) {
                document.head.appendChild(style);
            }

            return () => {
                const existingStyle = document.getElementById('grammar-error-styles');
                if (existingStyle) {
                    document.head.removeChild(existingStyle);
                }
            };
        }, []);

        const renderTextWithHighlights = () => {
            if (!originalText || !errors || errors.length === 0) {
                return <span>{originalText}</span>;
            }

            let result = [];
            let lastIndex = 0;
            const sortedErrors = [...errors].sort((a, b) => {
                const offsetA = a.offset || originalText.indexOf(a.error_text || '') || 0;
                const offsetB = b.offset || originalText.indexOf(b.error_text || '') || 0;
                return offsetA - offsetB;
            });

            sortedErrors.forEach((error, index) => {
                const errorText = error.error_text || '';
                if (errorText) {
                    const errorIndex = originalText.indexOf(errorText, lastIndex);
                    if (errorIndex !== -1 && errorIndex >= lastIndex) {
                        if (errorIndex > lastIndex) {
                            result.push(
                                <span key={`text-${index}`}>
                                    {originalText.substring(lastIndex, errorIndex)}
                                </span>
                            );
                        }

                        result.push(
                            <span
                                key={`error-${index}`}
                                className="grammar-error"
                                onMouseEnter={() => setHoveredError(index)}
                                onMouseLeave={() => setHoveredError(null)}
                                style={{
                                    backgroundColor: '#fee2e2',
                                    borderBottom: '2px wavy #dc2626',
                                    cursor: 'help',
                                    position: 'relative',
                                    padding: '1px 2px',
                                    borderRadius: '2px'
                                }}
                            >
                                {errorText}
                                {hoveredError === index && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#1f2937',
                                            color: 'white',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            whiteSpace: 'normal',
                                            zIndex: 1000,
                                            marginBottom: '5px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            maxWidth: '300px',
                                            minWidth: '200px'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                            {error.category}: {error.message}
                                        </div>
                                        {error.suggestions && error.suggestions.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                                                💡 Try: {error.suggestions.slice(0, 2).join(', ')}
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '5px solid transparent',
                                                borderRight: '5px solid transparent',
                                                borderTop: '5px solid #1f2937'
                                            }}
                                        />
                                    </div>
                                )}
                            </span>
                        );

                        lastIndex = errorIndex + errorText.length;
                    }
                }
            });

            if (lastIndex < originalText.length) {
                result.push(
                    <span key="remaining">
                        {originalText.substring(lastIndex)}
                    </span>
                );
            }

            return result;
        };

        return (
            <div style={{
                lineHeight: '1.8',
                fontSize: '1rem',
                fontFamily: 'Georgia, serif',
                padding: '15px',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                {renderTextWithHighlights()}
            </div>
        );
    };

    // File handling functions
    const handleFileSelect = (selectedFile) => {
        console.log('File selected:', selectedFile);
        setFile(selectedFile);
        setUploadResult(null);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const isRubric = user?.role === 'lecturer';

        if (!assignmentTitle.trim() && !isRubric) {
            alert('Please enter an assignment title');
            return;
        }

        if (!rubricTitle.trim() && isRubric) {
            alert('Please enter a rubric title');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        if (isRubric) {
            formData.append('rubric_title', rubricTitle);
            formData.append('assignment_title', assignmentTitle || 'General Rubric');
            // If rubric exists, allow replacement
            if (existingRubric) {
                formData.append('replace_existing', 'true');
            }
        } else {
            formData.append('assignment_title', assignmentTitle);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            setUploading(false);
            alert('⏰ Upload timeout! Please try again with a smaller file.');
        }, 30000);

        try {
            const token = localStorage.getItem('access_token');
            const endpoint = isRubric
                ? `/class/${classId}/upload-rubric/`
                : `/class/${classId}/upload-answer-script/`;

            console.log('🚀 Starting upload...', {
                file: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
            });

            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Upload successful:', result);

                setUploadResult(result);
                setFile(null);
                setAssignmentTitle('');
                setRubricTitle('');

                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';

                fetchAssignments(token);
                
                // Refresh rubric status if it was a rubric upload
                if (isRubric) {
                    fetchExistingRubric(token);
                }

                alert(isRubric ? '✅ Rubric uploaded successfully!' : '✅ Assignment submitted successfully!');
            } else {
                const error = await response.json();
                alert('❌ Upload failed: ' + (error.detail || error.error || 'Unknown error'));
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Upload error:', error);

            if (error.name === 'AbortError') {
                alert('⏰ Upload cancelled due to timeout');
            } else {
                alert('❌ Upload error: ' + error.message);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileInputChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const triggerFileInput = () => {
        if (!uploading) {
            document.getElementById('fileInput').click();
        }
    };

    const isUploadDisabled = () => {
        if (uploading || !file) return true;

        const isRubric = user?.role === 'lecturer';
        if (isRubric && !rubricTitle.trim()) return true;
        if (!isRubric && !assignmentTitle.trim()) return true;

        return false;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    fontSize: '2rem',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    Loading class details...
                </div>
            </div>
        );
    }

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        nav: {
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        userMenu: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            background: 'rgba(255,255,255,0.1)',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer'
        },
        main: {
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        breadcrumb: {
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '20px',
            cursor: 'pointer'
        },
        classHeader: {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            color: 'white',
            textAlign: 'center'
        },
        className: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '10px'
        },
        classInfo: {
            fontSize: '1.1rem',
            opacity: 0.9
        },
        uploadSection: {
            display: 'grid',
            gridTemplateColumns: user?.role === 'lecturer' ? '1fr 1fr' : '1fr',
            gap: '30px',
            marginBottom: '40px'
        },
        card: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
        uploadCard: {
            textAlign: 'center',
            border: dragOver ? '2px dashed #3b82f6' : '2px dashed #e5e7eb',
            background: dragOver ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.95)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        },
        uploadTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '1rem',
            boxSizing: 'border-box'
        },
        fileDropArea: {
            padding: '40px 20px',
            border: dragOver ? '2px dashed #3b82f6' : '2px dashed #e5e7eb',
            borderRadius: '12px',
            background: dragOver ? 'rgba(59, 130, 246, 0.05)' : '#f9fafb',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
        },
        uploadButton: {
            background: isUploadDisabled() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isUploadDisabled() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            marginTop: '10px'
        },
        hiddenInput: {
            display: 'none'
        },
        fileSelected: {
            color: '#10b981',
            fontWeight: '600',
            marginBottom: '15px',
            padding: '10px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
        },
        assignmentsList: {
            marginTop: '30px'
        },
        assignmentItem: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f3f4f6'
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '5px'
        },
        feedbackSection: {
            marginBottom: '25px'
        },
        feedbackTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        scoreDisplay: {
            display: 'inline-block',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1.1rem'
        },
        feedbackText: {
            background: '#f9fafb',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            lineHeight: '1.6',
            marginTop: '10px'
        },
        suggestionsList: {
            background: '#fef3c7',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #f59e0b'
        },
        clickHint: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#3b82f6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/userpage')}>
                    <span>🤖</span>
                    AAAS
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}>
                        🏠 Home
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}>
                        📚 Classes
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/analytics')}>
                        📊 Analytics
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/contact')}>
                        📞 Contact
                    </div>
                </nav>
                <div style={styles.userMenu} onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }}>
                    <span>👤</span>
                    <span>{user?.name}</span>
                    <span style={{ fontSize: '0.8rem' }}>Logout</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.breadcrumb} onClick={() => navigate('/classes')}>
                    ← Back to Classes
                </div>

                {/* Class Header */}
                <div style={styles.classHeader}>
                    <h1 style={styles.className}>{classData?.class_name}</h1>
                    <p style={styles.classInfo}>
                        {user?.role === 'lecturer'
                            ? `${classData?.student_count} Students Enrolled`
                            : `Instructor: ${classData?.lecturer_name}`
                        }
                    </p>
                </div>

                {/* Upload Section */}
                <div style={styles.uploadSection}>
                    {/* Upload Card */}
                    <div style={{ ...styles.card, ...styles.uploadCard }}>
                        <h3 style={styles.uploadTitle}>
                            {user?.role === 'lecturer' ? '📋 Upload Rubric' : '📝 Submit Assignment'}
                        </h3>

                        {/* Show existing rubric for lecturers */}
                        {user?.role === 'lecturer' && existingRubric && (
                            <div style={{
                                background: '#fef3c7',
                                border: '2px solid #f59e0b',
                                borderRadius: '12px',
                                padding: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div>
                                        <strong style={{ color: '#92400e', fontSize: '1.1rem' }}>
                                            ✅ Rubric Already Uploaded
                                        </strong>
                                        <p style={{ margin: '5px 0 0 0', color: '#78350f', fontSize: '0.9rem' }}>
                                            <strong>Title:</strong> {existingRubric.rubric_title}
                                            {existingRubric.assignment_title && (
                                                <> • <strong>Assignment:</strong> {existingRubric.assignment_title}</>
                                            )}
                                        </p>
                                        {existingRubric.created_at && (
                                            <p style={{ margin: '5px 0 0 0', color: '#78350f', fontSize: '0.85rem' }}>
                                                Uploaded: {new Date(existingRubric.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleDeleteRubric(existingRubric.rubric_id)}
                                            style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Keep existingRubric so next upload replaces it (replace_existing=true)
                                                // Just clear the file + titles to prompt user to select a new rubric
                                                if (window.confirm('Upload a new file to replace the existing rubric?')) {
                                                    setFile(null);
                                                    setRubricTitle('');
                                                    setAssignmentTitle('');
                                                }
                                            }}
                                            style={{
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            🔄 Change
                                        </button>
                                    </div>
                                </div>
                                <p style={{ margin: '10px 0 0 0', color: '#78350f', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    💡 To replace this rubric, click "Change" and upload a new file. To delete it, click "Delete".
                                </p>
                            </div>
                        )}

                        {/* Title Input */}
                        <input
                            type="text"
                            placeholder={user?.role === 'lecturer' ? 'Rubric Title' : 'Assignment Title'}
                            value={user?.role === 'lecturer' ? rubricTitle : assignmentTitle}
                            onChange={(e) => {
                                if (user?.role === 'lecturer') {
                                    setRubricTitle(e.target.value);
                                } else {
                                    setAssignmentTitle(e.target.value);
                                }
                            }}
                            style={styles.input}
                        />

                        {/* Additional Assignment Title for Lecturers */}
                        {user?.role === 'lecturer' && (
                            <input
                                type="text"
                                placeholder="Assignment Title (optional)"
                                value={assignmentTitle}
                                onChange={(e) => setAssignmentTitle(e.target.value)}
                                style={styles.input}
                            />
                        )}

                        {/* File Drop Area */}
                        <div
                            style={styles.fileDropArea}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={triggerFileInput}
                        >
                            <p style={{ margin: '0 0 10px 0', color: '#6b7280' }}>
                                📁 Drag & drop your file here or click to browse
                            </p>
                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#9ca3af' }}>
                                Supports: PDF, DOCX, TXT, Images
                            </p>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            id="fileInput"
                            type="file"
                            onChange={handleFileInputChange}
                            style={styles.hiddenInput}
                            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                        />

                        {/* File Selected Indicator */}
                        {file && (
                            <div style={styles.fileSelected}>
                                ✓ Selected: {file.name}
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            style={styles.uploadButton}
                            onClick={handleFileUpload}
                            disabled={isUploadDisabled()}
                        >
                            {uploading ? '⏳ Processing...' : '🚀 Upload'}
                        </button>
                    </div>

                    {/* Show additional info for lecturers */}
                    {user?.role === 'lecturer' && (
                        <div style={styles.card}>
                            <h3 style={styles.uploadTitle}>📊 Class Overview</h3>
                            <div style={{ textAlign: 'left' }}>
                                <p><strong>Total Students:</strong> {classData?.student_count}</p>
                                <p><strong>Recent Activity:</strong> {classData?.recent_activity_count} submissions</p>
                                <p><strong>Enrollment Code:</strong> <code>{classData?.enrollment_code}</code></p>

                                {/* Pending Enrollments Section */}
                                {pendingEnrollments.length > 0 && (
                                    <div style={{ marginTop: '15px', padding: '15px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#92400e' }}>
                                            📋 Pending Enrollment Requests: {pendingEnrollments.length}
                                        </p>
                                        <button
                                            style={{
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                            onClick={() => setShowPendingModal(true)}
                                        >
                                            Review Requests
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Plagiarism Detection Section - FOR LECTURERS */}
                <PlagiarismSection
                    user={user}
                    assignments={assignments}
                    plagiarismResults={plagiarismResults}
                    isCheckingPlagiarism={isCheckingPlagiarism}
                    allowStudentView={allowStudentView}
                    canCheckPlagiarism={canCheckPlagiarism}
                    plagiarismStats={plagiarismStats}
                    checkPlagiarism={checkPlagiarism}
                    setShowPlagiarismModal={setShowPlagiarismModal}
                    setAllowStudentView={setAllowStudentView}
                />

                {/* Student Plagiarism Status Card - FOR STUDENTS */}
                <StudentPlagiarismCard
                    user={user}
                    allowStudentView={allowStudentView}
                    getStudentPlagiarismStatus={getStudentPlagiarismStatus}
                />

                {/* Assignments/Submissions List */}
                <div style={styles.assignmentsList}>
                    <h3 style={{ color: 'white', marginBottom: '20px' }}>
                        {user?.role === 'lecturer' ? '📋 Student Submissions' : '📝 Your Submissions'}
                    </h3>

                    {assignments.length === 0 ? (
                        <div style={styles.card}>
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                                No submissions yet
                            </p>
                        </div>
                    ) : (
                        assignments.map(assignment => (
                            <div
                                key={assignment.script_id}
                                style={styles.assignmentItem}
                                onClick={() => handleAssignmentClick(assignment)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                                }}
                            >
                                <div style={styles.clickHint}>👁️ View Feedback</div>
                                <h4>{assignment.assignment_title || 'Untitled Assignment'}</h4>
                                <p><strong>Student ID:</strong> {assignment.student_id}</p>
                                <p><strong>Submitted:</strong> {new Date(assignment.submitted_at).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {assignment.status}</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                    {assignment.content_preview || "Click to view full content and feedback"}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Rubrics List (for lecturers) */}
                {user?.role === 'lecturer' && rubrics.length > 0 && (
                    <div style={styles.assignmentsList}>
                        <h3 style={{ color: 'white', marginBottom: '20px' }}>📋 Uploaded Rubrics</h3>
                        {rubrics.map(rubric => (
                            <div key={rubric.rubric_id} style={styles.assignmentItem}>
                                <h4>{rubric.title}</h4>
                                <p><strong>Created:</strong> {new Date(rubric.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* PLAGIARISM MODAL */}
            <PlagiarismModal
                showPlagiarismModal={showPlagiarismModal}
                plagiarismResults={plagiarismResults}
                plagiarismStats={plagiarismStats}
                setShowPlagiarismModal={setShowPlagiarismModal}
            />

            {/* FEEDBACK MODAL */}
            {showFeedbackModal && (
                <div style={styles.modal} onClick={() => setShowFeedbackModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                📊 Assignment Feedback
                            </h2>
                            <button
                                style={styles.closeButton}
                                onClick={() => setShowFeedbackModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingFeedback ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
                                <p>Loading feedback and plagiarism data...</p>
                            </div>
                        ) : feedbackData ? (
                            <div>
                                {feedbackData.error ? (
                                    <div style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        color: '#dc2626'
                                    }}>
                                        ❌ {feedbackData.error}
                                    </div>
                                ) : (
                                    <>
                                        {/* Assignment Info */}
                                        <div style={styles.feedbackSection}>
                                            <h3 style={styles.feedbackTitle}>
                                                📝 {selectedAssignment?.assignment_title || 'Assignment'}
                                            </h3>
                                            <p><strong>Student:</strong> {selectedAssignment?.student_id}</p>
                                            <p><strong>Submitted:</strong> {new Date(selectedAssignment?.submitted_at).toLocaleString()}</p>
                                            <p><strong>Status:</strong> {selectedAssignment?.status}</p>
                                        </div>

                                        {/* PLAGIARISM SECTION FOR THIS STUDENT */}
                                        {feedbackData.plagiarism && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>🔍 Plagiarism Analysis</h3>
                                                <div style={{
                                                    background: feedbackData.plagiarism.similarity_percentage > 60 ? '#fef2f2' :
                                                        feedbackData.plagiarism.similarity_percentage > 30 ? '#fefbf2' : '#f0fdf4',
                                                    border: `1px solid ${feedbackData.plagiarism.similarity_percentage > 60 ? '#fecaca' :
                                                        feedbackData.plagiarism.similarity_percentage > 30 ? '#fed7aa' : '#bbf7d0'}`,
                                                    borderRadius: '8px',
                                                    padding: '15px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                        <div style={{
                                                            fontSize: '2rem',
                                                            fontWeight: 'bold',
                                                            color: feedbackData.plagiarism.similarity_percentage > 60 ? '#dc2626' :
                                                                feedbackData.plagiarism.similarity_percentage > 30 ? '#d97706' : '#059669'
                                                        }}>
                                                            {feedbackData.plagiarism.similarity_percentage}%
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                                Similarity Score
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                                {feedbackData.plagiarism.similarity_percentage > 60 ? '🔴 High Risk' :
                                                                    feedbackData.plagiarism.similarity_percentage > 30 ? '🟡 Medium Risk' : '🟢 Low Risk'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Similar assignments found */}
                                                    {feedbackData.plagiarism.similar_assignments && feedbackData.plagiarism.similar_assignments.length > 0 && (
                                                        <div style={{ marginTop: '15px' }}>
                                                            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Similar to:</h4>
                                                            {feedbackData.plagiarism.similar_assignments.map((similar, index) => (
                                                                <div key={index} style={{
                                                                    background: 'rgba(255,255,255,0.5)',
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    marginBottom: '5px',
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    <strong>Student {similar.student_id}</strong> - {similar.similarity}% similar
                                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                                        {similar.assignment_title} (Submitted: {new Date(similar.submitted_at).toLocaleDateString()})
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Show matched text snippets if available */}
                                                    {feedbackData.plagiarism.matched_snippets && feedbackData.plagiarism.matched_snippets.length > 0 && (
                                                        <div style={{ marginTop: '15px' }}>
                                                            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Similar Text Found:</h4>
                                                            {feedbackData.plagiarism.matched_snippets.slice(0, 3).map((snippet, index) => (
                                                                <div key={index} style={{
                                                                    background: 'rgba(255,255,255,0.7)',
                                                                    padding: '10px',
                                                                    borderRadius: '6px',
                                                                    marginBottom: '8px',
                                                                    fontStyle: 'italic',
                                                                    fontSize: '0.9rem',
                                                                    borderLeft: '4px solid #dc2626'
                                                                }}>
                                                                    "{snippet.text}"
                                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                                                                        {snippet.similarity}% match with Student {snippet.matched_student}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* No plagiarism data available */}
                                        {!feedbackData.plagiarism && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>🔍 Plagiarism Analysis</h3>
                                                <div style={{
                                                    background: '#f3f4f6',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    padding: '15px',
                                                    textAlign: 'center',
                                                    color: '#6b7280'
                                                }}>
                                                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍</div>
                                                    <p>Plagiarism check not run yet for this assignment.</p>
                                                    <p style={{ fontSize: '0.9rem' }}>Ask your instructor to run a plagiarism check.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Suggested Score - Always shown first */}
                                        {feedbackData.ai_score !== undefined && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>🤖 AI Suggested Score</h3>
                                                <div style={{
                                                    ...styles.scoreDisplay,
                                                    background: feedbackData.manual_score !== null && feedbackData.manual_score !== undefined
                                                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'  // Orange if overridden
                                                        : 'linear-gradient(135deg, #10b981, #059669)'  // Green if active
                                                }}>
                                                    {feedbackData.ai_score}/100
                                                </div>
                                                {feedbackData.manual_score !== null && feedbackData.manual_score !== undefined && (
                                                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                                                        ⚠️ Overridden by lecturer's manual score
                                                    </p>
                                                )}
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>
                                                    Based on grammar, spelling, and writing quality analysis
                                                </p>
                                            </div>
                                        )}

                                        {/* Final Score (Manual if provided, otherwise AI) */}
                                        {feedbackData.score !== undefined && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>
                                                    {feedbackData.manual_score !== null && feedbackData.manual_score !== undefined
                                                        ? '✅ Final Score (Lecturer Review)'
                                                        : '🎯 Final Score'}
                                                </h3>
                                                <div style={{
                                                    ...styles.scoreDisplay,
                                                    background: feedbackData.manual_score !== null && feedbackData.manual_score !== undefined
                                                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'  // Blue for manual
                                                        : 'linear-gradient(135deg, #10b981, #059669)'  // Green for AI
                                                }}>
                                                    {feedbackData.score}/100
                                                </div>
                                                {feedbackData.manual_score === null || feedbackData.manual_score === undefined ? (
                                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>
                                                        Currently using AI suggested score. Lecturer can override with manual score.
                                                    </p>
                                                ) : (
                                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>
                                                        ✅ Lecturer has reviewed and set this score
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Original Text with Highlighted Mistakes */}
                                        <div style={styles.feedbackSection}>
                                            <h3 style={styles.feedbackTitle}>📄 Your Text with Highlighted Mistakes</h3>
                                            <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#6b7280' }}>
                                                💡 Hover over <span style={{
                                                    backgroundColor: '#fee2e2',
                                                    borderBottom: '2px wavy #dc2626',
                                                    padding: '1px 3px',
                                                    borderRadius: '2px'
                                                }}>underlined text</span> to see suggestions
                                            </div>
                                            <HighlightedText
                                                originalText={feedbackData.content}
                                                errors={feedbackData.languagetool_details || []}
                                            />
                                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
                                                📊 Word count: {feedbackData.content ? feedbackData.content.split(' ').length : 0} words
                                                {feedbackData.languagetool_details && (
                                                    <> • 🚩 {feedbackData.languagetool_details.length} issues found</>
                                                )}
                                            </p>
                                        </div>

                                        {/* Grammar Feedback - Detailed List */}
                                        {feedbackData.languagetool_details && feedbackData.languagetool_details.length > 0 && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>❌ Detailed Issues List</h3>
                                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    {feedbackData.languagetool_details.slice(0, 10).map((error, index) => (
                                                        <div key={index} style={{
                                                            background: '#fef2f2',
                                                            border: '1px solid #fecaca',
                                                            borderRadius: '8px',
                                                            padding: '12px',
                                                            marginBottom: '10px'
                                                        }}>
                                                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#dc2626' }}>
                                                                🚩 {error.category}: {error.message}
                                                            </p>
                                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                                                                <strong>Found:</strong> "<span style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: '4px' }}>{error.error_text}</span>"
                                                            </p>
                                                            {error.suggestions && error.suggestions.length > 0 && (
                                                                <p style={{ margin: '0', fontSize: '0.9rem', color: '#059669' }}>
                                                                    <strong>Suggestions:</strong> {error.suggestions.slice(0, 3).join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {feedbackData.languagetool_details.length > 10 && (
                                                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                                            ... and {feedbackData.languagetool_details.length - 10} more issues
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Corrected Version Comparison */}
                                        {feedbackData.languagetool_corrected && feedbackData.languagetool_corrected !== feedbackData.content && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>✅ Grammar Corrections</h3>
                                                <div style={{
                                                    ...styles.feedbackText,
                                                    background: '#f0fdf4',
                                                    border: '1px solid #bbf7d0'
                                                }}>
                                                    {feedbackData.languagetool_corrected}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Enhanced Version */}
                                        {feedbackData.t5_corrected && feedbackData.t5_corrected !== feedbackData.content && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>🤖 AI Enhanced Version</h3>
                                                <div style={{
                                                    ...styles.feedbackText,
                                                    background: '#eff6ff',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                    {feedbackData.t5_corrected}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {feedbackData.suggestions && feedbackData.suggestions.length > 0 && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>💡 Suggestions for Improvement</h3>
                                                <div style={styles.suggestionsList}>
                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                        {feedbackData.suggestions.map((suggestion, index) => (
                                                            <li key={index} style={{ marginBottom: '5px' }}>
                                                                {suggestion}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {user?.role === 'student' && feedbackData.lecturer_comment && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>👨‍🏫 Lecturer Comment</h3>
                                                <div style={{
                                                    background: '#f5f5f5',
                                                    borderRadius: '8px',
                                                    padding: '15px',
                                                    border: '1px solid #e5e7eb',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {feedbackData.lecturer_comment}
                                                </div>
                                                {feedbackData.manual_last_updated && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
                                                        Last updated: {new Date(feedbackData.manual_last_updated).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {user?.role === 'lecturer' && (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>👨‍🏫 Lecturer Review</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <label style={{ fontWeight: '600', color: '#1f2937' }}>Manual Score (0-100)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={manualScore === null ? '' : manualScore}
                                                        onChange={(e) => setManualScore(e.target.value)}
                                                        style={{
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #d1d5db',
                                                            fontSize: '1rem'
                                                        }}
                                                    />

                                                    <label style={{ fontWeight: '600', color: '#1f2937' }}>Comment for Student</label>
                                                    <textarea
                                                        rows={4}
                                                        value={manualComment}
                                                        onChange={(e) => setManualComment(e.target.value)}
                                                        placeholder="Share personalized feedback for the student"
                                                        style={{
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #d1d5db',
                                                            fontSize: '1rem',
                                                            resize: 'vertical'
                                                        }}
                                                    />

                                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={handleSaveManualReview}
                                                            disabled={savingReview}
                                                            style={{
                                                                background: '#3b82f6',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '10px 18px',
                                                                borderRadius: '8px',
                                                                fontWeight: '600',
                                                                cursor: savingReview ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            {savingReview ? 'Saving...' : '💾 Save Review'}
                                                        </button>
                                                        <button
                                                            onClick={handleApproveReview}
                                                            disabled={approvingReview || !currentEvaluationId}
                                                            style={{
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '10px 18px',
                                                                borderRadius: '8px',
                                                                fontWeight: '600',
                                                                cursor: approvingReview || !currentEvaluationId ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            {approvingReview ? 'Approving...' : '✅ Approve for Student'}
                                                        </button>
                                                    </div>

                                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                        Current status: {(reviewStatus || 'pending').toString().toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rubric Assessment - OpenAI Evaluation */}
                                        {feedbackData.rubric_assessment ? (
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>
                                                    📋 Rubric-Based Evaluation {feedbackData.rubric_method && `(${feedbackData.rubric_method})`}
                                                </h3>
                                                {feedbackData.rubric_score !== null && feedbackData.rubric_score !== undefined && (
                                                    <div style={{
                                                        display: 'inline-block',
                                                        background: feedbackData.rubric_score >= 80 ? 'linear-gradient(135deg, #10b981, #059669)' :
                                                            feedbackData.rubric_score >= 60 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                                            'linear-gradient(135deg, #ef4444, #dc2626)',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem',
                                                        marginBottom: '15px'
                                                    }}>
                                                        Rubric Score: {feedbackData.rubric_score}/100
                                                    </div>
                                                )}
                                                
                                                {/* ✅ PROMINENT: What Student Followed vs Not Followed */}
                                                {feedbackData.rubric_criteria && feedbackData.rubric_criteria.length > 0 && (
                                                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                            {/* Criteria Followed */}
                                                            <div style={{
                                                                background: '#f0fdf4',
                                                                border: '2px solid #10b981',
                                                                borderRadius: '12px',
                                                                padding: '20px'
                                                            }}>
                                                                <h4 style={{ 
                                                                    color: '#059669', 
                                                                    marginBottom: '15px', 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    ✅ Criteria FOLLOWED
                                                                </h4>
                                                                {feedbackData.rubric_criteria.filter(c => c.followed === true || (c.followed === undefined && c.score >= 70)).length > 0 ? (
                                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                        {feedbackData.rubric_criteria
                                                                            .filter(c => c.followed === true || (c.followed === undefined && c.score >= 70))
                                                                            .map((criterion, index) => (
                                                                                <li key={index} style={{ 
                                                                                    color: '#059669', 
                                                                                    marginBottom: '8px',
                                                                                    fontWeight: '600'
                                                                                }}>
                                                                                    {criterion.criterion || `Criterion ${index + 1}`} ({criterion.score}/100)
                                                                                </li>
                                                                            ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No criteria fully followed</p>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Criteria NOT Followed */}
                                                            <div style={{
                                                                background: '#fef2f2',
                                                                border: '2px solid #ef4444',
                                                                borderRadius: '12px',
                                                                padding: '20px'
                                                            }}>
                                                                <h4 style={{ 
                                                                    color: '#dc2626', 
                                                                    marginBottom: '15px', 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    ❌ Criteria NOT FOLLOWED
                                                                </h4>
                                                                {feedbackData.rubric_criteria.filter(c => c.followed === false || (c.followed === undefined && c.score < 40)).length > 0 ? (
                                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                        {feedbackData.rubric_criteria
                                                                            .filter(c => c.followed === false || (c.followed === undefined && c.score < 40))
                                                                            .map((criterion, index) => (
                                                                                <li key={index} style={{ 
                                                                                    color: '#dc2626', 
                                                                                    marginBottom: '8px',
                                                                                    fontWeight: '600'
                                                                                }}>
                                                                                    {criterion.criterion || `Criterion ${index + 1}`} ({criterion.score}/100)
                                                                                </li>
                                                                            ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>All criteria followed!</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Partially Followed */}
                                                        {feedbackData.rubric_criteria.filter(c => c.followed === null || (c.followed === undefined && c.score >= 40 && c.score < 70)).length > 0 && (
                                                            <div style={{
                                                                background: '#fffbeb',
                                                                border: '2px solid #f59e0b',
                                                                borderRadius: '12px',
                                                                padding: '20px',
                                                                marginTop: '15px'
                                                            }}>
                                                                <h4 style={{ 
                                                                    color: '#d97706', 
                                                                    marginBottom: '15px', 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    ⚠️ Criteria PARTIALLY FOLLOWED
                                                                </h4>
                                                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                    {feedbackData.rubric_criteria
                                                                        .filter(c => c.followed === null || (c.followed === undefined && c.score >= 40 && c.score < 70))
                                                                        .map((criterion, index) => (
                                                                            <li key={index} style={{ 
                                                                                color: '#d97706', 
                                                                                marginBottom: '8px',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {criterion.criterion || `Criterion ${index + 1}`} ({criterion.score}/100)
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Summary if available */}
                                                {feedbackData.rubric_summary && (
                                                    <div style={{
                                                        background: '#f0f9ff',
                                                        border: '1px solid #bae6fd',
                                                        borderRadius: '8px',
                                                        padding: '15px',
                                                        marginBottom: '15px'
                                                    }}>
                                                        <h4 style={{ marginBottom: '10px', color: '#0369a1' }}>📊 Criteria Summary:</h4>
                                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                            <div>
                                                                <strong style={{ color: '#059669' }}>✅ Fully Followed:</strong> {feedbackData.rubric_summary.criteria_followed || 0}/{feedbackData.rubric_summary.total_criteria || 0}
                                                            </div>
                                                            <div>
                                                                <strong style={{ color: '#f59e0b' }}>⚠️ Partially Followed:</strong> {feedbackData.rubric_summary.criteria_partially_followed || 0}/{feedbackData.rubric_summary.total_criteria || 0}
                                                            </div>
                                                            <div>
                                                                <strong style={{ color: '#ef4444' }}>❌ Not Followed:</strong> {feedbackData.rubric_summary.criteria_not_followed || 0}/{feedbackData.rubric_summary.total_criteria || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Detailed Criteria Evaluation with Followed/Not Followed Status */}
                                                {feedbackData.rubric_criteria && feedbackData.rubric_criteria.length > 0 && (
                                                    <div style={{ marginTop: '20px' }}>
                                                        <h4 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '1.2rem' }}>📋 Detailed Criteria Evaluation:</h4>
                                                        {feedbackData.rubric_criteria.map((criterion, index) => {
                                                            const followed = criterion.followed !== undefined ? criterion.followed : (criterion.score >= 70);
                                                            return (
                                                                <div key={index} style={{
                                                                    background: followed ? '#f0fdf4' : criterion.score >= 50 ? '#fffbeb' : '#fef2f2',
                                                                    border: `2px solid ${followed ? '#10b981' : criterion.score >= 50 ? '#f59e0b' : '#ef4444'}`,
                                                                    borderRadius: '12px',
                                                                    padding: '20px',
                                                                    marginBottom: '15px'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                                                <strong style={{ color: '#1f2937', fontSize: '1.1rem' }}>
                                                                                    {criterion.criterion || `Criterion ${index + 1}`}
                                                                                </strong>
                                                                                <span style={{
                                                                                    background: followed ? '#10b981' : criterion.score >= 50 ? '#f59e0b' : '#ef4444',
                                                                                    color: 'white',
                                                                                    padding: '4px 12px',
                                                                                    borderRadius: '12px',
                                                                                    fontSize: '0.85rem',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    {followed ? '✅ FOLLOWED' : criterion.score >= 50 ? '⚠️ PARTIALLY FOLLOWED' : '❌ NOT FOLLOWED'}
                                                                                </span>
                                                                            </div>
                                                                            <span style={{
                                                                                background: criterion.score >= 80 ? '#10b981' : criterion.score >= 60 ? '#f59e0b' : '#ef4444',
                                                                                color: 'white',
                                                                                padding: '6px 14px',
                                                                                borderRadius: '12px',
                                                                                fontSize: '0.95rem',
                                                                                fontWeight: 'bold'
                                                                            }}>
                                                                                Score: {criterion.score}/100
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div style={{
                                                                        background: 'rgba(255,255,255,0.7)',
                                                                        borderRadius: '8px',
                                                                        padding: '12px',
                                                                        marginBottom: '10px'
                                                                    }}>
                                                                        <strong style={{ color: '#4b5563' }}>Feedback:</strong>
                                                                        <p style={{ margin: '5px 0 0 0', color: '#1f2937', lineHeight: '1.6' }}>{criterion.feedback}</p>
                                                                    </div>
                                                                    
                                                                    {criterion.evidence && (
                                                                        <div style={{
                                                                            background: '#f9fafb',
                                                                            border: '1px solid #e5e7eb',
                                                                            borderRadius: '6px',
                                                                            padding: '10px',
                                                                            marginBottom: '10px',
                                                                            fontSize: '0.9rem',
                                                                            fontStyle: 'italic',
                                                                            color: '#6b7280'
                                                                        }}>
                                                                            <strong>Evidence:</strong> "{criterion.evidence}"
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {criterion.strengths && criterion.strengths.length > 0 && (
                                                                        <div style={{ marginTop: '10px' }}>
                                                                            <strong style={{ color: '#059669', display: 'block', marginBottom: '5px' }}>✅ Strengths:</strong>
                                                                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                                                                {criterion.strengths.map((s, i) => (
                                                                                    <li key={i} style={{ color: '#059669', marginBottom: '3px' }}>{s}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {criterion.weaknesses && criterion.weaknesses.length > 0 && (
                                                                        <div style={{ marginTop: '10px' }}>
                                                                            <strong style={{ color: '#dc2626', display: 'block', marginBottom: '5px' }}>❌ What's Missing (To Follow This Criterion):</strong>
                                                                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                                                                {criterion.weaknesses.map((w, i) => (
                                                                                    <li key={i} style={{ color: '#dc2626', marginBottom: '3px' }}>{w}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {criterion.suggestions && criterion.suggestions.length > 0 && (
                                                                        <div style={{ marginTop: '10px' }}>
                                                                            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '5px' }}>💡 Suggestions to Improve:</strong>
                                                                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                                                                {criterion.suggestions.map((s, i) => (
                                                                                    <li key={i} style={{ color: '#3b82f6', marginBottom: '3px' }}>{s}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                
                                                {/* Overall Assessment Text */}
                                                <div style={{
                                                    ...styles.feedbackText,
                                                    background: '#f9fafb',
                                                    border: '1px solid #e5e7eb',
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: '1.8',
                                                    marginTop: '20px'
                                                }}>
                                                    {feedbackData.rubric_assessment}
                                                </div>
                                                
                                                {/* Recommendations */}
                                                {feedbackData.rubric_recommendations && feedbackData.rubric_recommendations.length > 0 && (
                                                    <div style={{
                                                        marginTop: '20px',
                                                        background: '#eff6ff',
                                                        border: '1px solid #bfdbfe',
                                                        borderRadius: '8px',
                                                        padding: '15px'
                                                    }}>
                                                        <h4 style={{ marginBottom: '10px', color: '#1e40af' }}>💡 General Recommendations:</h4>
                                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                            {feedbackData.rubric_recommendations.map((rec, index) => (
                                                                <li key={index} style={{ marginBottom: '5px', color: '#1e40af' }}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Show message if no rubric evaluation available */
                                            <div style={styles.feedbackSection}>
                                                <h3 style={styles.feedbackTitle}>📋 Rubric-Based Evaluation</h3>
                                                <div style={{
                                                    background: '#f3f4f6',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    color: '#6b7280'
                                                }}>
                                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                                                    <p style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>
                                                        No rubric evaluation available
                                                    </p>
                                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                                                        {user?.role === 'lecturer' 
                                                            ? 'No rubric has been uploaded for this class, or the rubric was deleted. Upload a rubric to enable rubric-based evaluation for student assignments.'
                                                            : 'Your instructor has not uploaded a rubric for this assignment yet, or the rubric was removed.'}
                                                    </p>
                                                    {user?.role === 'lecturer' && (
                                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#9ca3af' }}>
                                                            💡 Note: If a rubric was previously uploaded and deleted, any cached evaluations from before the deletion will still be shown. New assignments submitted after deletion will not have rubric evaluation.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p>No feedback data available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PENDING ENROLLMENTS MODAL */}
            {showPendingModal && (
                <div style={styles.modal} onClick={() => setShowPendingModal(false)}>
                    <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                📋 Pending Enrollment Requests ({pendingEnrollments.length})
                            </h2>
                            <button
                                style={styles.closeButton}
                                onClick={() => setShowPendingModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingPending ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                Loading pending requests...
                            </div>
                        ) : pendingEnrollments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                No pending enrollment requests
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {pendingEnrollments.map(request => (
                                    <div key={request.enrollment_id} style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        background: '#f9fafb'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    marginBottom: '5px',
                                                    color: '#1f2937'
                                                }}>
                                                    {request.student_name}
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem',
                                                    marginBottom: '5px'
                                                }}>
                                                    📧 {request.student_email}
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Requested: {new Date(request.requested_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginLeft: '15px'
                                            }}>
                                                <button
                                                    style={{
                                                        background: '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onClick={() => handleApproveEnrollment(request.enrollment_id)}
                                                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                                                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onClick={() => handleRejectEnrollment(request.enrollment_id)}
                                                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                                                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}