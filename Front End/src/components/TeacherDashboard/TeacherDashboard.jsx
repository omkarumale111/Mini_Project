import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
    localStorage.removeItem('user');
    navigate('/login');
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
              onClick={() => navigateToSection('/manage-events')}
            >
              <RiCalendarEventLine className="nav-icon" />
              {!sidebarCollapsed && <span>Manage Events</span>}
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
            <div className="stat-icon blue">
              <RiFileTextLine />
            </div>
            <div className="stat-info">
              <h3>Active Tests</h3>
              <span className="stat-number">0</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon green">
              <RiGroupLine />
            </div>
            <div className="stat-info">
              <h3>Student Submissions</h3>
              <span className="stat-number">0</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon yellow">
              <RiBarChartLine />
            </div>
            <div className="stat-info">
              <h3>Average Score</h3>
              <span className="stat-number">0%</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon purple">
              <RiFileTextLine />
            </div>
            <div className="stat-info">
              <h3>Upcoming Tests</h3>
              <span className="stat-number">2</span>
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
            flex: '2'
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
            
            <div className="action-card events">
              <div className="action-icon">
                <RiMegaphoneLine />
              </div>
              <h3>EVENTS & ANNOUNCEMENT</h3>
              <p>Publish important academic events and updates in real-time to keep students informed.</p>
              <button onClick={() => navigateToSection('/announcements')}>MANAGE</button>
            </div>
            
            <div className="action-card tips">
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
            <div className="submissions-content">
              <p>No submissions yet</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
