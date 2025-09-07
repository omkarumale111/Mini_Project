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
 * Module 3 Lesson 4: Ethical Persuasion
 */
const Module3Lesson4 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    ethicalRewrite: ''
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
    alert('Ethical rewrite submitted successfully!');
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
              <h2>Ethical Persuasion</h2>
              <p>Lesson 4 of 4 • Advanced Persuasive Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Rewrite the following <strong>manipulative statement</strong> into an <strong>ethical persuasive one</strong>:
                </p>
                <div className="manipulative-example">
                  <blockquote>
                    <strong>"Buy this product now, or you'll regret it forever!"</strong>
                  </blockquote>
                </div>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="ethicalRewrite">
                    <h4>Ethical Persuasive Rewrite</h4>
                    <p className="instruction">
                      Transform the manipulative statement into an ethical persuasive message that:
                      <br />• Respects the customer's autonomy
                      <br />• Provides genuine value proposition
                      <br />• Uses honest language without fear tactics
                      <br />• Focuses on benefits rather than threats
                      <br />• Allows for informed decision-making
                    </p>
                  </label>
                  <textarea
                    id="ethicalRewrite"
                    value={answers.ethicalRewrite}
                    onChange={(e) => handleInputChange('ethicalRewrite', e.target.value)}
                    placeholder="Rewrite the manipulative statement into an ethical persuasive message..."
                    rows="8"
                  />
                </div>

                <div className="analysis-section">
                  <h4>Reflection Questions</h4>
                  <p className="instruction">
                    After writing your ethical version, consider:
                    <br />• What makes the original statement manipulative?
                    <br />• How does your rewrite respect the customer's choice?
                    <br />• What persuasive techniques did you use ethically?
                    <br />• How does ethical persuasion build long-term trust?
                  </p>
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.ethicalRewrite}
                  >
                    <RiSendPlaneLine />
                    Submit Ethical Rewrite
                  </button>
                </div>
              </div>
            </div>

            <div className="lesson-sidebar">
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Distinguish ethical from manipulative persuasion</li>
                  <li>Respect audience autonomy and choice</li>
                  <li>Build trust through honest communication</li>
                  <li>Create value-focused messaging</li>
                </ul>
              </div>

              <div className="tips-section">
                <h3>Ethical Persuasion Principles</h3>
                <ul>
                  <li>Be honest and transparent</li>
                  <li>Respect customer autonomy</li>
                  <li>Focus on genuine benefits</li>
                  <li>Avoid fear-based tactics</li>
                  <li>Build long-term relationships</li>
                </ul>
              </div>

              <div className="progress-section">
                <h3>Module Progress</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <p>Module 3 Complete! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module3Lesson4;
