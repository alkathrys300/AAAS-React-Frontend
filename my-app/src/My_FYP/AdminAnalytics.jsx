import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function AdminAnalytics() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/admin/analytics`);
            const data = await response.json();

            if (data.success) {
                setAnalytics(data);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (err) {
            setError('Error fetching analytics: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!analytics) return;

        let csvContent = "AAAS System Analytics Report\n\n";
        csvContent += "=== OVERVIEW ===\n";
        csvContent += `Total Users,${analytics.overview.total_users}\n`;
        csvContent += `Total Students,${analytics.overview.total_students}\n`;
        csvContent += `Total Lecturers,${analytics.overview.total_lecturers}\n`;
        csvContent += `Total Classes,${analytics.overview.total_classes}\n`;
        csvContent += `Total Submissions,${analytics.overview.total_submissions}\n`;
        csvContent += `Total Evaluations,${analytics.overview.total_evaluations}\n\n`;

        csvContent += "=== PLAGIARISM STATISTICS ===\n";
        csvContent += `High Risk (70%+),${analytics.plagiarism_stats.high_risk}\n`;
        csvContent += `Medium Risk (40-70%),${analytics.plagiarism_stats.medium_risk}\n`;
        csvContent += `Low Risk (<40%),${analytics.plagiarism_stats.low_risk}\n\n`;

        csvContent += "=== MOST ACTIVE CLASSES ===\n";
        csvContent += "Class Name,Class Code,Enrollments\n";
        analytics.most_active_classes.forEach(cls => {
            csvContent += `${cls.class_name},${cls.class_code},${cls.enrollments}\n`;
        });
        csvContent += "\n=== MOST ACTIVE STUDENTS ===\n";
        csvContent += "Name,Email,Submissions\n";
        analytics.most_active_students.forEach(student => {
            csvContent += `${student.name},${student.email},${student.submissions}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AAAS_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
        },
        header: {
            background: 'white',
            borderRadius: '15px',
            padding: '20px 30px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        headerTop: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
        },
        nav: {
            display: 'flex',
            gap: '10px',
        },
        navButton: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: '#667eea',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        tabs: {
            display: 'flex',
            gap: '10px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
        },
        tab: {
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#666',
            borderBottom: '3px solid transparent',
            transition: 'all 0.2s',
        },
        tabActive: {
            color: '#667eea',
            borderBottom: '3px solid #667eea',
        },
        content: {
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
        },
        statCard: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
        },
        statValue: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '5px',
        },
        statLabel: {
            fontSize: '0.9rem',
            opacity: 0.9,
        },
        chartContainer: {
            marginBottom: '30px',
        },
        chartTitle: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333',
        },
        barChart: {
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            height: '200px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '8px',
        },
        bar: {
            flex: 1,
            background: 'linear-gradient(to top, #667eea, #764ba2)',
            borderRadius: '8px 8px 0 0',
            minHeight: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '5px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            background: '#667eea',
            color: 'white',
            padding: '12px',
            textAlign: 'left',
            fontWeight: '600',
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #e0e0e0',
        },
        badge: {
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'inline-block',
        },
        badgeHigh: {
            background: '#fee',
            color: '#c00',
        },
        badgeMedium: {
            background: '#fff3cd',
            color: '#856404',
        },
        badgeLow: {
            background: '#d4edda',
            color: '#155724',
        },
        error: {
            background: '#fee',
            color: '#c00',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '1.2rem',
            color: 'white',
        },
        pieChart: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            padding: '20px',
        },
        pieSegment: {
            textAlign: 'center',
            padding: '20px',
            borderRadius: '12px',
            minWidth: '120px',
        },
        lineChart: {
            display: 'flex',
            alignItems: 'flex-end',
            gap: '5px',
            height: '150px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '8px',
            overflowX: 'auto',
        },
        linePoint: {
            flex: 1,
            minWidth: '40px',
            background: '#667eea',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '5px 2px',
            color: 'white',
            fontSize: '0.7rem',
            textAlign: 'center',
        },
        hourlyChart: {
            padding: '30px 20px 40px 50px',
            background: '#f8f9fa',
            borderRadius: '8px',
            position: 'relative',
        },
        hourlyChartInner: {
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '250px',
            borderLeft: '2px solid #ddd',
            borderBottom: '2px solid #ddd',
            paddingLeft: '10px',
            paddingBottom: '10px',
            position: 'relative',
        },
        hourBar: {
            flex: 1,
            background: 'linear-gradient(to top, #667eea, #764ba2)',
            borderRadius: '4px 4px 0 0',
            margin: '0 3px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: '8px',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
        },
        hourLabel: {
            position: 'absolute',
            bottom: '-25px',
            fontSize: '0.7rem',
            color: '#666',
            fontWeight: '500',
        },
        yAxisLabel: {
            position: 'absolute',
            left: '5px',
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            fontSize: '0.85rem',
            color: '#666',
            fontWeight: '600',
        },
        xAxisLabel: {
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.85rem',
            color: '#666',
            fontWeight: '600',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>⏳ Loading analytics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>{error}</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>No analytics data available</div>
            </div>
        );
    }

    const maxSubmissions = Math.max(...analytics.submission_trends.map(s => s.count), 1);
    const maxHourly = Math.max(...analytics.peak_hours.map(h => h.count), 1);

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <h1 style={styles.title}>📊 System Analytics</h1>
                    <div style={styles.nav}>
                        <button
                            style={styles.navButton}
                            onClick={exportToCSV}
                            onMouseOver={(e) => e.target.style.background = '#5568d3'}
                            onMouseOut={(e) => e.target.style.background = '#667eea'}
                        >
                            📥 Export CSV
                        </button>
                        <button
                            style={styles.navButton}
                            onClick={() => navigate('/admin/dashboard')}
                            onMouseOver={(e) => e.target.style.background = '#5568d3'}
                            onMouseOut={(e) => e.target.style.background = '#667eea'}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('overview')}
                    >
                        📈 Overview
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'plagiarism' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('plagiarism')}
                    >
                        🔍 Plagiarism
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'activity' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('activity')}
                    >
                        👥 Activity
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'trends' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('trends')}
                    >
                        📉 Trends
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div style={styles.content}>
                    <h2 style={styles.chartTitle}>System Overview</h2>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_users}</div>
                            <div style={styles.statLabel}>Total Users</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_students}</div>
                            <div style={styles.statLabel}>Students</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_lecturers}</div>
                            <div style={styles.statLabel}>Lecturers</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_classes}</div>
                            <div style={styles.statLabel}>Classes</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_submissions}</div>
                            <div style={styles.statLabel}>Submissions</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{analytics.overview.total_evaluations}</div>
                            <div style={styles.statLabel}>Evaluations</div>
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Most Active Classes</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Class Name</th>
                                    <th style={styles.th}>Class Code</th>
                                    <th style={styles.th}>Enrollments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.most_active_classes.map((cls, idx) => (
                                    <tr key={idx}>
                                        <td style={styles.td}>{cls.class_name}</td>
                                        <td style={styles.td}>{cls.class_code}</td>
                                        <td style={styles.td}><strong>{cls.enrollments}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Most Active Students</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Student Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Submissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.most_active_students.map((student, idx) => (
                                    <tr key={idx}>
                                        <td style={styles.td}>{student.name}</td>
                                        <td style={styles.td}>{student.email}</td>
                                        <td style={styles.td}><strong>{student.submissions}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Plagiarism Tab */}
            {activeTab === 'plagiarism' && (
                <div style={styles.content}>
                    <h2 style={styles.chartTitle}>Plagiarism Analysis</h2>

                    <div style={styles.pieChart}>
                        <div style={{ ...styles.pieSegment, background: '#fee' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c00' }}>
                                {analytics.plagiarism_stats.high_risk}
                            </div>
                            <div style={{ color: '#c00', fontWeight: '600' }}>High Risk (70%+)</div>
                        </div>
                        <div style={{ ...styles.pieSegment, background: '#fff3cd' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#856404' }}>
                                {analytics.plagiarism_stats.medium_risk}
                            </div>
                            <div style={{ color: '#856404', fontWeight: '600' }}>Medium (40-70%)</div>
                        </div>
                        <div style={{ ...styles.pieSegment, background: '#d4edda' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#155724' }}>
                                {analytics.plagiarism_stats.low_risk}
                            </div>
                            <div style={{ color: '#155724', fontWeight: '600' }}>Low Risk (&lt;40%)</div>
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Recent High-Risk Submissions</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Student</th>
                                    <th style={styles.th}>Class</th>
                                    <th style={styles.th}>Similarity</th>
                                    <th style={styles.th}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.high_risk_submissions.length > 0 ? (
                                    analytics.high_risk_submissions.map((sub, idx) => (
                                        <tr key={idx}>
                                            <td style={styles.td}>{sub.student_name}</td>
                                            <td style={styles.td}>{sub.class_name}</td>
                                            <td style={styles.td}>
                                                <span style={styles.badgeHigh}>{sub.similarity.toFixed(1)}%</span>
                                            </td>
                                            <td style={styles.td}>{sub.date ? new Date(sub.date).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                                            No high-risk submissions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Plagiarism Trends (Last 30 Days)</h3>
                        <div style={styles.lineChart}>
                            {analytics.plagiarism_trends.length > 0 ? (
                                analytics.plagiarism_trends.map((trend, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.linePoint,
                                            height: `${(trend.similarity / 100) * 100}%`,
                                            minHeight: '30px',
                                        }}
                                    >
                                        <span>{trend.similarity.toFixed(0)}%</span>
                                        <span style={{ fontSize: '0.6rem' }}>{new Date(trend.date).getDate()}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#999' }}>
                                    No plagiarism data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
                <div style={styles.content}>
                    <h2 style={styles.chartTitle}>System Activity</h2>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Submission Trends (Last 7 Days)</h3>
                        <div style={styles.barChart}>
                            {analytics.submission_trends.length > 0 ? (
                                analytics.submission_trends.map((day, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.bar,
                                            height: `${(day.count / maxSubmissions) * 100}%`,
                                        }}
                                    >
                                        <span>{day.count}</span>
                                        <span style={{ fontSize: '0.7rem' }}>{new Date(day.date).getDate()}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#999' }}>
                                    No submission data available
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>📊 Peak Usage Hours - Submission Activity by Hour</h3>
                        <div style={styles.hourlyChart}>
                            <div style={styles.yAxisLabel}>Number of Submissions</div>
                            <div style={styles.hourlyChartInner}>
                                {analytics.peak_hours.length > 0 ? (
                                    analytics.peak_hours.map((hour, idx) => {
                                        const heightPercent = maxHourly > 0 ? (hour.count / maxHourly) * 100 : 10;
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    ...styles.hourBar,
                                                    height: `${Math.max(heightPercent, 10)}%`,
                                                }}
                                                title={`${hour.hour}:00 - ${hour.count} submissions`}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scaleY(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                                            >
                                                <span style={{ marginBottom: '5px' }}>{hour.count}</span>
                                                <span style={styles.hourLabel}>{hour.hour}:00</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', width: '100%', padding: '50px', color: '#999' }}>
                                        No activity data available yet
                                    </div>
                                )}
                            </div>
                            <div style={styles.xAxisLabel}>Time of Day (24-hour format)</div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            marginTop: '20px',
                            padding: '15px',
                            background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                            borderRadius: '8px',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                                    {analytics.peak_hours.length > 0
                                        ? analytics.peak_hours.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 }).hour
                                        : '-'}:00
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>Peak Hour</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#764ba2' }}>
                                    {analytics.peak_hours.length > 0
                                        ? analytics.peak_hours.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 }).count
                                        : 0}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>Max Submissions</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                                    {analytics.peak_hours.length > 0
                                        ? analytics.peak_hours.reduce((sum, h) => sum + h.count, 0)
                                        : 0}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>Total Submissions</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
                <div style={styles.content}>
                    <h2 style={styles.chartTitle}>Historical Trends</h2>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Submission Patterns</h3>
                        <div style={styles.statsGrid}>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                                <div style={styles.statValue}>
                                    {analytics.submission_trends.reduce((sum, day) => sum + day.count, 0)}
                                </div>
                                <div style={styles.statLabel}>Weekly Submissions</div>
                            </div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
                                <div style={styles.statValue}>
                                    {analytics.plagiarism_trends.length > 0
                                        ? (analytics.plagiarism_trends.reduce((sum, t) => sum + t.similarity, 0) / analytics.plagiarism_trends.length).toFixed(1)
                                        : '0'}%
                                </div>
                                <div style={styles.statLabel}>Avg Similarity</div>
                            </div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <div style={styles.statValue}>
                                    {analytics.peak_hours.length > 0
                                        ? analytics.peak_hours.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 }).hour
                                        : '0'}h
                                </div>
                                <div style={styles.statLabel}>Peak Hour</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Key Insights</h3>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <ul style={{ lineHeight: '2', color: '#555' }}>
                                <li>📊 <strong>{analytics.overview.total_submissions}</strong> total submissions processed</li>
                                <li>🎓 <strong>{analytics.overview.total_students}</strong> active students in the system</li>
                                <li>📚 <strong>{analytics.overview.total_classes}</strong> classes currently running</li>
                                <li>🔍 <strong>{analytics.plagiarism_stats.high_risk}</strong> high-risk plagiarism cases detected</li>
                                <li>⚠️ Average plagiarism rate: <strong>
                                    {analytics.plagiarism_trends.length > 0
                                        ? (analytics.plagiarism_trends.reduce((sum, t) => sum + t.similarity, 0) / analytics.plagiarism_trends.length).toFixed(1)
                                        : '0'}%
                                </strong></li>
                                <li>⏰ Peak usage time: <strong>
                                    {analytics.peak_hours.length > 0
                                        ? `${analytics.peak_hours.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 }).hour}:00`
                                        : 'N/A'}
                                </strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
