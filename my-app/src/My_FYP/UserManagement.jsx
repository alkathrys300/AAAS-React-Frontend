import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [approvalFilter, setApprovalFilter] = useState('');

    // Edit modal
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        status: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, statusFilter, approvalFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (approvalFilter) params.append('is_approved', approvalFilter);

            const response = await fetch(`http://localhost:8000/admin/users/all?${params}`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
            } else {
                setError('Failed to load users');
            }
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.user_id));
        }
    };

    const handleBulkApprove = async (approved) => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one user');
            return;
        }

        if (!window.confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} ${selectedUsers.length} user(s)?`)) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/admin/users/bulk-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_ids: selectedUsers,
                    approved: approved
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                setSelectedUsers([]);
                fetchUsers();
            } else {
                alert('Error: ' + (data.detail || 'Unknown error'));
            }
        } catch (err) {
            alert('Error connecting to server');
            console.error(err);
        }
    };

    const handleToggleSuspend = async (userId, currentStatus) => {
        const action = currentStatus === 'suspended' ? 'unsuspend' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/admin/users/${userId}/toggle-suspend`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchUsers();
            } else {
                alert('Error: ' + (data.detail || 'Unknown error'));
            }
        } catch (err) {
            alert('Error connecting to server');
            console.error(err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user? This action will set their status to inactive.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchUsers();
            } else {
                alert('Error: ' + (data.detail || 'Unknown error'));
            }
        } catch (err) {
            alert('Error connecting to server');
            console.error(err);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
    };

    const handleUpdateUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/admin/users/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: editingUser.user_id,
                    ...editForm
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('User updated successfully');
                setEditingUser(null);
                fetchUsers();
            } else {
                alert('Error: ' + (data.detail || 'Unknown error'));
            }
        } catch (err) {
            alert('Error connecting to server');
            console.error(err);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: '#10b981',
            inactive: '#6b7280',
            suspended: '#ef4444',
            rejected: '#dc2626'
        };
        return {
            background: colors[status] || '#6b7280',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize'
        };
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: '#8b5cf6',
            lecturer: '#3b82f6',
            student: '#06b6d4'
        };
        return {
            background: colors[role] || '#6b7280',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize'
        };
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
        },
        header: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        filtersContainer: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        filterRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
        },
        input: {
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.95rem',
            width: '100%',
            outline: 'none',
            transition: 'border-color 0.3s'
        },
        bulkActions: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
        },
        button: {
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        primaryButton: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },
        successButton: {
            background: '#10b981',
            color: 'white'
        },
        dangerButton: {
            background: '#ef4444',
            color: 'white'
        },
        warningButton: {
            background: '#f59e0b',
            color: 'white'
        },
        tableContainer: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflowX: 'auto'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
        },
        th: {
            padding: '12px',
            textAlign: 'left',
            borderBottom: '2px solid #e5e7eb',
            fontWeight: '600',
            color: '#374151',
            fontSize: '0.9rem',
            background: '#f9fafb'
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '0.85rem',
            color: '#4b5563'
        },
        actionButton: {
            padding: '5px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500',
            marginRight: '5px',
            transition: 'all 0.2s'
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
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: '600',
            color: '#374151',
            fontSize: '0.9rem'
        },
        statsBar: {
            display: 'flex',
            gap: '15px',
            marginTop: '15px',
            flexWrap: 'wrap'
        },
        statItem: {
            padding: '10px 20px',
            background: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '0.85rem'
        },
        statLabel: {
            color: '#6b7280',
            fontSize: '0.75rem',
            marginBottom: '3px'
        },
        statValue: {
            fontWeight: 'bold',
            color: '#374151',
            fontSize: '1.2rem'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.title}>
                    👥 User Management
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        style={{ ...styles.button, ...styles.primaryButton, marginLeft: 'auto', fontSize: '0.85rem' }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                    Manage all users, approve registrations, and control access
                </p>

                {/* Stats Bar */}
                <div style={styles.statsBar}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Total Users</div>
                        <div style={styles.statValue}>{users.length}</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Pending Approval</div>
                        <div style={styles.statValue}>{users.filter(u => u.is_approved === 0).length}</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Active</div>
                        <div style={styles.statValue}>{users.filter(u => u.status === 'active').length}</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Suspended</div>
                        <div style={styles.statValue}>{users.filter(u => u.status === 'suspended').length}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersContainer}>
                <h3 style={{ marginBottom: '15px', color: '#374151' }}>🔍 Search & Filter</h3>
                <div style={styles.filterRow}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.input}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={styles.input}
                    >
                        <option value="">All Roles</option>
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.input}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select
                        value={approvalFilter}
                        onChange={(e) => setApprovalFilter(e.target.value)}
                        style={styles.input}
                    >
                        <option value="">All Approvals</option>
                        <option value="1">Approved</option>
                        <option value="0">Pending</option>
                    </select>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <div style={styles.bulkActions}>
                        <span style={{ padding: '10px', fontWeight: '600', color: '#374151' }}>
                            {selectedUsers.length} selected
                        </span>
                        <button
                            onClick={() => handleBulkApprove(true)}
                            style={{ ...styles.button, ...styles.successButton }}
                        >
                            ✓ Approve Selected
                        </button>
                        <button
                            onClick={() => handleBulkApprove(false)}
                            style={{ ...styles.button, ...styles.dangerButton }}
                        >
                            ✗ Reject Selected
                        </button>
                        <button
                            onClick={() => setSelectedUsers([])}
                            style={{ ...styles.button, background: '#6b7280', color: 'white' }}
                        >
                            Clear Selection
                        </button>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        ⏳ Loading users...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                        ❌ {error}
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No users found
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Approval</th>
                                <th style={styles.th}>Activity</th>
                                <th style={styles.th}>Joined</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id} style={{ background: selectedUsers.includes(user.user_id) ? '#f0f9ff' : 'white' }}>
                                    <td style={styles.td}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.user_id)}
                                            onChange={() => handleSelectUser(user.user_id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={styles.td}>{user.user_id}</td>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>{user.name}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <span style={getRoleBadge(user.role)}>{user.role}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={getStatusBadge(user.status)}>{user.status}</span>
                                    </td>
                                    <td style={styles.td}>
                                        {user.is_approved === 1 ? (
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Approved</span>
                                        ) : (
                                            <span style={{ color: '#f59e0b', fontWeight: '600' }}>⏳ Pending</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        {user.role === 'student' && `${user.enrollment_count} classes, ${user.submission_count} submissions`}
                                        {user.role === 'lecturer' && `${user.class_count} classes`}
                                        {user.role === 'admin' && 'Admin'}
                                    </td>
                                    <td style={styles.td}>
                                        {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            style={{ ...styles.actionButton, background: '#3b82f6', color: 'white' }}
                                            title="Edit user"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleSuspend(user.user_id, user.status)}
                                            style={{
                                                ...styles.actionButton,
                                                background: user.status === 'suspended' ? '#10b981' : '#f59e0b',
                                                color: 'white'
                                            }}
                                            title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                        >
                                            {user.status === 'suspended' ? '↑ Unsuspend' : '⏸️ Suspend'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.user_id)}
                                            style={{ ...styles.actionButton, background: '#ef4444', color: 'white' }}
                                            title="Deactivate user"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div style={styles.modal} onClick={() => setEditingUser(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>✏️ Edit User</h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Role</label>
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                style={styles.input}
                            >
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                style={styles.input}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button
                                onClick={handleUpdateUser}
                                style={{ ...styles.button, ...styles.successButton, flex: 1 }}
                            >
                                💾 Save Changes
                            </button>
                            <button
                                onClick={() => setEditingUser(null)}
                                style={{ ...styles.button, background: '#6b7280', color: 'white', flex: 1 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
