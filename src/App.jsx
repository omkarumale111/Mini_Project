import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import Dashboard from "./components/DashboardScreen/Dashboard";
import SignScreen from './components/SignUpScreen/SignScreen';
import ForgotPassword from "./components/ForgotPasswordScreen/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import WritingEssentials from "./pages/WritingEssentials"; // Assuming the WritingEssentials page is located at this path

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signup" element={<SignScreen />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/writing-essentials" element={<WritingEssentials />} />
    </Routes>
  );
}

export default App;