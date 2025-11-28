import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import { storage } from '../../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiFileTextLine, 
  RiGroupLine, 
  RiBarChartLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiAddLine,
  RiFileEditLine,
  RiMegaphoneLine,
  RiLightbulbLine,
  RiCalendarEventLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';

/**
 * TeacherDashboard component provides the main layout for admin/teacher users.
 * It features admin-specific functionality like test creation, student management,
 * and analytics.
 */
const TeacherDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [upcomingTestsCount, setUpcomingTestsCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const navigate = useNavigate();

  // Get user data from sessionStorage
  useEffect(() => {
    console.log('TeacherDashboard mounted');
    const userData = storage.getUser();
    console.log('User data from storage:', userData);
    if (userData) {
      setUser(userData);
      fetchUpcomingTests(userData.id);
      fetchRecentSubmissions(userData.id);
    } else {
      console.log('No user data found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);

  // Poll for new submissions every 30 seconds
  useEffect(() => {
    if (user && user.id) {
      const interval = setInterval(() => {
        fetchRecentSubmissions(user.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch upcoming tests count
  const fetchUpcomingTests = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/upcoming-tests/${teacherId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUpcomingTestsCount(data.count || 0);
      } else {
        console.error('Failed to fetch upcoming tests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching upcoming tests:', error);
    }
  };

  // Fetch recent submissions
  const fetchRecentSubmissions = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/recent-submissions/${teacherId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecentSubmissions(data.submissions || []);
      } else {
        console.error('Failed to fetch recent submissions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
    }
  };

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
    handleResize(); // Initial check
    
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

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="teacher-dashboard-container">
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
              className="nav-item active"
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
              className="nav-item"
              onClick={() => navigateToSection('/my-students')}
            >
              <RiGroupLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Students</span>}
            </li>
            <li 
              className="nav-item"
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
            <h1>Admin Dashboard</h1>
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome, {user?.email || 'Administrator'}</h2>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <RiFileTextLine />
            </div>
            <div className="stat-info">
              <h3>Upcoming Tests</h3>
              <span className="stat-number">{upcomingTestsCount}</span>
            </div>
          </div>
        </div>

        {/* Action Cards and Recent Submissions Layout */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'flex-start',
          margin: '20px',
          marginBottom: '40px'
        }}>
          {/* Action Cards - 2x2 Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '1fr 1fr', 
            gap: '20px',
            flex: '1.5'
          }}>
            <div className="action-card create-manage">
              <div className="action-icon">
                <RiAddLine />
              </div>
              <h3>CREATE TESTS</h3>
              <p style={{ color: 'white' }}>Easily design and schedule custom tests with full control over questions, duration, and difficulty.</p>
              <button onClick={() => navigateToSection('/create-test')}>CREATE TEST</button>
            </div>
            
            <div className="action-card ai-generator">
              <div className="action-icon">
                <RiFileEditLine />
              </div>
              <h3>MANAGE TESTS</h3>
              <p>View, edit, and organize your existing tests with comprehensive management tools.</p>
              <button onClick={() => navigateToSection('/manage-tests')}>MANAGE</button>
            </div>
            
            <div className="action-card tips" style={{ gridColumn: "1 / span 2", justifySelf: "center", width: "300px" }}>
              <div className="action-icon">
                <RiBarChartLine />
              </div>
              <h3>REPORTS</h3>
              <p style={{ color: 'white' }}>View detailed analytics and performance reports for students and test results.</p>
              <button onClick={() => navigateToSection('/reports')}>VIEW REPORTS</button>
            </div>
          </div>

          {/* Recent Submissions Section */}
          <div className="recent-submissions" style={{ flex: '1', minWidth: '300px' }}>
            <div className="submissions-header">
              <h3>Recent Submissions</h3>
            </div>
            <div className="submissions-content" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => {
                  const studentName = submission.student_first_name && submission.student_last_name
                    ? `${submission.student_first_name} ${submission.student_last_name}`
                    : submission.student_email;
                  
                  const submittedTime = new Date(submission.submitted_at);
                  const timeAgo = getTimeAgo(submittedTime);
                  
                  return (
                    <div key={submission.submission_id} className="submission-item">
                      <div className="submission-info">
                        <h4>{submission.test_name}</h4>
                        <p className="student-name">{studentName}</p>
                        <p className="submission-time">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No recent submissions</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
