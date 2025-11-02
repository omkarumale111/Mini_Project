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
 * Module 4 Lesson 2: Citation and Referencing
 */
const Module4Lesson2 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    citationPractice: '',
    bibliographyCreation: ''
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

  // Load saved lesson inputs
  useEffect(() => {
    const loadLessonInputs = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m4l2`);
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
            lesson_id: 'm4l2',
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
    if (!answers.citationPractice || !answers.bibliographyCreation) {
      alert('Please complete both citation simulations before getting feedback.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      const combinedText = `Citation Practice: ${answers.citationPractice}\n\nBibliography Creation: ${answers.bibliographyCreation}`;
      
      const response = await fetch('http://localhost:5001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing your responses. Please try again.');
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

  const handleReset = () => {
    setAnswers({
      citationPractice: '',
      bibliographyCreation: ''
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
              <span className="module-badge">📕 Module 4</span>
              <h2>Citation and Referencing</h2>
              <p>Lesson 2 of 4 • Research & Academic Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="practice-content">
              {/* Questions Section - 70% */}
              <div className="questions-section">
                <div className="lesson-card">
                  <div className="problem-statement">
                    <h3>Citation and Referencing Simulations</h3>
                    <p>
                      Practice proper academic citation formats and bibliography creation using APA style guidelines. Complete both simulations below.
                    </p>
                  </div>

                  <div className="exercise-section">
                    <div className="exercise-item">
                      <label htmlFor="citationPractice">
                        <h4>Simulation 1: In-Text Citations</h4>
                        <p className="instruction">
                          Create proper APA in-text citations for these sources:
                          <br/>1. Book: "Digital Minimalism" by Cal Newport (2019)
                          <br/>2. Journal article: Smith & Johnson (2022) on social media addiction
                          <br/>3. Website: WHO report on screen time (no author, 2023)
                          <br/>Write 3 sentences using each source with correct citations.
                          <br/><strong>Word Limit:</strong> 100–120 words
                        </p>
                      </label>
                      <textarea
                        id="citationPractice"
                        value={answers.citationPractice}
                        onChange={(e) => handleInputChange('citationPractice', e.target.value)}
                        placeholder="Write sentences with proper APA in-text citations for each source..."
                        rows="7"
                      />
                      <div className="character-count">
                        {answers.citationPractice?.length || 0} characters
                      </div>
                    </div>

                    <div className="exercise-item">
                      <label htmlFor="bibliographyCreation">
                        <h4>Simulation 2: Reference List Creation</h4>
                        <p className="instruction">
                          Create a complete APA reference list for these sources:
                          <br/>1. Journal: Martinez, A. (2023). "Sleep patterns in college students." Sleep Research, 15(3), 45-62.
                          <br/>2. Book: Thompson, R. & Lee, S. (2022). Study habits handbook. Academic Press.
                          <br/>3. Website: National Sleep Foundation (2023). Sleep guidelines for students.
                          <br/><strong>Word Limit:</strong> 80–100 words
                        </p>
                      </label>
                      <textarea
                        id="bibliographyCreation"
                        value={answers.bibliographyCreation}
                        onChange={(e) => handleInputChange('bibliographyCreation', e.target.value)}
                        placeholder="Create properly formatted APA reference list entries..."
                        rows="6"
                      />
                      <div className="character-count">
                        {answers.bibliographyCreation?.length || 0} characters
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="feedback-button"
                        onClick={handleGetFeedback}
                        disabled={isLoading || !answers.citationPractice || !answers.bibliographyCreation}
                      >
                        {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                      </button>
                      <button 
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!answers.citationPractice || !answers.bibliographyCreation}
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
                    <h3>AI Feedback</h3>
                    <p>Complete both citation simulations and click "Get AI Feedback" to receive detailed analysis of your citation and referencing skills.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="feedback-loading">
                    <h3>Analyzing Your Response...</h3>
                    <div className="loading-spinner"></div>
                    <p>Please wait while we analyze your citation formatting and reference list.</p>
                  </div>
                )}

                {showFeedback && feedback && (
                  <div className="feedback-content">
                    <h3>AI Feedback</h3>
                    
                    <div className="feedback-section-item">
                      <h4>Grammar & Spelling</h4>
                      <p>{feedback.grammar}</p>
                    </div>

                    <div className="feedback-section-item">
                      <h4>Content Analysis</h4>
                      <p>{feedback.content}</p>
                    </div>

                    <div className="feedback-section-item">
                      <h4>Suggestions for Improvement</h4>
                      <p>{feedback.suggestions}</p>
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

export default Module4Lesson2;
