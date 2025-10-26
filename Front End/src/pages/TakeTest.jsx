import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine, 
  RiLockLine,
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiBarChartLine
} from 'react-icons/ri';
import logo from '../assets/Logo.png';
import './TakeTest.css';

/**
 * TakeTest component allows students to enter a test ID to join a specific test.
 * Validates the test ID and redirects to the appropriate test interface.
 */
const TakeTest = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [testId, setTestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleTestIdChange = (e) => {
    setTestId(e.target.value.toUpperCase());
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testId.trim()) {
      setError('Please enter a test code');
      return;
    }

    if (testId.length < 6) {
      setError('Test code must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate test code with API
      const response = await fetch(`http://localhost:5001/api/validate-test-code/${testId}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        // Navigate to test interface with test code
        navigate(`/test/${testId}`);
      } else {
        setError(data.error || 'Invalid test code. Please check and try again.');
      }
    } catch (err) {
      console.error('Error validating test code:', err);
      setError('Failed to validate test code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="take-test-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        <RiMenuFoldLine />
      </button>

      {/* Sidebar navigation */}
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
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
            <li 
              className="nav-item active"
              onClick={() => navigateToModule('/take-test')}
            >
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Take Test</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/student-report')}
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
          </div>
          
        </div>

        {/* Test Content */}
        <div className="test-content">
          <div className="page-title">
            <h1>Take Test</h1>
          </div>
          <div className="test-header">
            <p>Enter the test ID provided by your instructor to begin your assessment</p>
          </div>

          <div className="test-main">
            <div className="test-entry-card">
              <div className="card-header">
                <div className="test-icon">
                  <RiFileTextLine />
                </div>
                <h3>Enter Test Details</h3>
              </div>

              <form onSubmit={handleSubmit} className="test-form">
                <div className="form-group">
                  <label htmlFor="testId">Test Code</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="testId"
                      value={testId}
                      onChange={handleTestIdChange}
                      placeholder="Enter test code (e.g., ABC123)"
                      className={error ? 'error' : ''}
                      disabled={isLoading}
                      maxLength={10}
                    />
                  </div>
                  {error && <span className="error-message">{error}</span>}
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading || !testId.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Validating...
                    </>
                  ) : (
                    'Start Test'
                  )}
                </button>
              </form>

            </div>

            <div className="test-info">
              <h3>Important Instructions</h3>
              <ul>
                <li>Make sure you have a stable internet connection</li>
                <li>Ensure your device is fully charged or plugged in</li>
                <li>Find a quiet environment for the test</li>
                <li>Have all necessary materials ready before starting</li>
                <li>Contact your instructor if you encounter any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
