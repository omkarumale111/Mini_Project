import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentReport.css';
import { storage } from '../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiUserLine as RiTeacherIcon
} from "react-icons/ri";
import logo from '../assets/Logo.png';

/**
 * StudentReport component displays comprehensive performance analytics
 * including test scores, progress tracking, and achievement badges
 */
const StudentReport = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    totalLessons: 0,
    completedLessons: 0,
    recentTests: [],
    performanceTrend: []
  });
  const navigate = useNavigate();

  // Fetch user data and report statistics
  useEffect(() => {
    const fetchReportData = async () => {
      const userData = storage.getUser();
      if (userData) {
        setUser(userData);
        
        try {
          // Fetch test count
          const testResponse = await fetch(`http://localhost:5001/api/student-test-count/${userData.id}`);
          const testData = await testResponse.json();
          
          // Fetch lesson count
          const lessonResponse = await fetch(`http://localhost:5001/api/student-lesson-count/${userData.id}`);
          const lessonData = await lessonResponse.json();
          
          // Fetch recent test submissions
          const submissionsResponse = await fetch(`http://localhost:5001/api/student-submissions/${userData.id}`);
          const submissionsData = await submissionsResponse.json();
          
          setReportData({
            totalTests: testData.completedTests || 0,
            completedTests: testData.completedTests || 0,
            averageScore: 0, // Will be calculated from actual scores
            totalLessons: 16, // Total lessons available
            completedLessons: lessonData.completedLessons || 0,
            recentTests: submissionsData.submissions || [],
            performanceTrend: []
          });
        } catch (error) {
          console.error('Error fetching report data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    fetchReportData();
  }, [navigate]);

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
    storage.removeUser();
    navigate('/login');
  };

  // Progress bar removed; keep only Test Reports section

  return (
    <div className="student-report-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle" 
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
        <nav className="nav-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/modules')}
            >
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/take-test')}
            >
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Take Test</span>}
            </li>
            <li 
              className="nav-item active"
              onClick={() => navigateToSection('/student-report')}
            >
              <RiBarChartLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Reports</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/dashboard/about')}
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
      <div className="main-content">
        {/* Top Navigation Bar */}
        <div className="top-bar">
          <div className="top-bar-title">
            <h1>My Reports</h1>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content">
          {loading ? (
            <div className="loading-state">
              <p>Loading your report...</p>
            </div>
          ) : (
            <>
              {/* Recent Tests Section */}
              <div className="recent-tests-section">
                <h3>📝 Test Reports</h3>
                {reportData.recentTests.length > 0 ? (
                  <div className="tests-grid">
                    {reportData.recentTests.map((test, index) => {
                      const teacherName = test.teacher_first_name && test.teacher_last_name 
                        ? `${test.teacher_first_name} ${test.teacher_last_name}`
                        : test.teacher_email;
                      const completionRate = test.total_questions > 0 
                        ? Math.round((test.answered_questions / test.total_questions) * 100)
                        : 0;
                      
                      return (
                        <div key={index} className="test-card">
                          <div className="test-header">
                            <h4>{test.test_name || 'Test'}</h4>
                            <span className="test-date">
                              {new Date(test.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="test-details">
                            <div className="detail-row">
                              <RiTeacherIcon className="detail-icon" />
                              <span>Teacher: <strong>{teacherName}</strong></span>
                            </div>
                            <div className="detail-row">
                              <RiTimeLine className="detail-icon" />
                              <span>Submitted: <strong>{new Date(test.submitted_at).toLocaleString()}</strong></span>
                            </div>
                            {test.time_limit_minutes && (
                              <div className="detail-row">
                                <RiTimeLine className="detail-icon" />
                                <span>Time Limit: <strong>{test.time_limit_minutes} minutes</strong></span>
                              </div>
                            )}
                            <div className="detail-row">
                              <RiCheckboxCircleLine className="detail-icon" />
                              <span>Questions Answered: <strong>{test.answered_questions} / {test.total_questions}</strong></span>
                            </div>
                          </div>
                          <div className="test-footer">
                            <div className="completion-bar">
                              <div className="completion-label">
                                <span>Completion</span>
                                <span className="completion-percentage">{completionRate}%</span>
                              </div>
                              <div className="completion-progress">
                                <div 
                                  className="completion-fill" 
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="test-status">
                              <RiCheckboxCircleLine className="status-icon" />
                              <span>Completed</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <RiFileTextLine className="empty-icon" />
                    <p>No test submissions yet</p>
                    <button 
                      className="action-button"
                      onClick={() => navigateToSection('/take-test')}
                    >
                      Take Your First Test
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
