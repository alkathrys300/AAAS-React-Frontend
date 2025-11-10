import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './My_FYP/Login';
import Register from './My_FYP/Register';
import UserPage from './My_FYP/UserPage';
import Home from './My_FYP/Home';
import ClassesPage from './My_FYP/ClassesPage';
import ClassDetailPage from './My_FYP/ClassDetailPage';



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
      </Routes>
    </BrowserRouter>
  );
}
export default App;