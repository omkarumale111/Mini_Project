import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine,
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiArrowLeftLine,
  RiSendPlaneLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';
import './Lesson.css';

/**
 * Module 3 Lesson 3: Marketing Copy Techniques
 */
const Module3Lesson3 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    smartwatchDescription: '',
    waterBottleDescription: '',
    elearningAppDescription: ''
  });
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

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Submitted answers:', answers);
    alert('Product descriptions submitted successfully!');
  };

  return (
    <div className="lesson-container">
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
              className="nav-item active"
              onClick={() => navigateToModule('/modules')}
            >
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
            <li 
              className="nav-item"
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
            <h1>Student Dashboard</h1>
          </div>
          
          <div className="top-bar-nav">
            <a href="/dashboard" className="nav-link">HOME</a>
            <a href="/dashboard/about" className="nav-link">ABOUT</a>
            <button className="logout-btn" onClick={handleLogout}>LOG OUT</button>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lesson-content">
          <div className="lesson-header">
            <button 
              className="back-button"
              onClick={() => navigate('/modules')}
            >
              <RiArrowLeftLine />
              <span>Back to Modules</span>
            </button>
            <div className="lesson-info">
              <span className="module-badge">📙 Module 3</span>
              <h2>Marketing Copy Techniques</h2>
              <p>Lesson 3 of 4 • Advanced Persuasive Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Write <strong>three catchy product descriptions (2–3 sentences each)</strong> for: 
                  a <strong>smartwatch</strong>, an <strong>eco-friendly water bottle</strong>, and a <strong>new e-learning app</strong>.
                </p>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="smartwatchDescription">
                    <h4>1. Smartwatch Product Description</h4>
                    <p className="instruction">
                      Write a compelling 2-3 sentence description for a smartwatch. Focus on benefits, 
                      unique features, and emotional appeal.
                    </p>
                  </label>
                  <textarea
                    id="smartwatchDescription"
                    value={answers.smartwatchDescription}
                    onChange={(e) => handleInputChange('smartwatchDescription', e.target.value)}
                    placeholder="Write your smartwatch description here..."
                    rows="4"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="waterBottleDescription">
                    <h4>2. Eco-Friendly Water Bottle Product Description</h4>
                    <p className="instruction">
                      Create an engaging 2-3 sentence description for an eco-friendly water bottle. 
                      Highlight environmental benefits and practical features.
                    </p>
                  </label>
                  <textarea
                    id="waterBottleDescription"
                    value={answers.waterBottleDescription}
                    onChange={(e) => handleInputChange('waterBottleDescription', e.target.value)}
                    placeholder="Write your eco-friendly water bottle description here..."
                    rows="4"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="elearningAppDescription">
                    <h4>3. E-Learning App Product Description</h4>
                    <p className="instruction">
                      Craft an attractive 2-3 sentence description for a new e-learning app. 
                      Emphasize learning outcomes and user experience.
                    </p>
                  </label>
                  <textarea
                    id="elearningAppDescription"
                    value={answers.elearningAppDescription}
                    onChange={(e) => handleInputChange('elearningAppDescription', e.target.value)}
                    placeholder="Write your e-learning app description here..."
                    rows="4"
                  />
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.smartwatchDescription || !answers.waterBottleDescription || !answers.elearningAppDescription}
                  >
                    <RiSendPlaneLine />
                    Submit All Descriptions
                  </button>
                </div>
              </div>
            </div>

            <div className="lesson-sidebar">
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Write compelling product descriptions</li>
                  <li>Use persuasive language techniques</li>
                  <li>Focus on benefits over features</li>
                  <li>Create emotional connections</li>
                </ul>
              </div>

              <div className="tips-section">
                <h3>Marketing Copy Tips</h3>
                <ul>
                  <li>Lead with benefits, not features</li>
                  <li>Use power words and action verbs</li>
                  <li>Create urgency or exclusivity</li>
                  <li>Appeal to emotions</li>
                  <li>Keep it concise and punchy</li>
                </ul>
              </div>

              <div className="progress-section">
                <h3>Module Progress</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <p>Lesson 3 of 4 completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module3Lesson3;
