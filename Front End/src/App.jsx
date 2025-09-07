import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import Dashboard from "./components/DashboardScreen/Dashboard";
import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard";
import TeacherProfile from "./components/TeacherProfile/TeacherProfile";
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
      {/* Teacher/Admin Dashboard */}
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      {/* Teacher Profile */}
      <Route path="/teacher-profile" element={<TeacherProfile />} />
      {/* Sign up page for new users */}
      <Route path="/signup" element={<SignupScreen/>} />
      {/* Password recovery page */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Writing Essentials module */}
      <Route path="/writing-essentials" element={<WritingEssentials />} />
      <Route path="/weq1" element={<WEQ1 />} />
      
      {/* Reports & Brief module */}
      <Route path="/reports-brief" element={<ReportsBrief />} />
      <Route path="/rbq1" element={<RBQ1 />} />
      
      {/* Emails & Memos module */}
      <Route path="/emails-memos" element={<EmailsMemos />} />
      <Route path="/emq1" element={<EMQ1 />} />
      
      {/* Letters & Applications module */}
      <Route path="/letters-applications" element={<LettersApplications />} />
      <Route path="/laq1" element={<LAQ1 />} />
    </Routes>
  );
}

export default App;
