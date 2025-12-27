import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const userDataString = localStorage.getItem('userData') || localStorage.getItem('user');
  
  useEffect(() => {
    // Check authentication on component mount and when user navigates back
    const checkAuth = () => {
      const currentToken = localStorage.getItem('access_token');
      const currentUserData = localStorage.getItem('userData') || localStorage.getItem('user');
      
      if (!currentToken || !currentUserData) {
        // Clear everything and redirect
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    checkAuth();

    // Add event listener for storage changes (logout in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Check auth when user returns to the page (back button)
    window.addEventListener('focus', checkAuth);
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [navigate]);

  // Initial check
  if (!token || !userDataString) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role if required
  if (requireAdmin) {
    try {
      const userData = JSON.parse(userDataString);
      if (userData.role !== 'admin') {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
