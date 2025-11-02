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
 * Module 3 Lesson 3: Marketing Copy Techniques
 */
const Module3Lesson3 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    productDescription: '',
    emailSubject: ''
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
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m3l3`);
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
            lesson_id: 'm3l3',
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
    if (!answers.productDescription || !answers.emailSubject) {
      alert('Please complete both marketing copy simulations before getting feedback.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      const combinedText = `Product Description: ${answers.productDescription}\n\nEmail Subject Lines: ${answers.emailSubject}`;
      
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
      alert('Error analyzing your product descriptions. Please try again.');
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
            lesson_id: 'm3l3'
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
      productDescription: '',
      emailSubject: ''
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
              <span className="module-badge">📙 Module 3</span>
              <h2>Marketing Copy Techniques</h2>
              <p>Lesson 3 of 4 • Advanced Persuasive Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="practice-content">
              {/* Questions Section - 70% */}
              <div className="questions-section">
                <div className="lesson-card">
                  <div className="problem-statement">
                    <h3>Marketing Copy Techniques Simulations</h3>
                    <p>
                      Practice creating compelling marketing copy using persuasive techniques, emotional appeals, and clear value propositions. Complete both simulations below.
                    </p>
                  </div>

                  <div className="exercise-section">
                    <div className="exercise-item">
                      <label htmlFor="productDescription">
                        <h4>Simulation 1: Product Landing Page Copy</h4>
                        <p className="instruction">
                          Write compelling product copy for a fitness tracking app's landing page.
                          Include: attention-grabbing headline, key benefits, and call-to-action.
                          <br/><strong>Word Limit:</strong> 80–100 words
                        </p>
                      </label>
                      <textarea
                        id="productDescription"
                        value={answers.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        placeholder="Write your fitness app landing page copy..."
                        rows="6"
                      />
                      <div className="character-count">
                        {answers.productDescription?.length || 0} characters
                      </div>
                    </div>

                    <div className="exercise-item">
                      <label htmlFor="emailSubject">
                        <h4>Simulation 2: Email Marketing Campaign</h4>
                        <p className="instruction">
                          Create 5 different email subject lines for a flash sale promotion (50% off electronics).
                          Use various persuasion techniques: urgency, curiosity, benefit-focused, personalization.
                          <br/><strong>Word Limit:</strong> Each subject line 4–8 words
                        </p>
                      </label>
                      <textarea
                        id="emailSubject"
                        value={answers.emailSubject}
                        onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                        placeholder="1. [Subject line using urgency]&#10;2. [Subject line using curiosity]&#10;3. [Subject line focusing on benefits]&#10;4. [Personalized subject line]&#10;5. [Creative/emotional subject line]"
                        rows="6"
                      />
                      <div className="character-count">
                        {answers.emailSubject?.length || 0} characters
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="feedback-button"
                        onClick={handleGetFeedback}
                        disabled={isLoading || !answers.productDescription || !answers.emailSubject}
                      >
                        {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                      </button>
                      <button 
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!answers.productDescription || !answers.emailSubject}
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
                    <div className="placeholder-icon">📱</div>
                    <h3>AI Feedback</h3>
                    <p>Complete all three product descriptions and click "Get AI Feedback" to receive detailed analysis on marketing copy effectiveness, persuasive language usage, and audience appeal.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Analyzing your marketing copy...</h3>
                    <p>Our AI is reviewing your product descriptions for persuasive techniques and marketing effectiveness.</p>
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

export default Module3Lesson3;
