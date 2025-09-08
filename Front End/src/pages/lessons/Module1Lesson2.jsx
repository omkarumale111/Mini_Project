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
 * Module 1 Lesson 2: Writing Professional Emails
 */
const Module1Lesson2 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({
    leaveRequest: '',
    apologyEmail: '',
    complaintEmail: '',
    inquiryEmail: ''
  });
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
          const response = await fetch(`http://localhost:5001/api/lesson-inputs/${user.id}/m1l2`);
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
            lesson_id: 'm1l2',
            input_field: field,
            input_value: value
          })
        });
      } catch (error) {
        console.error('Error saving lesson input:', error);
      }
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
            lesson_id: 'm1l2'
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
              <span className="module-badge">📘 Module 1</span>
              <h2>Writing Professional Emails</h2>
              <p>Lesson 2 of 4 • Business Communication Basics</p>
            </div>
          </div>

          <div className="lesson-main">
            <div className="lesson-card">
              <div className="problem-statement">
                <h3>Problem Statement</h3>
                <p>
                  You need to write the following emails:
                </p>
                <ul style={{ color: 'black' }}>
                  <li>A <strong>request email</strong> asking HR for leave approval</li>
                  <li>An <strong>apology email</strong> to a client for a shipment delay</li>
                  <li>A <strong>complaint email</strong> to IT about a non-functioning laptop</li>
                  <li>An <strong>inquiry email</strong> to a training institute about course fees</li>
                </ul>
              </div>

              <div className="exercise-section">
                <div className="exercise-item">
                  <label htmlFor="leaveRequest">
                    <h4>1. Request Email - Leave Approval to HR</h4>
                    <p className="instruction">
                      Write a professional email requesting leave approval. Include subject line, proper greeting, 
                      reason for leave, dates, and appropriate closing.
                    </p>
                  </label>
                  <textarea
                    id="leaveRequest"
                    value={answers.leaveRequest}
                    onChange={(e) => handleInputChange('leaveRequest', e.target.value)}
                    placeholder="Subject: [Your subject line]&#10;&#10;Dear [Recipient],&#10;&#10;[Your email content]&#10;&#10;Best regards,&#10;[Your name]"
                    rows="8"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="apologyEmail">
                    <h4>2. Apology Email - Shipment Delay to Client</h4>
                    <p className="instruction">
                      Write an apology email to a client about a shipment delay. Acknowledge the issue, 
                      explain briefly, apologize sincerely, and provide next steps.
                    </p>
                  </label>
                  <textarea
                    id="apologyEmail"
                    value={answers.apologyEmail}
                    onChange={(e) => handleInputChange('apologyEmail', e.target.value)}
                    placeholder="Subject: [Your subject line]&#10;&#10;Dear [Client name],&#10;&#10;[Your email content]&#10;&#10;Sincerely,&#10;[Your name]"
                    rows="8"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="complaintEmail">
                    <h4>3. Complaint Email - Non-functioning Laptop to IT</h4>
                    <p className="instruction">
                      Write a complaint email to IT about a laptop issue. Be clear about the problem, 
                      provide relevant details, and request specific action.
                    </p>
                  </label>
                  <textarea
                    id="complaintEmail"
                    value={answers.complaintEmail}
                    onChange={(e) => handleInputChange('complaintEmail', e.target.value)}
                    placeholder="Subject: [Your subject line]&#10;&#10;Dear IT Support,&#10;&#10;[Your email content]&#10;&#10;Thank you,&#10;[Your name]"
                    rows="8"
                  />
                </div>

                <div className="exercise-item">
                  <label htmlFor="inquiryEmail">
                    <h4>4. Inquiry Email - Course Fees to Training Institute</h4>
                    <p className="instruction">
                      Write an inquiry email asking about course fees and details. Be specific about 
                      what information you need and maintain a professional tone.
                    </p>
                  </label>
                  <textarea
                    id="inquiryEmail"
                    value={answers.inquiryEmail}
                    onChange={(e) => handleInputChange('inquiryEmail', e.target.value)}
                    placeholder="Subject: [Your subject line]&#10;&#10;Dear [Institute name],&#10;&#10;[Your email content]&#10;&#10;Best regards,&#10;[Your name]"
                    rows="8"
                  />
                </div>

                <div className="submit-section">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!answers.leaveRequest || !answers.apologyEmail || !answers.complaintEmail || !answers.inquiryEmail}
                  >
                    <RiSendPlaneLine />
                    Submit All Emails
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

export default Module1Lesson2;
