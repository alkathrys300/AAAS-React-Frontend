import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/all-users`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user?')) return;

    try {
      const response = await axios.post(`${API_BASE}/approve-user/${userId}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });

      if (response.data.success) {
        setSuccessMessage('✅ User approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to approve user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await axios.delete(`${API_BASE}/delete-user/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });

      if (response.data.success) {
        setSuccessMessage('✅ User deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm('Suspend this user?')) return;

    try {
      const response = await axios.post(`${API_BASE}/suspend-user/${userId}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });

      if (response.data.success) {
        setSuccessMessage('⚠️ User suspended successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to suspend user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to home page with replace to prevent going back to user management
    navigate('/', { replace: true });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && user.status === 'active') ||
                          (statusFilter === 'inactive' && user.status !== 'active');
    const matchesApproval = approvalFilter === 'all' || 
                            (approvalFilter === 'approved' && user.is_approved) ||
                            (approvalFilter === 'pending' && !user.is_approved);
    return matchesSearch && matchesRole && matchesStatus && matchesApproval;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    pending: users.filter(u => !u.is_approved).length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>👥</div>
        <p style={{ fontSize: '18px' }}>Loading users...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)' }}>
      {/* Modern Navbar */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>👥</span>
          <span style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Management</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[
            { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
            { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
            { icon: '🏠', label: 'Home', path: '/' }
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
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Manage all users, approve registrations, and control access
          </h2>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{ background: '#d1fae5', border: '2px solid #10b981', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#065f46', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users', value: stats.total, icon: '👥', color: '#0ea5e9', bg: '#e0f2fe' },
            { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Active', value: stats.active, icon: '✅', color: '#10b981', bg: '#d1fae5' },
            { label: 'Suspended', value: stats.suspended, icon: '❌', color: '#ef4444', bg: '#fee2e2' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', border: '2px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = stat.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: stat.bg, fontSize: '24px' }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span>
            <span>Search & Filter</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', cursor: 'pointer', background: 'white' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', cursor: 'pointer', background: 'white' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', cursor: 'pointer', background: 'white' }}
            >
              <option value="all">All Approvals</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
            Users ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>No users found</h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
              {filteredUsers.map((user, i) => (
                <div
                  key={i}
                  style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', transition: 'all 0.3s ease', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '20px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#0ea5e9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{user.name}</span>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: user.role === 'student' ? '#e0f2fe' : user.role === 'lecturer' ? '#fef3c7' : '#ccfbf1', color: user.role === 'student' ? '#0ea5e9' : user.role === 'lecturer' ? '#f59e0b' : '#14b8a6' }}>
                          {user.role}
                        </span>
                        {user.is_approved ? (
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#d1fae5', color: '#065f46' }}>
                            ✓ APPROVED
                          </span>
                        ) : (
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fef3c7', color: '#b45309' }}>
                            ⏳ PENDING
                          </span>
                        )}
                        {user.status === 'active' ? (
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#d1fae5', color: '#065f46' }}>
                            🟢 ACTIVE
                          </span>
                        ) : (
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#991b1b' }}>
                            🔴 SUSPENDED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>{user.email}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        ID: {user.user_id} • {user.activity || 'No activity'} • Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!user.is_approved && (
                      <button
                        onClick={() => handleApprove(user.user_id)}
                        style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleSuspend(user.user_id)}
                        style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        ⚠️ Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #0ea5e9, #06b6d4); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0284c7, #0891b2); }
      `}</style>
    </div>
  );
}
