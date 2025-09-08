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
  RiMenuUnfoldLine
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
      setError('Please enter a test ID');
      return;
    }

    if (testId.length < 6) {
      setError('Test ID must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call to validate test ID
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in real app, this would be an API call
      const validTestIds = ['TEST001', 'EXAM123', 'QUIZ456', 'ASSESS789'];
      
      if (validTestIds.includes(testId)) {
        // Navigate to actual test interface with test ID
        navigate(`/test/${testId}`);
      } else {
        setError('Invalid test ID. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate test ID. Please try again.');
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
          <div className="test-header">
            <h2>Take Test</h2>
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
                  <label htmlFor="testId">Test ID</label>
                  <div className="input-wrapper">
                    <RiLockLine className="input-icon" />
                    <input
                      type="text"
                      id="testId"
                      value={testId}
                      onChange={handleTestIdChange}
                      placeholder="Enter test ID (e.g., TEST001)"
                      className={error ? 'error' : ''}
                      disabled={isLoading}
                      maxLength={20}
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
