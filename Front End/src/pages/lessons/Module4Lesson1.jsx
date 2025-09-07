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
 * Module 4 Lesson 1: Research Methods and Sources
 */
const Module4Lesson1 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    sourceEvaluation: ''
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
    alert('Source evaluation submitted successfully!');
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
              <span className="module-badge">📕 Module 4</span>
              <h2>Research Methods and Sources</h2>
              <p>Lesson 1 of 4 • Research & Academic Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Given a list of sources, identify which are <strong>credible</strong> and which are <strong>not</strong>, 
                  and explain your reasoning.
                </p>
                <div className="source-list">
                  <h4>Sources to Evaluate:</h4>
                  <ol>
                    <li><strong>Wikipedia article</strong> on climate change</li>
                    <li><strong>Peer-reviewed journal</strong> from Nature Climate Change</li>
                    <li><strong>News website</strong> article from BBC News</li>
                    <li><strong>Random blog</strong> post by an anonymous author</li>
                    <li><strong>Government report</strong> from NASA's Climate Change Division</li>
                  </ol>
                </div>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="sourceEvaluation">
                    <h4>Source Credibility Analysis</h4>
                    <p className="instruction">
                      For each source, determine if it's credible or not credible and explain your reasoning. Consider:
                      <br />• Author expertise and credentials
                      <br />• Publication standards and peer review
                      <br />• Bias and objectivity
                      <br />• Currency and relevance
                      <br />• Supporting evidence and citations
                    </p>
                  </label>
                  <textarea
                    id="sourceEvaluation"
                    value={answers.sourceEvaluation}
                    onChange={(e) => handleInputChange('sourceEvaluation', e.target.value)}
                    placeholder="SOURCE 1: Wikipedia article on climate change&#10;Credibility: [Credible/Not Credible]&#10;Reasoning: [Explain your evaluation based on credibility criteria]&#10;&#10;SOURCE 2: Peer-reviewed journal from Nature Climate Change&#10;Credibility: [Credible/Not Credible]&#10;Reasoning: [Explain your evaluation based on credibility criteria]&#10;&#10;SOURCE 3: News website article from BBC News&#10;Credibility: [Credible/Not Credible]&#10;Reasoning: [Explain your evaluation based on credibility criteria]&#10;&#10;SOURCE 4: Random blog post by anonymous author&#10;Credibility: [Credible/Not Credible]&#10;Reasoning: [Explain your evaluation based on credibility criteria]&#10;&#10;SOURCE 5: Government report from NASA's Climate Change Division&#10;Credibility: [Credible/Not Credible]&#10;Reasoning: [Explain your evaluation based on credibility criteria]&#10;&#10;SUMMARY:&#10;[Provide general guidelines for evaluating source credibility]"
                    rows="20"
                  />
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.sourceEvaluation}
                  >
                    <RiSendPlaneLine />
                    Submit Source Evaluation
                  </button>
                </div>
              </div>
            </div>

            <div className="lesson-sidebar">
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Evaluate source credibility effectively</li>
                  <li>Identify reliable vs unreliable sources</li>
                  <li>Apply credibility criteria systematically</li>
                  <li>Develop critical thinking skills</li>
                </ul>
              </div>

              <div className="tips-section">
                <h3>Credibility Criteria</h3>
                <ul>
                  <li><strong>Authority:</strong> Author expertise</li>
                  <li><strong>Accuracy:</strong> Factual correctness</li>
                  <li><strong>Objectivity:</strong> Minimal bias</li>
                  <li><strong>Currency:</strong> Up-to-date information</li>
                  <li><strong>Coverage:</strong> Comprehensive scope</li>
                </ul>
              </div>

              <div className="progress-section">
                <h3>Module Progress</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '25%' }}></div>
                </div>
                <p>Lesson 1 of 4 completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module4Lesson1;
