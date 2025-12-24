import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserPage.css';

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClassDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Class details:', data);
        setClassDetails(data);
      } else {
        console.error('Failed to fetch class details, status:', response.status);
        setError('Failed to fetch class details');
      }
    } catch (err) {
      setError('Error loading class details');
      console.error('Error:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/class/${classId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Assignments:', data);
        setAssignments(data.assignments || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-page">
      <nav className="navbar">
        <div className="navbar-brand">AAAS</div>
        <div className="navbar-menu">
          <button onClick={() => navigate('/userpage')}>Dashboard</button>
          <button onClick={() => navigate('/classes')}>Classes</button>
          <button onClick={() => navigate('/notifications')}>Notifications</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="page-header">
          <h1>{classDetails?.class_name || 'Class Details'}</h1>
          <p className="class-code">Class Code: {classDetails?.class_code}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <section className="assignments-section">
          <div className="section-header">
            <h2>Assignments</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="no-data">No assignments available for this class.</p>
              <button 
                className="view-btn"
                onClick={() => navigate(`/class/${classId}/assignment/new`)}
                style={{ marginTop: '20px', padding: '15px 30px', fontSize: '1.1rem' }}
              >
                📤 Upload Assignment
              </button>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <div className="assignment-details">
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    <span>Max Score: {assignment.max_score}</span>
                  </div>
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/class/${classId}/assignment/${assignment.id}`)}
                  >
                    📤 Upload Assignment
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClassDetailPage;
