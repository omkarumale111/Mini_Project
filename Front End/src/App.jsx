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
import TeacherAbout from './pages/TeacherAbout';
import Modules from './pages/Modules';
import StudentProfile from './pages/StudentProfile';
import TakeTest from './pages/TakeTest';
import TestReport from './pages/TestReport';
import SignupScreen from "./components/SignUpScreen/SignupScreen";

// Test Management Components
import CreateTest from './components/CreateTest/CreateTest';
import ManageTests from './components/ManageTests/ManageTests';
import TestInterface from './pages/TestInterface';
import StudentDetails from './pages/StudentDetails';
import TeacherDetails from './pages/TeacherDetails';
import Report from './pages/Report';
import StudentReport from './pages/StudentReport';
import MyStudents from './pages/MyStudentsRedesigned';
import StudentPerformanceDetails from './pages/StudentPerformanceDetails';

// Module 1 Lessons
import Module1Lesson1 from './pages/lessons/Module1Lesson1';
import Module1Lesson2 from './pages/lessons/Module1Lesson2';
import Module1Lesson3 from './pages/lessons/Module1Lesson3';
import Module1Lesson4 from './pages/lessons/Module1Lesson4';

// Module 2 Lessons
import Module2Lesson1 from './pages/lessons/Module2Lesson1';
import Module2Lesson2 from './pages/lessons/Module2Lesson2';
import Module2Lesson3 from './pages/lessons/Module2Lesson3';
import Module2Lesson4 from './pages/lessons/Module2Lesson4';

// Module 3 Lessons
import Module3Lesson1 from './pages/lessons/Module3Lesson1';
import Module3Lesson2 from './pages/lessons/Module3Lesson2';
import Module3Lesson3 from './pages/lessons/Module3Lesson3';
import Module3Lesson4 from './pages/lessons/Module3Lesson4';

// Module 4 Lessons
import Module4Lesson1 from './pages/lessons/Module4Lesson1';
import Module4Lesson2 from './pages/lessons/Module4Lesson2';
import Module4Lesson3 from './pages/lessons/Module4Lesson3';
import Module4Lesson4 from './pages/lessons/Module4Lesson4';

// Listening Module L1 Lessons
import ListeningL1Lesson1 from './pages/listening/ListeningL1Lesson1';
import ListeningL1Lesson2 from './pages/listening/ListeningL1Lesson2';
import ListeningL1Lesson3 from './pages/listening/ListeningL1Lesson3';
import ListeningL1Lesson4 from './pages/listening/ListeningL1Lesson4';
import ListeningL1Lesson5 from './pages/listening/ListeningL1Lesson5';
import ListeningL1Lesson6 from './pages/listening/ListeningL1Lesson6';
import ListeningL1Lesson7 from './pages/listening/ListeningL1Lesson7';
import ListeningL1Lesson8 from './pages/listening/ListeningL1Lesson8';
import ListeningL1Lesson9 from './pages/listening/ListeningL1Lesson9';
import ListeningL1Lesson10 from './pages/listening/ListeningL1Lesson10';

