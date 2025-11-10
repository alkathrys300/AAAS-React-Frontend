import React from 'react';

// 🔍 PLAGIARISM SECTION COMPONENT
export const PlagiarismSection = ({
    user,
    assignments,
    plagiarismResults,
    isCheckingPlagiarism,
    allowStudentView,
    canCheckPlagiarism,
    plagiarismStats,
    checkPlagiarism,
    setShowPlagiarismModal,
    setAllowStudentView
}) => {
    const styles = {
        plagiarismSection: {
            border: '2px solid #e74c3c',
            padding: '25px',
            borderRadius: '16px',
            marginTop: '30px',
            marginBottom: '30px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
        plagiarismButton: {
            backgroundColor: isCheckingPlagiarism ? '#95a5a6' : '#e74c3c',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '12px',
            cursor: isCheckingPlagiarism || !canCheckPlagiarism ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            marginRight: '15px'
        },
        actionButton: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            marginRight: '15px'
        },
        toggleButton: {
            backgroundColor: allowStudentView ? '#10b981' : '#6b7280',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
        },
        warningBox: {
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '15px',
            color: '#dc2626',
            fontWeight: 'bold',
            marginTop: '15px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
        },
        statCard: {
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
        },
        statValue: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '5px'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        }
    };

    if (user?.role !== 'lecturer') return null;

    return (
        <div style={styles.plagiarismSection}>
            <h2 style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '1.8rem' }}>
                🔍 Plagiarism Detection System
            </h2>

            <div style={{ marginBottom: '20px' }}>
                <p><strong>📊 Assignments available:</strong> {assignments.length}</p>
                <p><strong>⚡ Detection method:</strong> AI-powered similarity analysis</p>
                <p><strong>🎯 Threshold:</strong> 60% similarity triggers alert</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={checkPlagiarism}
                    disabled={isCheckingPlagiarism || !canCheckPlagiarism}
                    style={styles.plagiarismButton}
                    onMouseEnter={(e) => {
                        if (!isCheckingPlagiarism && canCheckPlagiarism) {
                            e.target.style.backgroundColor = '#c0392b';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isCheckingPlagiarism && canCheckPlagiarism) {
                            e.target.style.backgroundColor = '#e74c3c';
                        }
                    }}
                >
                    {isCheckingPlagiarism ? '🔄 Analyzing...' : '🔍 Run Plagiarism Check'}
                </button>

                {plagiarismResults && plagiarismResults.length > 0 && (
                    <button
                        onClick={() => setShowPlagiarismModal(true)}
                        style={styles.actionButton}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        📊 View Results ({plagiarismStats.totalPairs})
                    </button>
                )}

                <button
                    onClick={() => setAllowStudentView(!allowStudentView)}
                    style={styles.toggleButton}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = allowStudentView ? '#059669' : '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = allowStudentView ? '#10b981' : '#6b7280';
                    }}
                >
                    👁️ {allowStudentView ? 'Hide from Students' : 'Allow Student View'}
                </button>
            </div>

            {!canCheckPlagiarism && (
                <div style={styles.warningBox}>
                    ⚠️ Need at least 2 assignments to check for plagiarism
                </div>
            )}

            {plagiarismStats.totalPairs > 0 && (
                <div style={{
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px'
                }}>
                    <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>📈 Latest Results Summary</h4>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={{ ...styles.statValue, color: '#e74c3c' }}>
                                {plagiarismStats.totalPairs}
                            </div>
                            <div style={styles.statLabel}>Total Pairs</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{ ...styles.statValue, color: '#dc2626' }}>
                                {plagiarismStats.riskLevels.VERY_HIGH + plagiarismStats.riskLevels.HIGH}
                            </div>
                            <div style={styles.statLabel}>High Risk</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                                {plagiarismStats.averageSimilarity}%
                            </div>
                            <div style={styles.statLabel}>Avg Similarity</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{ ...styles.statValue, color: '#059669' }}>
                                {plagiarismStats.maxSimilarity}%
                            </div>
                            <div style={styles.statLabel}>Max Similarity</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 👁️ STUDENT PLAGIARISM CARD COMPONENT
