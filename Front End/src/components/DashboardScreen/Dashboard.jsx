import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { 
  RiDashboardLine, 
  RiBook2Line, 
  RiChat3Line, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine
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
  const navigate = useNavigate();

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
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          {!sidebarCollapsed && <h2>Menu</h2>}
        </div>
        
        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar">
            <div className="avatar-placeholder">
              <span>JS</span>
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <h3>John Smith</h3>
              <p>Free Plan</p>
            </div>
          )}
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
              onClick={() => navigateToModule('/learning')}
            >
              <RiBook2Line className="nav-icon" />
              {!sidebarCollapsed && <span>My Learning</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/messages')}
            >
              <RiChat3Line className="nav-icon" />
              {!sidebarCollapsed && <span>Messages</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/settings')}
            >
              <RiSettings4Line className="nav-icon" />
              {!sidebarCollapsed && <span>Settings</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/help')}
            >
              <RiQuestionLine className="nav-icon" />
              {!sidebarCollapsed && <span>Help</span>}
            </li>
            <li 
              className="nav-item" 
              onClick={() => {
                // Handle logout logic here
                navigate('/login');
              }}
            >
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Logout</span>}
            </li>
          </ul>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        <div className="top-bar">
          <div className="logo-group">
            <img src={logo} alt="WriteEdge Logo" className="dashboard-logo" />
            <span className="logo">WriteEdge</span>
          </div>
        </div>

        {/* Progress donut chart */}
        <div className="top-section">
          <div className="progress-section">
            <div className="content-header">
              <h1>MY PROGRESS</h1>
            </div>
            <div className="donut-chart-container">
              <div className="donut-chart" style={{ '--percentage': 70 }}>
                <div className="donut-chart-center">
                  <span>70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard table for top users */}
          <div className="leaderboard-section">
            <h2>LEADER BOARD</h2>
            <table>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Grace Johnston</td>
                  <td>105k</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Albert Maldonado</td>
                  <td>74k</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Sallie Hunter</td>
                  <td>50k</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Dustin Terry</td>
                  <td>32k</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Julia Mendoza</td>
                  <td>28k</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Module cards for quick access to different writing modules */}
        <div className="modules-section">
          <div className="module-card">
            <h3>Writing Essentials</h3>
            <button onClick={() => navigateToModule('/writing-essentials')}>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Reports & Briefs</h3>
            <button onClick={() => navigateToModule('/reports-brief')}>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Email & Memos</h3>
            <button onClick={() => navigateToModule('/emails-memos')}>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Letters & Applications</h3>
            <button onClick={() => navigateToModule('/letters-applications')}>PRACTICE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