// Listening Module L2 Lessons
import ListeningL2Lesson1 from './pages/listening/ListeningL2Lesson1';
import ListeningL2Lesson2 from './pages/listening/ListeningL2Lesson2';
import ListeningL2Lesson3 from './pages/listening/ListeningL2Lesson3';
import ListeningL2Lesson4 from './pages/listening/ListeningL2Lesson4';
import ListeningL2Lesson5 from './pages/listening/ListeningL2Lesson5';
import ListeningL2Lesson6 from './pages/listening/ListeningL2Lesson6';
import ListeningL2Lesson7 from './pages/listening/ListeningL2Lesson7';
import ListeningL2Lesson8 from './pages/listening/ListeningL2Lesson8';
import ListeningL2Lesson9 from './pages/listening/ListeningL2Lesson9';
import ListeningL2Lesson10 from './pages/listening/ListeningL2Lesson10';

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
      {/* Teacher About page */}
      <Route path="/teacher-about" element={<TeacherAbout />} />
      {/* Sign up page for new users */}
      <Route path="/signup" element={<SignupScreen/>} />
      {/* Password recovery page */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Student Profile */}
      <Route path="/profile" element={<StudentProfile />} />
      {/* Take Test page */}
      <Route path="/take-test" element={<TakeTest />} />
      {/* Test Report page */}
      <Route path="/test-report" element={<TestReport />} />
      
      {/* Test Management Routes */}
      <Route path="/create-test" element={<CreateTest />} />
      <Route path="/manage-tests" element={<ManageTests />} />
      <Route path="/test/:testCode" element={<TestInterface />} />
      <Route path="/student-details" element={<StudentDetails />} />
      <Route path="/teacher-details" element={<TeacherDetails />} />
      <Route path="/reports" element={<Report />} />
      <Route path="/student-report" element={<StudentReport />} />
      <Route path="/my-reports" element={<StudentReport />} />
      <Route path="/my-students" element={<MyStudents />} />
      <Route path="/student-performance/:studentId" element={<StudentPerformanceDetails />} />
      
      {/* Module 1 Lesson Routes */}
      <Route path="/module1/lesson1" element={<Module1Lesson1 />} />
      <Route path="/module1/lesson2" element={<Module1Lesson2 />} />
      <Route path="/module1/lesson3" element={<Module1Lesson3 />} />
      <Route path="/module1/lesson4" element={<Module1Lesson4 />} />
      
      {/* Module 2 Lesson Routes */}
      <Route path="/module2/lesson1" element={<Module2Lesson1 />} />
      <Route path="/module2/lesson2" element={<Module2Lesson2 />} />
      <Route path="/module2/lesson3" element={<Module2Lesson3 />} />
      <Route path="/module2/lesson4" element={<Module2Lesson4 />} />
      
      {/* Module 3 Lesson Routes */}
      <Route path="/module3/lesson1" element={<Module3Lesson1 />} />
      <Route path="/module3/lesson2" element={<Module3Lesson2 />} />
      <Route path="/module3/lesson3" element={<Module3Lesson3 />} />
      <Route path="/module3/lesson4" element={<Module3Lesson4 />} />
      
      {/* Module 4 Lesson Routes */}
      <Route path="/module4/lesson1" element={<Module4Lesson1 />} />
      <Route path="/module4/lesson2" element={<Module4Lesson2 />} />
      <Route path="/module4/lesson3" element={<Module4Lesson3 />} />
      <Route path="/module4/lesson4" element={<Module4Lesson4 />} />
      
      {/* Listening Module L1 Routes - Error Identification and Correction */}
      <Route path="/listening/L1/lesson1" element={<ListeningL1Lesson1 />} />
      <Route path="/listening/L1/lesson2" element={<ListeningL1Lesson2 />} />
      <Route path="/listening/L1/lesson3" element={<ListeningL1Lesson3 />} />
      <Route path="/listening/L1/lesson4" element={<ListeningL1Lesson4 />} />
      <Route path="/listening/L1/lesson5" element={<ListeningL1Lesson5 />} />
      <Route path="/listening/L1/lesson6" element={<ListeningL1Lesson6 />} />
      <Route path="/listening/L1/lesson7" element={<ListeningL1Lesson7 />} />
      <Route path="/listening/L1/lesson8" element={<ListeningL1Lesson8 />} />
      <Route path="/listening/L1/lesson9" element={<ListeningL1Lesson9 />} />
      <Route path="/listening/L1/lesson10" element={<ListeningL1Lesson10 />} />
      
      {/* Listening Module L2 Routes - Situational Communication */}
      <Route path="/listening/L2/lesson1" element={<ListeningL2Lesson1 />} />
      <Route path="/listening/L2/lesson2" element={<ListeningL2Lesson2 />} />
      <Route path="/listening/L2/lesson3" element={<ListeningL2Lesson3 />} />
      <Route path="/listening/L2/lesson4" element={<ListeningL2Lesson4 />} />
      <Route path="/listening/L2/lesson5" element={<ListeningL2Lesson5 />} />
      <Route path="/listening/L2/lesson6" element={<ListeningL2Lesson6 />} />
      <Route path="/listening/L2/lesson7" element={<ListeningL2Lesson7 />} />
      <Route path="/listening/L2/lesson8" element={<ListeningL2Lesson8 />} />
      <Route path="/listening/L2/lesson9" element={<ListeningL2Lesson9 />} />
      <Route path="/listening/L2/lesson10" element={<ListeningL2Lesson10 />} />
    </Routes>
  );
}

export default App;