export const StudentPlagiarismCard = ({ 
    user, 
    allowStudentView, 
    getStudentPlagiarismStatus 
}) => {
    const styles = {
        studentPlagiarismCard: {
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid #3b82f6',
            borderRadius: '16px',
            padding: '25px',
            marginTop: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
        statusBox: {
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px'
        },
        statusTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '10px'
        },
        statusMessage: {
            color: '#4b5563',
            marginBottom: '0'
        },
        infoText: {
            fontSize: '0.9rem',
            color: '#6b7280',
            fontStyle: 'italic'
        }
    };

    if (user?.role !== 'student' || !allowStudentView) {
        return null;
    }

    const studentPlagiarismStatus = getStudentPlagiarismStatus();

    if (!studentPlagiarismStatus) {
        return (
            <div style={styles.studentPlagiarismCard}>
                <h2 style={{ color: '#3b82f6', marginBottom: '15px', fontSize: '1.6rem' }}>
                    📋 My Originality Status
                </h2>
                <div style={{
                    ...styles.statusBox,
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db'
                }}>
                    <div style={{
                        ...styles.statusTitle,
                        color: '#6b7280'
                    }}>
                        📊 Status Check Pending
                    </div>
                    <p style={styles.statusMessage}>
                        Your plagiarism status will be available after the lecturer runs the detection analysis.
                    </p>
                </div>
                <div style={styles.infoText}>
                    💡 This shows similarity with other submissions. Contact your lecturer for specific concerns.
                </div>
            </div>
        );
    }

    const getStatusColors = (status) => {
        switch (status) {
            case 'CLEAR':
                return {
                    background: '#f0fdf4',
                    border: '#bbf7d0',
                    textColor: '#065f46'
                };
            case 'MINOR':
                return {
                    background: '#eff6ff',
                    border: '#bfdbfe',
                    textColor: '#1e40af'
                };
            case 'WARNING':
                return {
                    background: '#fffbeb',
                    border: '#fed7aa',
                    textColor: '#ea580c'
                };
            default:
                return {
                    background: '#f9fafb',
                    border: '#d1d5db',
                    textColor: '#374151'
                };
        }
    };

    const colors = getStatusColors(studentPlagiarismStatus.status);

    return (
        <div style={styles.studentPlagiarismCard}>
            <h2 style={{ color: '#3b82f6', marginBottom: '15px', fontSize: '1.6rem' }}>
                📋 My Originality Status
            </h2>
            <div style={{
                ...styles.statusBox,
                background: colors.background,
                border: `1px solid ${colors.border}`
            }}>
                <div style={{
                    ...styles.statusTitle,
                    color: colors.textColor
                }}>
                    {studentPlagiarismStatus.status === 'CLEAR' && '✅ Original Work'}
                    {studentPlagiarismStatus.status === 'MINOR' && 'ℹ️ Minor Similarity'}
                    {studentPlagiarismStatus.status === 'WARNING' && '⚠️ Similarity Detected'}
                </div>
                <p style={styles.statusMessage}>
                    {studentPlagiarismStatus.message}
                </p>

                {studentPlagiarismStatus.details && studentPlagiarismStatus.details.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: colors.textColor }}>
                            📄 Affected Submissions:
                        </p>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {studentPlagiarismStatus.details.slice(0, 3).map((detail, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.5)',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    marginBottom: '5px',
                                    fontSize: '0.9rem'
                                }}>
                                    <strong>Similarity:</strong> {detail.similarity_percentage}% with another submission
                                </div>
                            ))}
                            {studentPlagiarismStatus.details.length > 3 && (
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                                    ... and {studentPlagiarismStatus.details.length - 3} more similarities
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.infoText}>
                💡 This shows general similarity with other submissions. Contact your lecturer for specific concerns.
            </div>
        </div>
    );
};

