import { useState, useCallback, useMemo } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export const usePlagiarism = (classId, assignments, user) => {
    const [plagiarismResults, setPlagiarismResults] = useState([]);
    const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
    const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
    const [allowStudentView, setAllowStudentView] = useState(false);

    // Check plagiarism function
    const checkPlagiarism = useCallback(async () => {
        if (!user || user.role !== 'lecturer') return;

        setIsCheckingPlagiarism(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/class/${classId}/check-plagiarism`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPlagiarismResults(data.plagiarism_results || []);
                setShowPlagiarismModal(true);
                console.log('🔍 Plagiarism check completed:', data);
            } else {
                const error = await response.json();
                alert(`❌ Plagiarism check failed: ${error.detail || 'Unknown error'}`);
                console.error('Plagiarism check error:', error);
            }
        } catch (error) {
            console.error('Error checking plagiarism:', error);
            alert('❌ Failed to check plagiarism. Please try again.');
        } finally {
            setIsCheckingPlagiarism(false);
        }
    }, [classId, user]);

    // Get student plagiarism status
    const getStudentPlagiarismStatus = useCallback(() => {
        if (!user || user.role !== 'student' || !allowStudentView) return null;

        const studentResults = plagiarismResults.filter(result => 
            result.student1_id === user.user_id || result.student2_id === user.user_id
        );

        if (studentResults.length === 0) {
            return {
                status: 'CLEAR',
                message: '✅ No plagiarism concerns detected in your submissions.',
                color: '#10b981'
            };
        }

        const highRiskResults = studentResults.filter(result => 
            result.risk_level === 'VERY_HIGH' || result.risk_level === 'HIGH'
        );

        if (highRiskResults.length > 0) {
            const maxSimilarity = Math.max(...highRiskResults.map(r => r.similarity_percentage || 0));
            return {
                status: 'WARNING',
                message: `⚠️ Potential plagiarism detected (${maxSimilarity}% similarity). Please review your work.`,
                color: '#f59e0b',
                details: highRiskResults
            };
        }

        const maxSimilarity = Math.max(...studentResults.map(r => r.similarity_percentage || 0));
        return {
            status: 'MINOR',
            message: `ℹ️ Minor similarity detected (${maxSimilarity}% similarity). This is within acceptable limits.`,
            color: '#3b82f6',
            details: studentResults
        };
    }, [user, allowStudentView, plagiarismResults]);

    // Calculate plagiarism statistics
    const plagiarismStats = useMemo(() => {
        if (!plagiarismResults || plagiarismResults.length === 0) {
            return {
                totalPairs: 0,
                riskLevels: { VERY_HIGH: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
                averageSimilarity: 0,
                maxSimilarity: 0
            };
        }

        const riskLevels = { VERY_HIGH: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        let totalSimilarity = 0;
        let maxSimilarity = 0;

        plagiarismResults.forEach(result => {
            const risk = result.risk_level || 'LOW';
            if (riskLevels.hasOwnProperty(risk)) {
                riskLevels[risk]++;
            }

            const similarity = result.similarity_percentage || 0;
            totalSimilarity += similarity;
            maxSimilarity = Math.max(maxSimilarity, similarity);
        });

        return {
            totalPairs: plagiarismResults.length,
            riskLevels,
            averageSimilarity: plagiarismResults.length > 0 ? (totalSimilarity / plagiarismResults.length).toFixed(1) : 0,
            maxSimilarity: maxSimilarity.toFixed(1)
        };
    }, [plagiarismResults]);

    // Check if plagiarism check is available
    const canCheckPlagiarism = useMemo(() => {
        return user?.role === 'lecturer' && assignments.length >= 2;
    }, [user, assignments]);

    return {
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
    };
};