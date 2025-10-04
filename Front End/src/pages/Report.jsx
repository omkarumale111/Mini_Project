import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css";
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiFileTextLine, 
  RiBarChartLine, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine
} from "react-icons/ri";
import logo from '../assets/Logo.png';

const Report = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  // Sample student data - replace with API call later
  const students = [
    { id: 1, name: "Anna S.", year: "Grade 10", avgScore: 85 },
    { id: 2, name: "John D.", year: "Grade 11", avgScore: 78 },
    { id: 3, name: "Sarah M.", year: "Grade 10", avgScore: 92 },
    { id: 4, name: "Michael P.", year: "Grade 12", avgScore: 88 },
    { id: 5, name: "Emma W.", year: "Grade 11", avgScore: 81 },
    { id: 6, name: "David L.", year: "Grade 10", avgScore: 75 }
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const navigateToSection = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="teacher-report-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`teacher-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="sidebar-menu-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          <div className="logo-section">
            <img src={logo} alt="WriteEdge Logo" className="sidebar-logo" />
            {!sidebarCollapsed && <span className="logo-text">WriteEdge</span>}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="teacher-nav-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/create-test')}
            >
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Create Test</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/manage-tests')}
            >
              <RiFileEditLine className="nav-icon" />
              {!sidebarCollapsed && <span>Manage Tests</span>}
            </li>
            <li 
              className="nav-item active"
              onClick={() => navigateToSection('/reports')}
            >
              <RiBarChartLine className="nav-icon" />
              {!sidebarCollapsed && <span>Reports</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-about')}
            >
              <RiQuestionLine className="nav-icon" />
              {!sidebarCollapsed && <span>About</span>}
            </li>
            <li 
              className="nav-item" 
              onClick={handleLogout}
            >
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </li>
          </ul>
        </div>
      </div>

      {/* Main content area */}
      <div className="teacher-main-content">
        {/* Top Navigation Bar */}
        <div className="teacher-top-bar">
          <div className="top-bar-title">
            <h1>Reports & Analytics</h1>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content-wrapper">
          {!selectedStudent ? (
            // Student Selection View
            <div className="students-grid-container">
              <div className="students-grid">
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <div className="student-card-header">
                      <div className="student-avatar">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3>{student.name}</h3>
                    </div>
                    <div className="student-card-info">
                      <div className="info-row">
                        <span className="info-label">Year:</span>
                        <span className="info-value">{student.year}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Average Score:</span>
                        <span className="info-value score">{student.avgScore}%</span>
                      </div>
                    </div>
                    <button 
                      className="details-btn"
                      onClick={() => setSelectedStudent(student)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Detailed Report View
            <div className="report-detail-container">
              <div className="report-header">
                <button 
                  className="back-btn"
                  onClick={() => setSelectedStudent(null)}
                >
                  ← Back to Students
                </button>
                <h2>{selectedStudent.name}'s Performance Report</h2>
              </div>

              <div className="dashboard-container">
                <div className="dashboard-grid">
                  {/* Left Section - Overview */}
                  <div className="overview-section">
                    <h3>Overview & Scores</h3>
                    <div className="student-info">
                      <p><strong>{selectedStudent.name}</strong></p>
                      <p>Year: {selectedStudent.year}</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="score-container-wrapper">
                      <div className="score-chart-section">
                          <div className="score-text">Overall Score {selectedStudent.avgScore}%</div>
                          <div className="score-circle"></div>
                      </div>

                      <div className="score-details">
                          <p>Accuracy: 88%</p>
                          <p>Grammar: 80%</p>
                          <p>Spelling: 95%</p>
                          <p>Relevancy: 72%</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Detailed Breakdown */}
                  <div className="details-section">
                    <h3>Detailed Question Breakdown</h3>

                    <div className="question-card">
                      <h4>Question 1: Essay Prompt (88%)</h4>
                      <p>
                        The main point <span className="highlight">is about</span>{" "}
                        (We arise me is the future. We need to make it good.)
                      </p>
                      <div className="tag grammar">Grammar: Subject-verb agreement</div>
                    </div>

                    <div className="question-card">
                      <h4>Question 2: Short Report (80%)</h4>
                      <p>
                        The main point <span className="highlight">is about</span>{" "}
                        (We aniteme its the future. We need to make it good.)
                      </p>
                      <div className="tag spelling">Spelling: Off-topic</div>
                    </div>
                  </div>
                </div>

                {/* Bottom - Tips */}
                <div className="tips-section">
                  <h3>Tips for Improvement</h3>
                  <ul>
                    <li><strong>Spelling:</strong> Proofread carefully.</li>
                    <li><strong>Grammar:</strong> Review subject-verb introduction, body.</li>
                    <li><strong>Flow of Structure:</strong> Maintain formal language for paragraphs.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
