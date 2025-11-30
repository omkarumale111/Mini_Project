import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { storage } from '../../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine, 
  RiMessageLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiTimeLine,
  RiBarChartLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';
import { getTodaysWritingTip } from '../../data/writingTips';

/**
 * Dashboard component provides the main layout for authenticated users.
 * It features a collapsible sidebar for navigation, a progress chart, leaderboard,
 * and quick access to writing modules.
 */
const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [testCount, setTestCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [todaysTip, setTodaysTip] = useState('');
  const [upcomingTests, setUpcomingTests] = useState([]);
  const navigate = useNavigate();

  // Get user data from sessionStorage
  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Fetch test completion count
  useEffect(() => {
    const fetchTestCount = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/student-test-count/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setTestCount(data.completedTests);
          } else {
            console.error('Failed to fetch test count');
          }
        } catch (error) {
          console.error('Error fetching test count:', error);
        }
      }
    };

    fetchTestCount();
  }, [user]);

  // Fetch lesson completion count
  useEffect(() => {
    const fetchLessonCount = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/student-lesson-count/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setLessonCount(data.completedLessons);
          } else {
            console.error('Failed to fetch lesson count');
          }
        } catch (error) {
          console.error('Error fetching lesson count:', error);
        }
      }
    };

    fetchLessonCount();
  }, [user]);

  // Set today's writing tip
  useEffect(() => {
    setTodaysTip(getTodaysWritingTip());
  }, []);

  // Fetch upcoming tests
  useEffect(() => {
    const fetchUpcomingTests = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/upcoming-tests-student/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUpcomingTests(data.upcomingTests);
          } else {
            console.error('Failed to fetch upcoming tests');
          }
        } catch (error) {
          console.error('Error fetching upcoming tests:', error);
        }
      }
    };

    fetchUpcomingTests();
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

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    storage.removeUser();
    navigate('/login');
  };

  // Helper function to format test date and time
  const formatTestDateTime = (test) => {
    const startTime = test.start_time ? new Date(test.start_time) : null;
    const attemptDeadline = test.attempt_deadline ? new Date(test.attempt_deadline) : null;
    const now = new Date();

    if (startTime && startTime > now) {
      // Test hasn't started yet
      return {
        date: startTime.getDate(),
        month: startTime.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: 'Starts at'
      };
    } else if (attemptDeadline && attemptDeadline > now) {
      // Test is available now but has a deadline
      return {
        date: attemptDeadline.getDate(),
        month: attemptDeadline.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        time: attemptDeadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: 'Available until'
      };
    } else {
      // Test is available now with no specific deadline
      const createdDate = new Date(test.created_at);
      return {
        date: createdDate.getDate(),
        month: createdDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        time: 'Available now',
        status: 'Ready to take'
      };
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle" 
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
        <nav className="nav-menu">
          <ul>
            <li 
              className="nav-item active"
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
              className="nav-item"
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
            <li 
              className="nav-item"
              onClick={() => navigateToModule('/student-report')}
            >
              <RiBarChartLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Reports</span>}
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
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome, {user?.email || 'omkarumale111'}</h2>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <RiFileTextLine />
            </div>
            <div className="stat-info">
              <h3>Tests Completed</h3>
              <span className="stat-number">{testCount}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon green">
              <RiTimeLine />
            </div>
            <div className="stat-info">
              <h3>Lessons Completed</h3>
              <span className="stat-number">{lessonCount}</span>
            </div>
          </div>
        </div>


        {/* Action Cards */}
        <div className="action-cards">
          <div className="action-card test">
            <div className="action-icon">
              <RiFileTextLine />
            </div>
            <h3>Take Test</h3>
            <p>Enter a test code to start a new assessment</p>
            <button onClick={() => navigateToModule('/take-test')}>TAKE TEST</button>
          </div>
          <div className="action-card practice">
            <div className="action-icon">
              <RiPencilLine />
            </div>
            <h3>Practice Writing</h3>
            <p>Improve your skills with practice exercises</p>
            <button onClick={() => navigateToModule('/modules')}>PRACTICE</button>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="upcoming-events">
          <h3>Upcoming Tests</h3>
          {upcomingTests.length > 0 ? (
            upcomingTests.map((test) => {
              const dateTime = formatTestDateTime(test);
              const teacherName = test.teacher_first_name && test.teacher_last_name 
                ? `${test.teacher_first_name} ${test.teacher_last_name}`
                : test.teacher_email;
              
              return (
                <div key={test.id} className="event-item">
                  <div className="event-date">
                    <span className="date-number">{dateTime.date}</span>
                    <span className="date-month">{dateTime.month}</span>
                  </div>
                  <div className="event-details">
                    <h4>{test.test_name}</h4>
                    <p>
                      {dateTime.status} {dateTime.time}
                      {test.time_limit_minutes && ` - ${test.time_limit_minutes} minutes`}
                    </p>
                    <small>By {teacherName} • Code: {test.test_code}</small>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="event-item">
              <div className="event-date">
                <span className="date-number">--</span>
                <span className="date-month">---</span>
              </div>
              <div className="event-details">
                <h4>No Upcoming Tests</h4>
                <p>Check back later for new test assignments</p>
              </div>
            </div>
          )}
        </div>

        {/* Writing Tip of the Day */}
        <div className="writing-tip">
          <h3>Writing Tip of the Day</h3>
          <div className="tip-content">
            <p>"{todaysTip}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
