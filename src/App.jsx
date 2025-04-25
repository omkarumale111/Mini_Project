import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import Dashboard from "./components/DashboardScreen/Dashboard";
import SignScreen from './components/SignUpScreen/SignScreen';
import ForgotPassword from "./components/ForgotPasswordScreen/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import WritingEssentials from "./pages/WritingEssentials";
import WEQ1 from "./pages/WEQ1";

/**
 * App is the root component that defines all client-side routes for the application.
 * Uses react-router-dom for navigation between pages such as landing, login, dashboard, etc.
 */
function App() {
  return (
    <Routes>
      {/* Landing page shown at root URL */}
      <Route path="/" element={<LandingPage />} />
      {/* Login screen for user authentication */}
      <Route path="/login" element={<LoginScreen />} />
      {/* Dashboard for logged-in users */}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Sign up page for new users */}
      <Route path="/signup" element={<SignScreen />} />
      {/* Password recovery page */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Writing Essentials module */}
      <Route path="/writing-essentials" element={<WritingEssentials />} />
      {/* Writing Essentials Quiz 1 module */}
      <Route path="/weq1" element={<WEQ1 />} />
    </Routes>
  );
}

export default App;