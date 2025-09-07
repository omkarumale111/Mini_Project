import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import Dashboard from "./components/DashboardScreen/Dashboard";
import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard";
import TeacherProfile from "./components/TeacherProfile/TeacherProfile";
import ForgotPassword from "./components/ForgotPasswordScreen/ForgotPassword";
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage';
import DashboardAbout from './pages/DashboardAbout';
import Modules from './pages/Modules';
import StudentProfile from './pages/StudentProfile';
import TakeTest from './pages/TakeTest';
import SignupScreen from "./components/SignUpScreen/SignupScreen";

/**
 * App is the root component that defines all client-side routes for the application.
 * Uses react-router-dom for navigation between pages such as landing, login, dashboard, etc.
 */
function App() {
  return (
    <Routes>
      {/* Landing page shown at root URL */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      {/* Login screen for user authentication */}
      <Route path="/login" element={<LoginScreen />} />
      {/* Dashboard for logged-in users */}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Dashboard About page */}
      <Route path="/dashboard/about" element={<DashboardAbout />} />
      {/* Modules page */}
      <Route path="/modules" element={<Modules />} />
      {/* Teacher/Admin Dashboard */}
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      {/* Teacher Profile */}
      <Route path="/teacher-profile" element={<TeacherProfile />} />
      {/* Sign up page for new users */}
      <Route path="/signup" element={<SignupScreen/>} />
      {/* Password recovery page */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Student Profile */}
      <Route path="/profile" element={<StudentProfile />} />
      {/* Take Test page */}
      <Route path="/take-test" element={<TakeTest />} />
    </Routes>
  );
}

export default App;
