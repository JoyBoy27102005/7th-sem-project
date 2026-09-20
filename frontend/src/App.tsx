import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import StudentLayout from './components/layout/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Recommendations from './pages/student/Recommendations';
import Roadmap from './pages/student/Roadmap';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import InterviewPrep from './pages/student/InterviewPrep';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CareerManagement from './pages/admin/CareerManagement';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  
  // Protected Student Routes
  {
    element: <StudentLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/profile', element: <Profile /> },
      { path: '/recommendations', element: <Recommendations /> },
      { path: '/roadmap', element: <Roadmap /> },
      { path: '/resume', element: <ResumeAnalyzer /> },
      { path: '/interview', element: <InterviewPrep /> },
      // Redirect legacy skill gap links to the new merged page
      { path: '/skill-gap', element: <Navigate to="/recommendations" replace /> },
      // Catch-all for unknown routes within the student layout
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  
  // Protected Admin Routes
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/users', element: <UserManagement /> },
      { path: '/admin/careers', element: <CareerManagement /> },
    ],
  },
  
  // Global Catch-all fallback
  { path: '*', element: <Navigate to="/" replace /> }
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
