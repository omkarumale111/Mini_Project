import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine, 
  RiMessageLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiTimeLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';

/**
 * Dashboard component provides the main layout for authenticated users.
 * It features a collapsible sidebar for navigation, a progress chart, leaderboard,
 * and quick access to writing modules.
 */
const Dashboard = () => {
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

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
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
              className="nav-item active"
              onClick={() => navigateToModule('/dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/modules')}
            >
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/dashboard/about')}
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
            <h1>Student Dashboard</h1>
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome, {user?.email || 'omkarumale111'}</h2>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <RiFileTextLine />
            </div>
            <div className="stat-info">
              <h3>Tests Completed</h3>
              <span className="stat-number">3</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon green">
              <RiTimeLine />
            </div>
            <div className="stat-info">
              <h3>Average Score</h3>
              <span className="stat-number">72%</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon yellow">
              <RiTimeLine />
            </div>
            <div className="stat-info">
              <h3>Hours Practiced</h3>
              <span className="stat-number">8.5</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <h3>My Progress</h3>
          <div className="progress-chart">
            <div className="donut-chart" style={{ '--percentage': 70 }}>
              <div className="donut-chart-center">
                <span>70%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="action-cards">
          <div className="action-card test">
            <div className="action-icon">
              <RiFileTextLine />
            </div>
            <h3>Take Test</h3>
            <p>Enter a test code to start a new assessment</p>
            <button onClick={() => navigateToModule('/modules')}>TAKE TEST</button>
          </div>
          <div className="action-card practice">
            <div className="action-icon">
              <RiPencilLine />
            </div>
            <h3>Practice Writing</h3>
            <p>Improve your skills with practice exercises</p>
            <button onClick={() => navigateToModule('/modules')}>PRACTICE</button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          <div className="event-item">
            <div className="event-date">
              <span className="date-number">10</span>
              <span className="date-month">MAY</span>
            </div>
            <div className="event-details">
              <h4>Business Writing Assessment</h4>
              <p>9:00 AM - Test will be available for 2 hours</p>
            </div>
          </div>
          <div className="event-item">
            <div className="event-date">
              <span className="date-number">15</span>
              <span className="date-month">MAY</span>
            </div>
            <div className="event-details">
              <h4>Technical Documentation Test</h4>
              <p>2:00 PM - Test will be available for 90 minutes</p>
            </div>
          </div>
        </div>

        {/* Writing Tip of the Day */}
        <div className="writing-tip">
          <h3>Writing Tip of the Day</h3>
          <div className="tip-content">
            <p>"Use strong verbs — they carry more weight than adjectives. Instead of saying 'the meeting was good,' try 'the meeting energized the team.'"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
