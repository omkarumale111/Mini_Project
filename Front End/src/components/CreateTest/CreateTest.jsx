import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTest.css';
import { 
  RiAddLine, 
  RiDeleteBin6Line, 
  RiSave3Line,
  RiDashboardLine, 
  RiUserLine, 
  RiFileTextLine, 
  RiGroupLine, 
  RiBarChartLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiCalendarEventLine
} from 'react-icons/ri';
import logo from '../../assets/Logo.png';

const CreateTest = () => {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [attemptDeadline, setAttemptDeadline] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([{ id: 1, text: '', wordLimit: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
    handleResize(); // Initial check
    
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

  const navigateToSection = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions([...questions, { id: newId, text: '', wordLimit: '' }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const generateTestCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      alert('Please fill in all questions');
      return;
    }

    // Validate start time is not in the past
    if (startTime) {
      const selectedTime = new Date(startTime);
      const now = new Date();
      if (selectedTime <= now) {
        alert('Start time must be in the future');
        return;
      }
    }

    // Validate attempt deadline is not in the past and is after start time
    if (attemptDeadline) {
      const selectedDeadline = new Date(attemptDeadline);
      const now = new Date();
      if (selectedDeadline <= now) {
        alert('Attempt deadline must be in the future');
        return;
      }
      
      if (startTime && selectedDeadline <= new Date(startTime)) {
        alert('Attempt deadline must be after the start time');
        return;
      }
    }

    setIsLoading(true);

    try {
      const testData = {
        testName: testName.trim(),
        description: description.trim(),
        startTime: startTime || null,
        attemptDeadline: attemptDeadline || null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        questions: questions.map((q, index) => ({
          text: q.text.trim(),
          order: index + 1,
          wordLimit: q.wordLimit ? parseInt(q.wordLimit) : null
        })),
        teacherId: user.id
      };

      const response = await fetch('http://localhost:5001/api/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Test created successfully! Test Code: ${result.testCode}`);
        navigate('/manage-tests');
      } else {
        alert(result.error || 'Failed to create test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`teacher-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="sidebar-menu-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          <div className="logo-section">
            <img src={logo} alt="WriteEdge Logo" className="sidebar-logo" />
            {!sidebarCollapsed && <span className="logo-text">WriteEdge</span>}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="teacher-nav-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item active"
              onClick={() => navigateToSection('/create-test')}
            >
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Create Test</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/manage-tests')}
            >
              <RiFileEditLine className="nav-icon" />
              {!sidebarCollapsed && <span>Manage Tests</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/reports')}
            >
              <RiBarChartLine className="nav-icon" />
              {!sidebarCollapsed && <span>Reports</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-about')}
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
      <div className="teacher-main-content">
        {/* Top Navigation Bar */}
        <div className="teacher-top-bar">
          <div className="top-bar-title">
            <h1>Create New Test</h1>
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Create Test Content */}
        <div className="create-test-content">
          <form onSubmit={handleSubmit} className="create-test-form">
        <div className="test-info-section">
          <h2>Test Information</h2>
          
          <div className="form-group">
            <label htmlFor="testName">Test Name *</label>
            <input
              type="text"
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter test name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter test description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Test Start Time (Optional)</label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Select when the test should start"
            />
            <small className="form-help">If no start time is set, the test will be available immediately</small>
          </div>

          <div className="form-group">
            <label htmlFor="attemptDeadline">Attempt Deadline (Optional)</label>
            <input
              type="datetime-local"
              id="attemptDeadline"
              value={attemptDeadline}
              onChange={(e) => setAttemptDeadline(e.target.value)}
              placeholder="Select until when students can attempt the test"
            />
            <small className="form-help">Students cannot start the test after this deadline</small>
          </div>

          <div className="form-group">
            <label htmlFor="timeLimit">Time Limit (Optional)</label>
            <input
              type="number"
              id="timeLimit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="Enter time limit in minutes"
              min="1"
              max="120"
            />
            <small className="form-help">Leave empty for no time limit. Maximum 120 minutes (2 hours)</small>
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h2>Questions</h2>
            <button 
              type="button" 
              className="add-question-btn"
              onClick={addQuestion}
            >
              <RiAddLine /> Add Question
            </button>
          </div>

          <div className="questions-list">
            {questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="remove-question-btn"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  placeholder="Enter your question here... (Students will provide 3-4 sentence paragraph answers)"
                  rows="4"
                  required
                />
                <div className="question-settings">
                  <div className="word-limit-input">
                    <label htmlFor={`wordLimit-${question.id}`}>Word Limit (Optional):</label>
                    <input
                      type="number"
                      id={`wordLimit-${question.id}`}
                      value={question.wordLimit}
                      onChange={(e) => updateQuestion(question.id, 'wordLimit', e.target.value)}
                      placeholder="Max words"
                      min="10"
                      max="1000"
                    />
                    <small>Leave empty for no word limit</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/teacher-dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="create-btn"
            disabled={isLoading}
          >
            <RiSave3Line />
            {isLoading ? 'Creating...' : 'Create Test'}
          </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
