import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function ClassesPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [myClasses, setMyClasses] = useState([]);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my'); // 'my', 'enrolled', 'available'

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const [creating, setCreating] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    // Pending enrollments state
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [selectedClassForPending, setSelectedClassForPending] = useState(null);
    const [loadingPending, setLoadingPending] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Set initial tab based on user role
        setActiveTab(parsedUser.role === 'lecturer' ? 'my' : 'enrolled');

        fetchClasses(token, parsedUser);
    }, [navigate]);

    const fetchClasses = async (token, userData) => {
        setLoading(true);
        try {
            if (userData.role === 'lecturer') {
                // Fetch lecturer's classes
                const myClassesResponse = await fetch(`${API_BASE}/classes/my-classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (myClassesResponse.ok) {
                    const data = await myClassesResponse.json();
                    setMyClasses(data.classes || []);
                }
            } else {
                // Fetch student's enrolled classes
                const enrolledResponse = await fetch(`${API_BASE}/classes/enrolled`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (enrolledResponse.ok) {
                    const data = await enrolledResponse.json();
                    setEnrolledClasses(data.classes || []);
                }

                // Fetch available classes for students
                const availableResponse = await fetch(`${API_BASE}/classes/available`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (availableResponse.ok) {
                    const data = await availableResponse.json();
                    setAvailableClasses(data.classes || []);
                }
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async () => {
        if (!newClassName.trim()) {
            alert('Please enter a class name');
            return;
        }

        setCreating(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/class/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ class_name: newClassName.trim() })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Class created:', result);
                alert('Class created successfully!');
                setShowCreateModal(false);
                setNewClassName('');
                // Refresh classes
                fetchClasses(token, user);
            } else {
                const error = await response.json();
                alert('Failed to create class: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error creating class: ' + error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleEnrollInClass = async () => {
        if (!enrollmentCode.trim()) {
            alert('Please enter an enrollment code');
            return;
        }

        setEnrolling(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/class/enroll-by-code/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrollmentCode.trim())
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Enrollment result:', result);
                alert('Successfully enrolled in class!');
                setShowEnrollModal(false);
                setEnrollmentCode('');
                // Refresh classes
                fetchClasses(token, user);
            } else {
                const error = await response.json();
                alert('Failed to enroll: ' + (error.detail || 'Invalid enrollment code'));
            }
        } catch (error) {
            alert('Error enrolling: ' + error.message);
        } finally {
            setEnrolling(false);
        }
    };

    // **ADD THIS FUNCTION - This was missing!**
    const handleClassClick = (classId) => {
        navigate(`/class/${classId}`);
    };

    // Handle pending enrollments
    const fetchPendingEnrollments = async (classId) => {
        setLoadingPending(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/class/${classId}/enrollment-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPendingEnrollments(data.pending_requests || []);
                setSelectedClassForPending(classId);
                setShowPendingModal(true);
            } else {
                alert('Failed to fetch pending enrollments');
            }
        } catch (error) {
            console.error('Error fetching pending enrollments:', error);
            alert('Error fetching pending enrollments');
        } finally {
            setLoadingPending(false);
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
                // Refresh pending enrollments
                fetchPendingEnrollments(selectedClassForPending);
                // Refresh class data
                fetchClasses(token, user);
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
                // Refresh pending enrollments
                fetchPendingEnrollments(selectedClassForPending);
                // Refresh class data
                fetchClasses(token, user);
            } else {
                const error = await response.json();
                alert('Failed to reject: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error rejecting enrollment: ' + error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.2rem'
            }}>
                Loading classes...
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
        pageHeader: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        pageTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
        },
        pageSubtitle: {
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '30px'
        },
        actionButton: {
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '15px'
        },
        tabs: {
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '30px'
        },
        tab: {
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        activeTab: {
            background: 'rgba(255,255,255,0.2)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        },
        classesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '25px',
            marginTop: '30px'
        },
        classCard: {
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
        },
        className: {
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
        },
        classDetail: {
            color: '#6b7280',
            marginBottom: '8px',
            fontSize: '0.95rem'
        },
        statusBadge: {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            background: '#dcfce7',
            color: '#166534'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            color: 'white'
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
            zIndex: 1000
        },
        modalContent: {
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1f2937'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '1rem'
        },
        modalButton: {
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '10px'
        },
        cancelButton: {
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
        }
    };

    const renderClasses = (classes, showEnrollmentCode = false) => {
        if (classes.length === 0) {
            return (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📚</div>
                    <h3>No classes found</h3>
                    <p style={{ opacity: 0.8 }}>
                        {user?.role === 'lecturer'
                            ? 'Create your first class to get started!'
                            : 'Enroll in a class to begin your learning journey!'
                        }
                    </p>
                </div>
            );
        }

        return (
            <div style={styles.classesGrid}>
                {classes.map(classItem => (
                    <div
                        key={classItem.class_id}
                        style={styles.classCard}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-5px)';
                            e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div
                            onClick={() => handleClassClick(classItem.class_id)}
                            style={{ ...styles.className, cursor: 'pointer' }}
                        >
                            {classItem.class_name}
                        </div>

                        <div style={styles.classDetail}>
                            <strong>ID:</strong> {classItem.class_id}
                        </div>

                        {user?.role === 'lecturer' ? (
                            <>
                                <div style={styles.classDetail}>
                                    <strong>Students:</strong> {classItem.student_count || 0}
                                    {classItem.pending_enrollments > 0 && (
                                        <span style={{
                                            marginLeft: '10px',
                                            background: '#f59e0b',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            +{classItem.pending_enrollments} pending
                                        </span>
                                    )}
                                </div>
                                {classItem.pending_enrollments > 0 && (
                                    <button
                                        style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            marginTop: '10px',
                                            width: '100%',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchPendingEnrollments(classItem.class_id);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                                    >
                                        📋 Review {classItem.pending_enrollments} Request{classItem.pending_enrollments !== 1 ? 's' : ''}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div style={styles.classDetail}>
                                <strong>Instructor:</strong> {classItem.lecturer_name || 'Unknown'}
                            </div>
                        )}

                        <div style={styles.classDetail}>
                            <strong>Created:</strong> {new Date(classItem.created_at).toLocaleDateString()}
                        </div>

                        {showEnrollmentCode && (
                            <div style={styles.classDetail}>
                                <strong>Code:</strong> {classItem.enrollment_code}
                            </div>
                        )}

                        <div style={{ marginTop: '15px' }}>
                            {classItem.enrollment_status === 'pending' ? (
                                <span style={{ ...styles.statusBadge, background: '#fef3c7', color: '#92400e' }}>
                                    ⏳ Pending Approval
                                </span>
                            ) : (
                                <span style={styles.statusBadge}>Active</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
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
                    <div style={{ ...styles.navLink, ...styles.activeTab }}>
                        📚 Classes
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/analytics')}>
                        📊 Analytics
                    </div>
                    <div style={styles.navLink} onClick={() => navigate('/contact')}>
                        📞 Contact
                    </div>
                </nav>
                <div style={styles.userMenu} onClick={handleLogout}>
                    <span>👤</span>
                    <span>{user?.name}</span>
                    <span style={{ fontSize: '0.8rem' }}>Logout</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.pageHeader}>
                    <h1 style={styles.pageTitle}>
                        <span>📚</span>
                        My Classes
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Manage your classes and track student progress
                    </p>

                    {/* Action Buttons */}
                    {user?.role === 'lecturer' && (
                        <button
                            style={styles.actionButton}
                            onClick={() => setShowCreateModal(true)}
                        >
                            ➕ Create New Class
                        </button>
                    )}

                    {user?.role === 'student' && (
                        <button
                            style={styles.actionButton}
                            onClick={() => setShowEnrollModal(true)}
                        >
                            🎓 Enroll in Class
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {user?.role === 'lecturer' && (
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'my' ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab('my')}
                        >
                            My Classes ({myClasses.length})
                        </button>
                    )}

                    {user?.role === 'student' && (
                        <>
                            <button
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'enrolled' ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveTab('enrolled')}
                            >
                                Enrolled ({enrolledClasses.length})
                            </button>
                            <button
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'available' ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveTab('available')}
                            >
                                Available ({availableClasses.length})
                            </button>
                        </>
                    )}
                </div>

                {/* Classes Grid */}
                {activeTab === 'my' && renderClasses(myClasses)}
                {activeTab === 'enrolled' && renderClasses(enrolledClasses)}
                {activeTab === 'available' && renderClasses(availableClasses, true)}
            </main>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Create New Class</h3>
                        <input
                            type="text"
                            placeholder="Enter class name (e.g., CS101, Mathematics)"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            style={styles.input}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateClass()}
                        />
                        <div>
                            <button
                                style={styles.modalButton}
                                onClick={handleCreateClass}
                                disabled={creating}
                            >
                                {creating ? 'Creating...' : 'Create Class'}
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewClassName('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll Modal */}
            {showEnrollModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Enroll in Class</h3>
                        <input
                            type="text"
                            placeholder="Enter enrollment code (e.g., ENROLL-2)"
                            value={enrollmentCode}
                            onChange={(e) => setEnrollmentCode(e.target.value)}
                            style={styles.input}
                            onKeyPress={(e) => e.key === 'Enter' && handleEnrollInClass()}
                        />
                        <div>
                            <button
                                style={styles.modalButton}
                                onClick={handleEnrollInClass}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll'}
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => {
                                    setShowEnrollModal(false);
                                    setEnrollmentCode('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Enrollments Modal */}
            {showPendingModal && (
                <div style={styles.modal}>
                    <div style={{ ...styles.modalContent, maxWidth: '600px' }}>
                        <h3 style={styles.modalTitle}>
                            📋 Pending Enrollment Requests ({pendingEnrollments.length})
                        </h3>

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

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                style={styles.cancelButton}
                                onClick={() => {
                                    setShowPendingModal(false);
                                    setPendingEnrollments([]);
                                    setSelectedClassForPending(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}