// 📊 PLAGIARISM MODAL COMPONENT
export const PlagiarismModal = ({ 
    showPlagiarismModal, 
    plagiarismResults, 
    plagiarismStats,
    setShowPlagiarismModal 
}) => {
    const styles = {
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f3f4f6'
        },
        modalTitle: {
            fontSize: '1.8rem',
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
        summaryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
        },
        summaryCard: {
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
        },
        summaryValue: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '5px'
        },
        summaryLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        riskButton: {
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            fontWeight: 'bold',
            margin: '5px',
            border: 'none'
        },
        resultItem: {
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
        },
        noResultsCard: {
            padding: '30px',
            textAlign: 'center',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            color: '#065f46'
        }
    };

    if (!showPlagiarismModal) return null;

    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel) {
            case 'VERY_HIGH': return '#7f1d1d';
            case 'HIGH': return '#dc2626';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#059669';
            default: return '#6b7280';
        }
    };

    const getRiskLevelBackground = (riskLevel) => {
        switch (riskLevel) {
            case 'VERY_HIGH': return '#fef2f2';
            case 'HIGH': return '#fefbf2';
            case 'MEDIUM': return '#fffbeb';
            case 'LOW': return '#f0fdf4';
            default: return '#f9fafb';
        }
    };

    return (
        <div style={styles.modal} onClick={() => setShowPlagiarismModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>
                        🔍 Plagiarism Detection Results
                    </h2>
                    <button
                        style={styles.closeButton}
                        onClick={() => setShowPlagiarismModal(false)}
                    >
                        ✕
                    </button>
                </div>

                <div>
                    {/* Summary Statistics */}
                    <div style={{
                        background: '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>📈 Summary</h3>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryCard}>
                                <div style={{ ...styles.summaryValue, color: '#e11d48' }}>
                                    {plagiarismStats.totalPairs}
                                </div>
                                <div style={styles.summaryLabel}>Total Pairs</div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={{ ...styles.summaryValue, color: '#0369a1' }}>
                                    {plagiarismStats.averageSimilarity}%
                                </div>
                                <div style={styles.summaryLabel}>Avg Similarity</div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={{ ...styles.summaryValue, color: '#059669' }}>
                                    {plagiarismStats.maxSimilarity}%
                                </div>
                                <div style={styles.summaryLabel}>Max Similarity</div>
                            </div>
                        </div>

                        {/* Risk Level Distribution */}
                        <div style={{ marginTop: '15px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>📊 Risk Level Distribution:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button style={{ ...styles.riskButton, backgroundColor: '#7f1d1d' }}>
                                    🔴 Very High: {plagiarismStats.riskLevels.VERY_HIGH}
                                </button>
                                <button style={{ ...styles.riskButton, backgroundColor: '#dc2626' }}>
                                    🟠 High: {plagiarismStats.riskLevels.HIGH}
                                </button>
                                <button style={{ ...styles.riskButton, backgroundColor: '#f59e0b' }}>
                                    🟡 Medium: {plagiarismStats.riskLevels.MEDIUM}
                                </button>
                                <button style={{ ...styles.riskButton, backgroundColor: '#059669' }}>
                                    🟢 Low: {plagiarismStats.riskLevels.LOW}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    {plagiarismResults && plagiarismResults.length > 0 ? (
                        <div>
                            <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>🔍 Detailed Suspicious Pairs</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {plagiarismResults.map((result, index) => (
                                    <div key={index} style={{
                                        ...styles.resultItem,
                                        background: getRiskLevelBackground(result.risk_level)
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                                                    👥 {result.student1_name || `Student ${result.student1_id}`} ↔ {result.student2_name || `Student ${result.student2_id}`}
                                                </h4>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                                                    📝 <strong>Assignments:</strong> {result.assignment1_title} vs {result.assignment2_title}
                                                </p>
                                                <p style={{ margin: '0', fontSize: '0.9rem', color: '#6b7280' }}>
                                                    🔍 <strong>Detection:</strong> {result.detection_method}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                                <div style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    color: getRiskLevelColor(result.risk_level)
                                                }}>
                                                    {result.similarity_percentage}%
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    color: '#64748b'
                                                }}>
                                                    {result.risk_level?.replace('_', ' ') || 'UNKNOWN'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.noResultsCard}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                            <h3 style={{ marginBottom: '10px' }}>No Plagiarism Detected</h3>
                            <p>All assignments appear to be original work.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 🚀 DEFAULT EXPORT (Optional - for convenience)
export default {
    PlagiarismSection,
    StudentPlagiarismCard,
    PlagiarismModal
};