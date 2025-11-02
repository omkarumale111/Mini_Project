import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
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
 * Module 1 Lesson 3: Creating Effective Business Reports
 */
const Module1Lesson3 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    salesReport: '',
    conclusionReport: ''
  });
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  // Get user data from sessionStorage
  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Load saved lesson inputs
  useEffect(() => {
    const loadLessonInputs = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m1l3`);
          if (response.ok) {
            const savedInputs = await response.json();
            setAnswers(prevAnswers => ({
              ...prevAnswers,
              ...savedInputs
            }));
          }
        } catch (error) {
          console.error('Error loading lesson inputs:', error);
        }
      }
    };

    loadLessonInputs();
  }, [user]);

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
    storage.removeUser();
    navigate('/login');
  };

  const handleInputChange = async (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));

    // Save to database
    if (user && user.id) {
      try {
        await fetch('http://localhost:5001/api/lesson-inputs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: user.id,
            lesson_id: 'm1l3',
            input_field: field,
            input_value: value
          })
        });
      } catch (error) {
        console.error('Error saving lesson input:', error);
      }
    }
  };

  const handleGetFeedback = async () => {
    // Check if all questions are answered
    if (!answers.salesReport || !answers.conclusionReport) {
      alert('Please complete both simulations before getting feedback.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      const response = await fetch('http://localhost:5001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: `Sales Report: ${answers.salesReport}\n\nConclusion Report: ${answers.conclusionReport}` }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing your report. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            lesson_id: 'm1l3'
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

  const handleReset = () => {
    setAnswers({
      salesReport: '',
      conclusionReport: ''
    });
    setFeedback(null);
    setShowFeedback(false);
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
              <span className="module-badge">📘 Module 1</span>
              <h2>Creating Effective Business Reports</h2>
              <p>Lesson 3 of 4 • Business Communication Basics</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="practice-content">
              {/* Questions Section - 70% */}
              <div className="questions-section">
                <div className="lesson-card">
                  <div className="problem-statement">
                    <h3>Business Report Simulations</h3>
                    <p>
                      Practice creating effective business reports through real-world scenarios. Complete both simulations below.
                    </p>
                  </div>

                  <div className="exercise-section">
                    <div className="exercise-item">
                      <label htmlFor="salesReport">
                        <h4>Simulation 1: Sales Data Analysis</h4>
                        <p className="instruction">
                          You are given sales data for the last 3 months. Write a short business report summarizing the trend.
                          <br/><strong>Word Limit:</strong> 250–300 words
                        </p>
                      </label>
                      <textarea
                        id="salesReport"
                        value={answers.salesReport}
                        onChange={(e) => handleInputChange('salesReport', e.target.value)}
                        placeholder="SALES TREND ANALYSIS REPORT&#10;&#10;[Write your business report analyzing the 3-month sales data trends, including key findings and insights]&#10;&#10;Include: Executive summary, data analysis, trends identified, and recommendations."
                        rows="12"
                      />
                      <div className="character-count">
                        {answers.salesReport?.length || 0} characters
                      </div>
                    </div>

                    <div className="exercise-item">
                      <label htmlFor="conclusionReport">
                        <h4>Simulation 2: Employee Satisfaction Report Conclusion</h4>
                        <p className="instruction">
                          Draft the conclusion section of a 2-page report on employee satisfaction survey results.
                          <br/><strong>Word Limit:</strong> 150–180 words
                        </p>
                      </label>
                      <textarea
                        id="conclusionReport"
                        value={answers.conclusionReport}
                        onChange={(e) => handleInputChange('conclusionReport', e.target.value)}
                        placeholder="CONCLUSION&#10;&#10;[Write the conclusion section summarizing the employee satisfaction survey findings, key takeaways, and recommended next steps]&#10;&#10;Include: Summary of findings, implications, and actionable recommendations."
                        rows="10"
                      />
                      <div className="character-count">
                        {answers.conclusionReport?.length || 0} characters
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="feedback-button"
                        onClick={handleGetFeedback}
                        disabled={isLoading || !answers.salesReport || !answers.conclusionReport}
                      >
                        {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                      </button>
                      <button 
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!answers.salesReport || !answers.conclusionReport}
                      >
                        <RiSendPlaneLine />
                        Complete Lesson
                      </button>
                      <button 
                        className="reset-button"
                        onClick={handleReset}
                        disabled={isLoading}
                      >
                        Reset All
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Section - 30% */}
              <div className="feedback-section">
                {!showFeedback && !isLoading && (
                  <div className="feedback-placeholder">
                    <div className="placeholder-icon">📊</div>
                    <h3>AI Feedback</h3>
                    <p>Write your business report and click "Get AI Feedback" to receive detailed analysis including grammar suggestions, content structure feedback, and professional writing tips.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Analyzing your report...</h3>
                    <p>Our AI is reviewing your business report for clarity, structure, and professional tone.</p>
                  </div>
                )}

                {showFeedback && feedback && (
                  <div className="feedback-content">
                    <h2>Analysis Results</h2>
                    
                    <div className="feedback-section-item">
                      <h3>📚 Grammar & Spelling</h3>
                      <div className="feedback-text">
                        {feedback.spellAndGrammar}
                      </div>
                    </div>

                    <div className="feedback-section-item">
                      <h3>💡 Content Feedback</h3>
                      <div className="feedback-text">
                        {feedback.contentFeedback}
                      </div>
                    </div>

                    <div className="feedback-section-item">
                      <h3>🎯 Suggestions</h3>
                      <div className="feedback-text">
                        {feedback.suggestions}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module1Lesson3;
