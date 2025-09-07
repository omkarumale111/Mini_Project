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
 * Module 3 Lesson 2: Creating Compelling Arguments
 */
const Module3Lesson2 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    argumentativeEssay: ''
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
    alert('Argumentative essay submitted successfully!');
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
              <h2>Creating Compelling Arguments</h2>
              <p>Lesson 2 of 4 • Advanced Persuasive Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Write a short <strong>argumentative essay (250–300 words)</strong> on whether companies should adopt a <strong>4-day workweek</strong>.
                </p>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="argumentativeEssay">
                    <h4>4-Day Workweek Argumentative Essay</h4>
                    <p className="instruction">
                      Structure your essay with:
                      <br />• <strong>Introduction:</strong> Hook, background, and clear thesis statement
                      <br />• <strong>Body Paragraphs:</strong> 2-3 main arguments with evidence and examples
                      <br />• <strong>Counterargument:</strong> Address opposing viewpoint and refute it
                      <br />• <strong>Conclusion:</strong> Restate thesis and call to action
                      <br />
                      Word count: 250-300 words
                    </p>
                  </label>
                  <textarea
                    id="argumentativeEssay"
                    value={answers.argumentativeEssay}
                    onChange={(e) => handleInputChange('argumentativeEssay', e.target.value)}
                    placeholder="Should Companies Adopt a 4-Day Workweek?&#10;&#10;[Introduction with hook and thesis statement]&#10;&#10;[Body paragraph 1 - First main argument with evidence]&#10;&#10;[Body paragraph 2 - Second main argument with evidence]&#10;&#10;[Counterargument and refutation]&#10;&#10;[Conclusion with restatement and call to action]"
                    rows="18"
                  />
                </div>

                <div className="word-count">
                  <p>Word count: {answers.argumentativeEssay.split(' ').filter(word => word.length > 0).length} / 250-300 words</p>
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.argumentativeEssay}
                  >
                    <RiSendPlaneLine />
                    Submit Essay
                  </button>
                </div>
              </div>
            </div>

            <div className="lesson-sidebar">
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Structure compelling arguments</li>
                  <li>Use evidence to support claims</li>
                  <li>Address counterarguments effectively</li>
                  <li>Write persuasive conclusions</li>
                </ul>
              </div>

              <div className="tips-section">
                <h3>Argumentative Writing Tips</h3>
                <ul>
                  <li>Start with a strong hook</li>
                  <li>State your thesis clearly</li>
                  <li>Use credible evidence and examples</li>
                  <li>Address opposing viewpoints</li>
                  <li>End with a compelling call to action</li>
                </ul>
              </div>

              <div className="progress-section">
                <h3>Module Progress</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '50%' }}></div>
                </div>
                <p>Lesson 2 of 4 completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module3Lesson2;
