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
 * Module 1 Lesson 4: Writing for Internal Communications
 */
const Module1Lesson4 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    memo: '',
    notice: '',
    slackUpdate: ''
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
    alert('Internal communications submitted successfully!');
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
              <span className="module-badge">📘 Module 1</span>
              <h2>Writing for Internal Communications</h2>
              <p>Lesson 4 of 4 • Business Communication Basics</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Your company is shifting to a <strong>hybrid work model</strong>. Draft the following:
                </p>
                <ul>
                  <li>A <strong>memo</strong> to staff announcing the new schedule</li>
                  <li>A <strong>notice</strong> about an upcoming fire drill</li>
                  <li>A <strong>Slack/Teams update</strong> reminding everyone about tomorrow's team meeting</li>
                </ul>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="memo">
                    <h4>1. Company Memo - Hybrid Work Model Announcement</h4>
                    <p className="instruction">
                      Write a formal memo announcing the new hybrid work policy. Include header (TO, FROM, DATE, SUBJECT), 
                      clear explanation of the policy, implementation date, and contact for questions.
                    </p>
                  </label>
                  <textarea
                    id="memo"
                    value={answers.memo}
                    onChange={(e) => handleInputChange('memo', e.target.value)}
                    placeholder="MEMORANDUM&#10;&#10;TO: All Staff&#10;FROM: [Your name/title]&#10;DATE: [Current date]&#10;SUBJECT: Implementation of Hybrid Work Model&#10;&#10;[Memo content]"
                    rows="10"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="notice">
                    <h4>2. Fire Drill Notice</h4>
                    <p className="instruction">
                      Write a clear, concise notice about an upcoming fire drill. Include date, time, 
                      procedures to follow, and any special instructions.
                    </p>
                  </label>
                  <textarea
                    id="notice"
                    value={answers.notice}
                    onChange={(e) => handleInputChange('notice', e.target.value)}
                    placeholder="NOTICE: FIRE DRILL&#10;&#10;[Notice content with date, time, and procedures]"
                    rows="8"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="slackUpdate">
                    <h4>3. Slack/Teams Meeting Reminder</h4>
                    <p className="instruction">
                      Write a casual but professional message reminding the team about tomorrow's meeting. 
                      Include time, platform/location, agenda items, and any preparation needed.
                    </p>
                  </label>
                  <textarea
                    id="slackUpdate"
                    value={answers.slackUpdate}
                    onChange={(e) => handleInputChange('slackUpdate', e.target.value)}
                    placeholder="👋 Hey team! Just a friendly reminder about tomorrow's meeting...&#10;&#10;[Meeting details and agenda]"
                    rows="6"
                  />
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.memo || !answers.notice || !answers.slackUpdate}
                  >
                    <RiSendPlaneLine />
                    Submit All Communications
                  </button>
                </div>
              </div>
            </div>

            <div className="lesson-sidebar">
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Write effective internal memos</li>
                  <li>Create clear notices and announcements</li>
                  <li>Adapt tone for different communication channels</li>
                  <li>Ensure clarity in team communications</li>
                </ul>
              </div>

              <div className="tips-section">
                <h3>Internal Communication Tips</h3>
                <ul>
                  <li>Use appropriate formality for each medium</li>
                  <li>Be clear and direct with instructions</li>
                  <li>Include all necessary details</li>
                  <li>Consider your audience's needs</li>
                  <li>Use consistent formatting</li>
                </ul>
              </div>

              <div className="progress-section">
                <h3>Module Progress</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <p>Module 1 Complete! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module1Lesson4;
