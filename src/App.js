import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './My_FYP/Login';
import Register from './My_FYP/Register';
import UserPage from './My_FYP/UserPage';
import Home from './My_FYP/Home';
import ClassesPage from './My_FYP/ClassesPage';
import ClassDetailPage from './My_FYP/ClassDetailPage';
import AssignmentDetailPage from './My_FYP/AssignmentDetailPage';
import AdminDashboard from './My_FYP/AdminDashboard';
import AdminUserManagement from './My_FYP/AdminUserManagement';
import PendingUsers from './My_FYP/PendingUsers';
import AdminAnalytics from './My_FYP/AdminAnalytics';
import UserManagement from './My_FYP/UserManagement';
import Analytics from './My_FYP/Analytics';
import Contact from './My_FYP/Contact';
import SubmissionsPage from './My_FYP/SubmissionsPage';
import NotificationsPage from './My_FYP/NotificationsPage';
import UploadAssignmentPage from './My_FYP/UploadAssignmentPage';
import HelpCenter from './My_FYP/HelpCenter';
import Documentation from './My_FYP/Documentation';
import Tutorials from './My_FYP/Tutorials';
import PrivacyPolicy from './My_FYP/PrivacyPolicy';
import TermsOfService from './My_FYP/TermsOfService';
import ApiGuide from './My_FYP/ApiGuide';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userpage" element={<UserPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/class/:classId" element={<ClassDetailPage />} />
        <Route path="/class/:classId/upload" element={<UploadAssignmentPage />} />
        <Route path="/class/:classId/assignment/:assignmentId" element={<AssignmentDetailPage />} />
        <Route path="/class/:classId/submission/:submissionId" element={<AssignmentDetailPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/api-guide" element={<ApiGuide />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/pending-users" element={<PendingUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;