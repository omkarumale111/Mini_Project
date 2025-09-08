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
 * Module 4 Lesson 2: Structuring Research Papers
 */
const Module4Lesson2 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    researchOutline: ''
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

  const handleSubmit = async () => {
    try {
      // Mark lesson as completed
      if (user && user.id) {
        await fetch('http://localhost:5001/api/lesson-complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: user.id,
            lesson_id: 'm4l2'
          })
        });
      }
      
      console.log('Submitted answers:', answers);
      alert('Lesson completed successfully! Next lesson is now unlocked.');
      
      // Navigate back to modules to see progress
      navigate('/modules');
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Answers submitted, but there was an error updating progress.');
    }
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
              <h2>Structuring Research Papers</h2>
              <p>Lesson 2 of 4 • Research & Academic Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  Draft an outline for a research paper on <strong>"The Impact of Social Media on Student Productivity"</strong> 
                  including <strong>Introduction</strong>, <strong>Literature Review</strong>, <strong>Methodology</strong>, 
                  <strong>Findings</strong>, and <strong>Conclusion</strong>.
                </p>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="researchOutline">
                    <h4>Research Paper Outline</h4>
                    <p className="instruction">
                      Create a detailed outline for your research paper that includes:
                      <br />• <strong>Introduction:</strong> Background, problem statement, research questions, thesis
                      <br />• <strong>Literature Review:</strong> Key studies, gaps in research, theoretical framework
                      <br />• <strong>Methodology:</strong> Research design, data collection, analysis methods
                      <br />• <strong>Findings:</strong> Expected results, data presentation, analysis
                      <br />• <strong>Conclusion:</strong> Summary, implications, limitations, future research
                    </p>
                  </label>
                  <textarea
                    id="researchOutline"
                    value={answers.researchOutline}
                    onChange={(e) => handleInputChange('researchOutline', e.target.value)}
                    placeholder="THE IMPACT OF SOCIAL MEDIA ON STUDENT PRODUCTIVITY&#10;Research Paper Outline&#10;&#10;I. INTRODUCTION&#10;   A. Background and Context&#10;      - [Brief overview of social media usage among students]&#10;   B. Problem Statement&#10;      - [Define the research problem]&#10;   C. Research Questions&#10;      - [List 2-3 specific research questions]&#10;   D. Thesis Statement&#10;      - [Clear statement of your argument/position]&#10;&#10;II. LITERATURE REVIEW&#10;   A. Previous Studies on Social Media and Productivity&#10;      - [Key findings from existing research]&#10;   B. Theoretical Framework&#10;      - [Relevant theories or models]&#10;   C. Research Gaps&#10;      - [What hasn't been studied yet]&#10;&#10;III. METHODOLOGY&#10;   A. Research Design&#10;      - [Quantitative/Qualitative/Mixed methods]&#10;   B. Participants/Sample&#10;      - [Who will be studied]&#10;   C. Data Collection Methods&#10;      - [Surveys, interviews, observations, etc.]&#10;   D. Data Analysis Plan&#10;      - [How data will be analyzed]&#10;&#10;IV. FINDINGS&#10;   A. Data Presentation&#10;      - [How results will be organized]&#10;   B. Key Results&#10;      - [Expected main findings]&#10;   C. Analysis and Interpretation&#10;      - [What the results mean]&#10;&#10;V. CONCLUSION&#10;   A. Summary of Findings&#10;      - [Recap of main results]&#10;   B. Implications&#10;      - [Practical and theoretical significance]&#10;   C. Limitations&#10;      - [Study constraints and weaknesses]&#10;   D. Future Research&#10;      - [Recommendations for further study]"
                    rows="25"
                  />
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.researchOutline}
                  >
                    <RiSendPlaneLine />
                    Submit Research Outline
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Module4Lesson2;
