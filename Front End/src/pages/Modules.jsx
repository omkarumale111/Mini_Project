import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine,
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiBarChartLine
} from "react-icons/ri";
import { FaLock, FaCheck } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Modules.css';

const Modules = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('writing'); // 'writing' or 'listening'

  // Get user data and load lesson progress
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

  useEffect(() => {
    const loadLessonProgress = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-progress/${user.id}`);
          if (response.ok) {
            const progress = await response.json();
            console.log('Frontend received lesson progress:', progress);
            console.log('M1L1 status:', progress['m1l1']);
            console.log('M1L2 status:', progress['m1l2']);
            setLessonProgress(progress);
            setProgressLoaded(true);
          }
        } catch (error) {
          console.error('Error loading lesson progress:', error);
          setProgressLoaded(true); // Set to true even on error to prevent infinite loading
        }
      }
    };

    loadLessonProgress();
  }, [user]);

  // Add effect to reload progress when returning from a lesson
  useEffect(() => {
    const reloadProgress = async () => {
      if (user && user.id && location.pathname === '/modules') {
        try {
          const response = await fetch(`http://localhost:5001/api/lesson-progress/${user.id}`);
          if (response.ok) {
            const progress = await response.json();
            console.log('Reloaded lesson progress on modules page:', progress);
            setLessonProgress(progress);
            setProgressLoaded(true);
          }
        } catch (error) {
          console.error('Error reloading lesson progress:', error);
        }
      }
    };

    reloadProgress();
  }, [location.pathname, user]);


  const calculateModuleProgress = (moduleId) => {
    const lessonIds = [
      `m${moduleId}l1`,
      `m${moduleId}l2`, 
      `m${moduleId}l3`,
      `m${moduleId}l4`
    ];
    
    const completedLessons = lessonIds.filter(lessonId => 
      lessonProgress[lessonId]?.completed
    ).length;
    
    return Math.round((completedLessons / lessonIds.length) * 100);
  };

  const calculateListeningModuleProgress = (moduleId) => {
    const lessonIds = [];
    for (let i = 1; i <= 10; i++) {
      lessonIds.push(`${moduleId}l${i}`);
    }
    
    const completedLessons = lessonIds.filter(lessonId => 
      lessonProgress[lessonId]?.completed
    ).length;
    
    return Math.round((completedLessons / lessonIds.length) * 100);
  };

  const getModuleCompletionDate = (moduleId) => {
    const lesson4Id = `m${moduleId}l4`;
    const lesson4Data = lessonProgress[lesson4Id];
    
    if (lesson4Data?.completed) {
      // Return formatted date from completed_at timestamp
      const completedAt = new Date(lesson4Data.completed_at || Date.now());
      return completedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return 'NA';
  };

  const getListeningModuleCompletionDate = (moduleId) => {
    const lesson10Id = `${moduleId}l10`;
    const lesson10Data = lessonProgress[lesson10Id];
    
    if (lesson10Data?.completed) {
      // Return formatted date from completed_at timestamp
      const completedAt = new Date(lesson10Data.completed_at || Date.now());
      return completedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return 'NA';
  };

  const getWritingModulesData = () => {
    console.log('Current lessonProgress state:', lessonProgress);
    console.log('M1L2 lesson data:', lessonProgress['m1l2']);
    return [
      {
        id: 1,
        title: "Business Communication Basics",
        emoji: "📘",
        progress: calculateModuleProgress(1),
        completionDate: getModuleCompletionDate(1),
        lessons: [
          {
            id: 1,
            title: "Principles of Effective Communication",
            status: lessonProgress['m1l1']?.status || 'available',
            completedDate: lessonProgress['m1l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Writing Professional Emails",
            status: lessonProgress['m1l2']?.status || 
              (lessonProgress['m1l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m1l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Creating Effective Business Reports",
            status: lessonProgress['m1l3']?.status || 
              (lessonProgress['m1l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m1l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Writing for Internal Communications",
            status: lessonProgress['m1l4']?.status || 
              (lessonProgress['m1l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m1l4']?.completed ? 'Completed' : null
          }
        ]
      },
      {
        id: 2,
        title: "Technical Writing Foundations",
        emoji: "📗",
        progress: calculateModuleProgress(2),
        completionDate: getModuleCompletionDate(2),
        lessons: [
          {
            id: 1,
            title: "Understanding Technical Documentation",
            status: lessonProgress['m2l1']?.status || 
              (lessonProgress['m1l4']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m2l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Writing User Guides",
            status: lessonProgress['m2l2']?.status || 
              (lessonProgress['m2l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m2l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Technical Specifications",
            status: lessonProgress['m2l3']?.status || 
              (lessonProgress['m2l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m2l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Technical Presentations",
            status: lessonProgress['m2l4']?.status || 
              (lessonProgress['m2l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m2l4']?.completed ? 'Completed' : null
          }
        ]
      },
      {
        id: 3,
        title: "Advanced Persuasive Writing",
        emoji: "📙",
        progress: calculateModuleProgress(3),
        completionDate: getModuleCompletionDate(3),
        lessons: [
          {
            id: 1,
            title: "Psychology of Persuasion",
            status: lessonProgress['m3l1']?.status || 
              (lessonProgress['m2l4']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m3l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Creating Compelling Arguments",
            status: lessonProgress['m3l2']?.status || 
              (lessonProgress['m3l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m3l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Marketing Copy Techniques",
            status: lessonProgress['m3l3']?.status || 
              (lessonProgress['m3l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m3l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Ethical Persuasion",
            status: lessonProgress['m3l4']?.status || 
              (lessonProgress['m3l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m3l4']?.completed ? 'Completed' : null
          }
        ]
      },
      {
        id: 4,
        title: "Research & Academic Writing",
        emoji: "📕",
        progress: calculateModuleProgress(4),
        completionDate: getModuleCompletionDate(4),
        lessons: [
          {
            id: 1,
            title: "Research Methods and Sources",
            status: lessonProgress['m4l1']?.status || 
              (lessonProgress['m3l4']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m4l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Structuring Research Papers",
            status: lessonProgress['m4l2']?.status || 
              (lessonProgress['m4l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m4l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Citation and Referencing Styles",
            status: lessonProgress['m4l3']?.status || 
              (lessonProgress['m4l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m4l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Writing Abstracts and Summaries",
            status: lessonProgress['m4l4']?.status || 
              (lessonProgress['m4l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['m4l4']?.completed ? 'Completed' : null
          }
        ]
      }
    ];
  };

  const getListeningModulesData = () => {
    return [
      {
        id: 'L1',
        title: "Error Identification and Correction",
        emoji: "🎙️",
        type: 'listening',
        progress: calculateListeningModuleProgress('L1'),
        completionDate: getListeningModuleCompletionDate('L1'),
        lessons: [
          {
            id: 1,
            title: "Subject-Verb Agreement Error",
            sentence: "He don't likes to play cricket.",
            correctAnswer: "He doesn't like to play cricket.",
            status: lessonProgress['L1l1']?.status || 'available',
            completedDate: lessonProgress['L1l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Singular-Plural Mismatch",
            sentence: "The meeting are scheduled for tomorrow.",
            correctAnswer: "The meeting is scheduled for tomorrow.",
            status: lessonProgress['L1l2']?.status || (lessonProgress['L1l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Comparative Adjective Error",
            sentence: "She is more smarter than her brother.",
            correctAnswer: "She is smarter than her brother.",
            status: lessonProgress['L1l3']?.status || (lessonProgress['L1l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Incorrect Verb Usage",
            sentence: "I am agree with your opinion.",
            correctAnswer: "I agree with your opinion.",
            status: lessonProgress['L1l4']?.status || (lessonProgress['L1l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l4']?.completed ? 'Completed' : null
          },
          {
            id: 5,
            title: "Past Tense Error",
            sentence: "He did not told me about the problem.",
            correctAnswer: "He did not tell me about the problem.",
            status: lessonProgress['L1l5']?.status || (lessonProgress['L1l4']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l5']?.completed ? 'Completed' : null
          },
          {
            id: 6,
            title: "There Is/Are Agreement",
            sentence: "There is five members in my team.",
            correctAnswer: "There are five members in my team.",
            status: lessonProgress['L1l6']?.status || (lessonProgress['L1l5']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l6']?.completed ? 'Completed' : null
          },
          {
            id: 7,
            title: "Tense Consistency Error",
            sentence: "My friend have completed the project yesterday.",
            correctAnswer: "My friend completed the project yesterday.",
            status: lessonProgress['L1l7']?.status || (lessonProgress['L1l6']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l7']?.completed ? 'Completed' : null
          },
          {
            id: 8,
            title: "Plural Subject Agreement",
            sentence: "They was very tired after the journey.",
            correctAnswer: "They were very tired after the journey.",
            status: lessonProgress['L1l8']?.status || (lessonProgress['L1l7']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l8']?.completed ? 'Completed' : null
          },
          {
            id: 9,
            title: "Each/Every Agreement",
            sentence: "Each of the students have submitted their reports.",
            correctAnswer: "Each of the students has submitted their reports.",
            status: lessonProgress['L1l9']?.status || (lessonProgress['L1l8']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l9']?.completed ? 'Completed' : null
          },
          {
            id: 10,
            title: "Preposition Usage Error",
            sentence: "The manager discussed about the issue in detail.",
            correctAnswer: "The manager discussed the issue in detail.",
            status: lessonProgress['L1l10']?.status || (lessonProgress['L1l9']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L1l10']?.completed ? 'Completed' : null
          }
        ]
      },
      {
        id: 'L2',
        title: "Situational Communication",
        emoji: "💼",
        type: 'listening',
        progress: calculateListeningModuleProgress('L2'),
        completionDate: getListeningModuleCompletionDate('L2'),
        lessons: [
          {
            id: 1,
            title: "Office Event Invitation",
            scenario: "Invite all employees to the annual office gala in a friendly tone.",
            status: lessonProgress['L2l1']?.status || (lessonProgress['L1l10']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l1']?.completed ? 'Completed' : null
          },
          {
            id: 2,
            title: "Client Meeting Update",
            scenario: "Inform your client that the meeting will be held online, as per their request.",
            status: lessonProgress['L2l2']?.status || (lessonProgress['L2l1']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l2']?.completed ? 'Completed' : null
          },
          {
            id: 3,
            title: "Leave Request",
            scenario: "Politely ask your manager for a short leave due to a personal reason.",
            status: lessonProgress['L2l3']?.status || (lessonProgress['L2l2']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l3']?.completed ? 'Completed' : null
          },
          {
            id: 4,
            title: "Team Congratulations",
            scenario: "Congratulate your team on completing a major project successfully.",
            status: lessonProgress['L2l4']?.status || (lessonProgress['L2l3']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l4']?.completed ? 'Completed' : null
          },
          {
            id: 5,
            title: "Delay Notification",
            scenario: "Explain to a client that their project delivery might be delayed and apologize professionally.",
            status: lessonProgress['L2l5']?.status || (lessonProgress['L2l4']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l5']?.completed ? 'Completed' : null
          },
          {
            id: 6,
            title: "New Intern Welcome",
            scenario: "Welcome a new intern joining your team for the first time.",
            status: lessonProgress['L2l6']?.status || (lessonProgress['L2l5']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l6']?.completed ? 'Completed' : null
          },
          {
            id: 7,
            title: "Supervisor Appreciation",
            scenario: "Thank your supervisor for guiding you during a difficult task.",
            status: lessonProgress['L2l7']?.status || (lessonProgress['L2l6']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l7']?.completed ? 'Completed' : null
          },
          {
            id: 8,
            title: "Customer Complaint Response",
            scenario: "Respond to a customer complaint politely and assure them of a quick resolution.",
            status: lessonProgress['L2l8']?.status || (lessonProgress['L2l7']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l8']?.completed ? 'Completed' : null
          },
          {
            id: 9,
            title: "Meeting Announcement",
            scenario: "Inform your team about an important meeting scheduled tomorrow morning.",
            status: lessonProgress['L2l9']?.status || (lessonProgress['L2l8']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l9']?.completed ? 'Completed' : null
          },
          {
            id: 10,
            title: "Farewell Message",
            scenario: "Give a short farewell message to a colleague who is leaving the company.",
            status: lessonProgress['L2l10']?.status || (lessonProgress['L2l9']?.completed ? 'available' : 'locked'),
            completedDate: lessonProgress['L2l10']?.completed ? 'Completed' : null
          }
        ]
      }
    ];
  };

  const getCurrentModulesData = () => {
    return activeSection === 'writing' ? getWritingModulesData() : getListeningModulesData();
  };

  // Set selected module after modules data is available and progress is loaded
  useEffect(() => {
    if (progressLoaded) {
      const modulesData = getCurrentModulesData();
      if (modulesData.length > 0 && !selectedModule) {
        setSelectedModule(modulesData[0]);
      }
    }
  }, [lessonProgress, selectedModule, progressLoaded, activeSection]);

  // Reset selected module when switching sections
  useEffect(() => {
    const modulesData = getCurrentModulesData();
    if (modulesData.length > 0) {
      setSelectedModule(modulesData[0]);
    }
  }, [activeSection]);


  const handleNavigation = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleContinueModule = () => {
    // Navigate to the next lesson or current lesson in progress
    const nextLesson = selectedModule.lessons.find(lesson => 
      lesson.status === 'in_progress' || lesson.status === 'available'
    );
    if (nextLesson) {
      navigate(`/module${selectedModule.id}/lesson${nextLesson.id}`);
    }
  };

  const handleLessonClick = (lesson) => {
    // Only allow navigation to completed or available lessons
    if (lesson.status === 'completed' || lesson.status === 'available') {
      if (selectedModule.type === 'listening') {
        navigate(`/listening/${selectedModule.id}/lesson${lesson.id}`);
      } else {
        navigate(`/module${selectedModule.id}/lesson${lesson.id}`);
      }
    }
  };

  const handleLogout = () => {
    storage.removeUser();
    navigate('/login');
  };

  // Don't render until we have module data and progress is loaded
  if (!selectedModule || !progressLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="modules-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="backdrop visible" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile ? (sidebarVisible ? 'visible' : '') : 'visible'}`}
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
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => handleNavigation('/profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className={`nav-item ${location.pathname === '/modules' ? 'active' : ''}`}
              onClick={() => handleNavigation('/modules')}
            >
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
            <li 
              className={`nav-item ${location.pathname === '/take-test' ? 'active' : ''}`}
              onClick={() => handleNavigation('/take-test')}
            >
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Take Test</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => handleNavigation('/student-report')}
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
              onClick={() => handleNavigation('/dashboard/about')}
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
          
        </div>

        <div className="modules-content">
          {/* Module List Sidebar */}
          <div className="modules-sidebar">
            {/* Section Toggle */}
            <div className="section-toggle" style={{ marginBottom: '1.5rem' }}>
              <button 
                className={`section-btn ${activeSection === 'writing' ? 'active' : ''}`}
                onClick={() => setActiveSection('writing')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px 0 0 8px',
                  background: activeSection === 'writing' ? '#4CAF50' : '#f0f0f0',
                  color: activeSection === 'writing' ? 'white' : '#666',
                  fontWeight: activeSection === 'writing' ? '600' : '400',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.3s ease'
                }}
              >
                ✍️ Writing
              </button>
              <button 
                className={`section-btn ${activeSection === 'listening' ? 'active' : ''}`}
                onClick={() => setActiveSection('listening')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  background: activeSection === 'listening' ? '#2196F3' : '#f0f0f0',
                  color: activeSection === 'listening' ? 'white' : '#666',
                  fontWeight: activeSection === 'listening' ? '600' : '400',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.3s ease'
                }}
              >
                🎧 Verbal
              </button>
            </div>
            
            <h2>{activeSection === 'writing' ? 'Writing Modules' : 'Listening Modules'}</h2>
            <div className="modules-list">
              {progressLoaded ? getCurrentModulesData().map((module) => (
                <div 
                  key={module.id} 
                  className={`module-item ${selectedModule?.id === module.id ? 'active' : ''}`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <div className="module-header">
                    <span className="module-emoji">{module.emoji}</span>
                    <div className="module-title">{module.title}</div>
                  </div>
                  <div className="module-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{module.progress}% Complete</span>
                  </div>
                </div>
              )) : <div>Loading modules...</div>}
            </div>
          </div>

          {/* Module Details */}
          <div className="module-details">
            <div className="module-detail-header">
              <h1>
                <span className="module-emoji-large">{selectedModule?.emoji}</span>
                {selectedModule?.title}
              </h1>
              {selectedModule?.description && (
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#666', 
                  marginTop: '0.5rem',
                  fontStyle: 'italic' 
                }}>
                  {selectedModule.description}
                </p>
              )}
            </div>
            
            <div className="lessons-list">
              {!progressLoaded ? (
                <div>Loading lessons...</div>
              ) : (
                selectedModule?.lessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className={`lesson-item ${lesson.status} ${lesson.status !== 'locked' ? 'clickable' : ''}`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                  <div className="lesson-number">
                    {lesson.status === 'completed' ? (
                      <FaCheck className="checkmark" />
                    ) : lesson.status === 'locked' ? (
                      <FaLock />
                    ) : (
                      <span className="lesson-num">{lesson.id}</span>
                    )}
                  </div>
                  <div className="lesson-content">
                    <h3>{lesson.title}</h3>
                    {lesson.completedDate && (
                      <p className="completion-date">{lesson.completedDate}</p>
                    )}
                    {lesson.status === 'in_progress' && (
                      <p className="status-text">In Progress</p>
                    )}
                    {lesson.status === 'locked' && (
                      <p className="unlock-date">Complete previous lesson to unlock</p>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="module-footer">
              <button 
                className="continue-button"
                onClick={handleContinueModule}
              >
                Continue Module
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modules;
