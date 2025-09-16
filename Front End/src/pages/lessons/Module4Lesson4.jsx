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
 * Module 4 Lesson 4: Academic Paper Structure
 */
const Module4Lesson4 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    paperOutline: '',
    abstractWriting: ''
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

  // Load saved lesson inputs
  useEffect(() => {
    const loadLessonInputs = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m4l4`);
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
            lesson_id: 'm4l4',
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
    if (!answers.paperOutline || !answers.abstractWriting) {
      alert('Please complete both academic paper structure simulations before getting feedback.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      const combinedText = `Paper Outline: ${answers.paperOutline}\n\nAbstract Writing: ${answers.abstractWriting}`;
      
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
            lesson_id: 'm4l4'
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
      paperOutline: '',
      abstractWriting: ''
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
              <h2>Academic Paper Structure</h2>
              <p>Lesson 4 of 4 • Research & Academic Writing</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-questions">
              <div className="lesson-card">
                <div className="problem-statement">
                  <h3>Academic Paper Structure Simulations</h3>
                  <p>
                    Practice structuring academic papers by completing these two essential components of research writing.
                  </p>
                </div>

                <div className="exercise-section">
                  <div className="exercise-item">
                    <label htmlFor="paperOutline">
                      <h4>Simulation 1: Research Paper Outline</h4>
                      <p className="instruction">
                        Create a detailed outline for a research paper on "The Impact of Social Media on Academic Performance Among College Students." 
                        Include: Introduction with thesis statement, 3 main body sections with supporting points, and conclusion. 
                        Structure it with clear headings and subpoints.
                        <br /><strong>Target: 180–220 words</strong>
                      </p>
                    </label>
                    <textarea
                      id="paperOutline"
                      value={answers.paperOutline}
                      onChange={(e) => handleInputChange('paperOutline', e.target.value)}
                      placeholder="Create your research paper outline here..."
                      rows="8"
                    />
                    <div className="character-count">
                      <span>{answers.paperOutline.length} characters</span>
                    </div>
                  </div>

                  <div className="exercise-item">
                    <label htmlFor="abstractWriting">
                      <h4>Simulation 2: Abstract Writing</h4>
                      <p className="instruction">
                        Write an abstract for the research paper outlined above. Include: background/problem statement, 
                        methodology, key findings (hypothetical), and conclusions. Follow standard academic abstract format.
                        <br /><strong>Target: 120–150 words</strong>
                      </p>
                    </label>
                    <textarea
                      id="abstractWriting"
                      value={answers.abstractWriting}
                      onChange={(e) => handleInputChange('abstractWriting', e.target.value)}
                      placeholder="Write your academic abstract here..."
                      rows="6"
                    />
                    <div className="character-count">
                      <span>{answers.abstractWriting.length} characters</span>
                    </div>
                  </div>

                  <div className="submit-section">
                    <button 
                      className="feedback-button"
                      onClick={handleGetFeedback}
                      disabled={isLoading || !answers.paperOutline || !answers.abstractWriting}
                    >
                      {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
                    </button>
                    
                    <button 
                      className="submit-button"
                      onClick={handleSubmit}
                      disabled={!answers.paperOutline || !answers.abstractWriting}
                    >
                      <RiSendPlaneLine />
                      Submit Lesson
                    </button>
                    
                    <button 
                      className="reset-button"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feedback Section */}
            <div className="lesson-feedback">
              <div className="feedback-card">
                <h3>AI Feedback</h3>
                {!showFeedback ? (
                  <div className="feedback-placeholder">
                    <p>Complete both simulations and click "Get AI Feedback" to receive detailed analysis of your academic paper structure.</p>
                  </div>
                ) : (
                  <div className="feedback-content">
                    {feedback && (
                      <div className="feedback-analysis">
                        <div className="feedback-section">
                          <h4>Structure Analysis</h4>
                          <p>{feedback.structure || 'Analysis of your paper outline structure and organization.'}</p>
                        </div>
                        
                        <div className="feedback-section">
                          <h4>Abstract Quality</h4>
                          <p>{feedback.abstract || 'Evaluation of your abstract completeness and academic format.'}</p>
                        </div>
                        
                        <div className="feedback-section">
                          <h4>Academic Writing</h4>
                          <p>{feedback.academic || 'Assessment of your academic writing style and clarity.'}</p>
                        </div>
                        
                        <div className="feedback-section">
                          <h4>Recommendations</h4>
                          <p>{feedback.recommendations || 'Suggestions for improving your academic paper structure.'}</p>
                        </div>
                      </div>
                    )}
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

export default Module4Lesson4;
