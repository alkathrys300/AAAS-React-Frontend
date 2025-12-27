import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AAAS_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to home page with replace to prevent going back to analytics
    navigate('/', { replace: true });
  };

  if (loading || !analytics) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #14b8a6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>📈</div>
        <p style={{ fontSize: '18px' }}>Loading analytics...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const hourlyData = analytics.hourly_activity || [];
  const maxHourly = Math.max(...hourlyData.map(h => h.count), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 50%, #14b8a6 100%)' }}>
      {/* Modern Navbar */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>📈</span>
          <span style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[
            { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
            { icon: '👥', label: 'User Management', path: '/admin/user-management' },
            { icon: '⏳', label: 'Pending Approvals', path: '/admin/pending-users' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#0ea5e9'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b'; }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
        >
          Logout
        </button>
      </nav>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header with Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>System Analytics</h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>Comprehensive system insights and metrics</p>
          </div>
          <button
            onClick={exportToCSV}
            style={{ padding: '14px 28px', border: 'none', borderRadius: '12px', background: 'white', color: '#0ea5e9', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
          >
            <span>📥</span>
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'plagiarism', label: 'Plagiarism', icon: '🔍' },
            { id: 'activity', label: 'Activity', icon: '⚡' },
            { id: 'trends', label: 'Trends', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: '16px 28px', border: 'none', borderRadius: '12px', background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)', color: activeTab === tab.id ? '#0ea5e9' : 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: activeTab === tab.id ? '0 8px 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) e.target.style.background = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) e.target.style.background = 'rgba(255,255,255,0.2)'; }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: analytics.overview.total_users, icon: '👥', color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Students', value: analytics.overview.total_students, icon: '🎓', color: '#0891b2', bg: '#cffafe' },
                { label: 'Lecturers', value: analytics.overview.total_lecturers, icon: '👨‍🏫', color: '#14b8a6', bg: '#ccfbf1' },
                { label: 'Classes', value: analytics.overview.total_classes, icon: '📚', color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Submissions', value: analytics.overview.total_submissions, icon: '📝', color: '#10b981', bg: '#d1fae5' },
                { label: 'Evaluations', value: analytics.overview.total_evaluations, icon: '⭐', color: '#0891b2', bg: '#cffafe' }
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', border: '2px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = stat.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{ padding: '10px', borderRadius: '10px', background: stat.bg, fontSize: '28px', marginBottom: '12px', width: 'fit-content' }}>{stat.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Plagiarism Tab */}
        {activeTab === 'plagiarism' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🔍</span>
                <span>Plagiarism Statistics</span>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'High Risk (70%+)', value: analytics.plagiarism_stats?.high_risk || 0, color: '#ef4444', bg: '#fee2e2' },
                  { label: 'Medium Risk (40-70%)', value: analytics.plagiarism_stats?.medium_risk || 0, color: '#f59e0b', bg: '#fef3c7' },
                  { label: 'Low Risk (<40%)', value: analytics.plagiarism_stats?.low_risk || 0, color: '#10b981', bg: '#d1fae5' }
                ].map((item, i) => {
                  const total = (analytics.plagiarism_stats?.high_risk || 0) + (analytics.plagiarism_stats?.medium_risk || 0) + (analytics.plagiarism_stats?.low_risk || 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

                  return (
                    <div key={i} style={{ padding: '20px', borderRadius: '12px', background: item.bg, border: `2px solid ${item.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{item.label}</span>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: item.color }}>{item.value}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: item.color, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontWeight: '600' }}>{percentage}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>📊</span>
                <span>Detection Summary</span>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', borderRadius: '12px', background: '#f8fafc', border: '2px solid #e2e8f0' }}>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#0ea5e9', marginBottom: '8px' }}>
                    {((analytics.plagiarism_stats?.high_risk || 0) + (analytics.plagiarism_stats?.medium_risk || 0) + (analytics.plagiarism_stats?.low_risk || 0))}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Plagiarism Checks</div>
                </div>

                <div style={{ padding: '24px', borderRadius: '12px', background: '#fee2e2', border: '2px solid #ef4444' }}>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>
                    {analytics.plagiarism_stats?.high_risk || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>Require Attention</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>⚡</span>
              <span>Hourly Activity (Last 24 Hours)</span>
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '300px', padding: '20px 0' }}>
              {hourlyData.map((item, i) => {
                const height = (item.count / maxHourly) * 100;
                
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      {item.count}
                    </div>
                    <div
                      style={{ width: '100%', background: 'linear-gradient(180deg, #0ea5e9, #0891b2)', borderRadius: '4px 4px 0 0', height: `${height}%`, minHeight: '4px', transition: 'all 0.3s ease', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'scaleY(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scaleY(1)'; }}
                      title={`${item.hour}:00 - ${item.count} activities`}
                    />
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', transform: 'rotate(-45deg)', width: '30px' }}>
                      {item.hour}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📈</span>
              <span>System Trends</span>
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              {[
                { label: 'User Growth', value: '+12%', icon: '📈', trend: 'up', color: '#10b981' },
                { label: 'Submission Rate', value: '+8%', icon: '📝', trend: 'up', color: '#10b981' },
                { label: 'Active Classes', value: '+5%', icon: '📚', trend: 'up', color: '#10b981' },
                { label: 'Avg Evaluation Time', value: '-15%', icon: '⏱️', trend: 'down', color: '#10b981' },
                { label: 'Plagiarism Detection', value: '98%', icon: '🔍', trend: 'stable', color: '#0ea5e9' },
                { label: 'System Uptime', value: '99.9%', icon: '✅', trend: 'stable', color: '#0ea5e9' }
              ].map((trend, i) => (
                <div
                  key={i}
                  style={{ padding: '24px', borderRadius: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = trend.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{trend.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: trend.color, marginBottom: '4px' }}>{trend.value}</div>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{trend.label}</div>
                  {trend.trend === 'up' && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '700' }}>↗ Trending Up</div>}
                  {trend.trend === 'down' && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '700' }}>↘ Improving</div>}
                  {trend.trend === 'stable' && <div style={{ fontSize: '12px', color: '#0ea5e9', marginTop: '8px', fontWeight: '700' }}>→ Stable</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #0ea5e9, #0891b2); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0284c7, #0891b2); }
      `}</style>
    </div>
  );
}
