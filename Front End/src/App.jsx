import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import Dashboard from "./components/DashboardScreen/Dashboard";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ForgotPassword from "./components/ForgotPasswordScreen/ForgotPassword";
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage';
import WritingEssentials from "./pages/WritingEssentials";
import WEQ1 from "./pages/WEQ1";
import SignupScreen from "./components/SignUpScreen/SignupScreen";
import ReportsBrief from "./pages/ReportsBrief";
import EmailsMemos from "./pages/EmailsMemos";
import LettersApplications from "./pages/LettersApplications";
import RBQ1 from "./pages/RBQ1";
import EMQ1 from "./pages/EMQ1";
import LAQ1 from "./pages/LAQ1";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Layout Component
const AdminLayout = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
};

// User Layout Component
const UserLayout = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

/**
 * App is the root component that defines all client-side routes for the application.
 * Uses react-router-dom for navigation between pages such as landing, login, dashboard, etc.
 */
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected User Routes */}
      <Route path="/dashboard" element={<UserLayout />} />
      <Route path="/writing-essentials" element={<UserLayout><WritingEssentials /></UserLayout>} />
      <Route path="/weq1" element={<UserLayout><WEQ1 /></UserLayout>} />
      <Route path="/reports-brief" element={<UserLayout><ReportsBrief /></UserLayout>} />
      <Route path="/rbq1" element={<UserLayout><RBQ1 /></UserLayout>} />
      <Route path="/emails-memos" element={<UserLayout><EmailsMemos /></UserLayout>} />
      <Route path="/emq1" element={<UserLayout><EMQ1 /></UserLayout>} />
      <Route path="/letters-applications" element={<UserLayout><LettersApplications /></UserLayout>} />
      <Route path="/laq1" element={<UserLayout><LAQ1 /></UserLayout>} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Add more admin routes here as needed */}
      </Route>
      
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
