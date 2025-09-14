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
 * Module 2 Lesson 3: Technical Specifications
 */
const Module2Lesson3 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    requirementsDocument: ''
  });
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load saved lesson inputs
  useEffect(() => {
    const loadLessonInputs = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m2l3`);
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
    localStorage.removeItem('user');
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
            lesson_id: 'm2l3',
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
    if (!answers.requirementsDocument) {
      alert('Please write your requirements document before getting feedback.');
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
        body: JSON.stringify({ text: answers.requirementsDocument }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing your requirements document. Please try again.');
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
            lesson_id: 'm2l3'
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
      requirementsDocument: ''
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
              <span className="module-badge">📗 Module 2</span>
              <h2>Technical Specifications</h2>
              <p>Lesson 3 of 4 • Technical Writing Foundations</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="practice-content">
              {/* Questions Section - 70% */}
              <div className="questions-section">
                <div className="lesson-card">
                  <div className="problem-statement">
                    <h3>Problem Statement</h3>
                    <p>
                      Write a feature requirements document for a <strong>"To-Do List App"</strong> that includes: 
                      <strong>task creation</strong>, <strong>deadlines</strong>, <strong>reminders</strong>, and <strong>category tagging</strong>.
                    </p>
                  </div>

                  <div className="exercise-section">
                    <div className="exercise-item">
                      <label htmlFor="requirementsDocument">
                        <h4>Feature Requirements Document - To-Do List App</h4>
                        <p className="instruction">
                          Create a comprehensive requirements document that includes:
                          <br />• Project overview and objectives
                          <br />• Feature specifications for each requirement
                          <br />• User stories and acceptance criteria
                          <br />• Technical considerations
                          <br />• Priority levels for features
                        </p>
                      </label>
                      <textarea
                        id="requirementsDocument"
                        value={answers.requirementsDocument}
                        onChange={(e) => handleInputChange('requirementsDocument', e.target.value)}
                        placeholder="TO-DO LIST APP - FEATURE REQUIREMENTS DOCUMENT&#10;&#10;1. PROJECT OVERVIEW&#10;[Brief description of the app and its purpose]&#10;&#10;2. FEATURE SPECIFICATIONS&#10;&#10;2.1 TASK CREATION&#10;- Description: [What this feature does]&#10;- User Story: As a user, I want to...&#10;- Acceptance Criteria: [Specific requirements]&#10;&#10;2.2 DEADLINES&#10;- Description: [What this feature does]&#10;- User Story: As a user, I want to...&#10;- Acceptance Criteria: [Specific requirements]&#10;&#10;2.3 REMINDERS&#10;- Description: [What this feature does]&#10;- User Story: As a user, I want to...&#10;- Acceptance Criteria: [Specific requirements]&#10;&#10;2.4 CATEGORY TAGGING&#10;- Description: [What this feature does]&#10;- User Story: As a user, I want to...&#10;- Acceptance Criteria: [Specific requirements]&#10;&#10;3. TECHNICAL CONSIDERATIONS&#10;[Platform requirements, data storage, etc.]&#10;&#10;4. PRIORITY MATRIX&#10;[High/Medium/Low priority for each feature]"
                        rows="15"
                      />
                      <div className="character-count">
                        {answers.requirementsDocument?.length || 0} characters
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="feedback-button"
                        onClick={handleGetFeedback}
                        disabled={isLoading || !answers.requirementsDocument}
                      >
                        {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                      </button>
                      <button 
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!answers.requirementsDocument}
                      >
                        <RiSendPlaneLine />
                        Complete Lesson
                      </button>
                      <button 
                        className="reset-button"
                        onClick={handleReset}
                        disabled={isLoading}
                      >
                        Reset Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Section - 30% */}
              <div className="feedback-section">
                {!showFeedback && !isLoading && (
                  <div className="feedback-placeholder">
                    <div className="placeholder-icon">📋</div>
                    <h3>AI Feedback</h3>
                    <p>Write your requirements document and click "Get AI Feedback" to receive detailed analysis including structure assessment, clarity feedback, and technical writing suggestions.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Analyzing your document...</h3>
                    <p>Our AI is reviewing your requirements document for structure, clarity, and technical completeness.</p>
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

export default Module2Lesson3;
