import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiMessageLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiBookLine,
  RiFileTextLine
} from "react-icons/ri";
import logo from '../assets/Logo.png';
import './Modules.css';

const Modules = () => {
  const navigate = useNavigate();
  
  const modulesData = [
    {
      id: 1,
      title: "Business Communication Basics",
      emoji: "📘",
      progress: 60,
      completionDate: "May 15, 2025",
      lessons: [
        {
          id: 1,
          title: "Principles of Effective Communication",
          status: "completed",
          completedDate: "May 2, 2025"
        },
        {
          id: 2,
          title: "Writing Professional Emails",
          status: "completed",
          completedDate: "May 3, 2025"
        },
        {
          id: 3,
          title: "Creating Effective Business Reports",
          status: "in_progress",
          completedDate: null
        },
        {
          id: 4,
          title: "Writing for Internal Communications",
          status: "locked",
          completedDate: null,
          unlockDate: "May 10, 2025"
        }
      ]
    },
    {
      id: 2,
      title: "Technical Writing Foundations",
      emoji: "📗",
      progress: 0,
      completionDate: "June 1, 2025",
      lessons: [
        {
          id: 1,
          title: "Understanding Technical Documentation",
          status: "locked",
          completedDate: null
        },
        {
          id: 2,
          title: "Writing User Guides",
          status: "locked",
          completedDate: null
        },
        {
          id: 3,
          title: "Technical Specifications",
          status: "locked",
          completedDate: null
        },
        {
          id: 4,
          title: "Technical Presentations",
          status: "locked",
          completedDate: null
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Persuasive Writing",
      emoji: "📙",
      progress: 0,
      completionDate: "June 15, 2025",
      lessons: [
        {
          id: 1,
          title: "Psychology of Persuasion",
          status: "locked",
          completedDate: null
        },
        {
          id: 2,
          title: "Creating Compelling Arguments",
          status: "locked",
          completedDate: null
        },
        {
          id: 3,
          title: "Marketing Copy Techniques",
          status: "locked",
          completedDate: null
        },
        {
          id: 4,
          title: "Ethical Persuasion",
          status: "locked",
          completedDate: null
        }
      ]
    },
    {
      id: 4,
      title: "Research & Academic Writing",
      emoji: "📕",
      progress: 0,
      completionDate: "July 1, 2025",
      lessons: [
        {
          id: 1,
          title: "Research Methods and Sources",
          status: "locked",
          completedDate: null
        },
        {
          id: 2,
          title: "Structuring Research Papers",
          status: "locked",
          completedDate: null
        },
        {
          id: 3,
          title: "Citation and Referencing Styles",
          status: "locked",
          completedDate: null
        },
        {
          id: 4,
          title: "Writing Abstracts and Summaries",
          status: "locked",
          completedDate: null
        }
      ]
    }
  ];

  const [selectedModule, setSelectedModule] = useState(modulesData[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleContinueModule = () => {
    // Navigate to the next lesson or current lesson in progress
    const nextLesson = selectedModule.lessons.find(lesson => 
      lesson.status === 'in_progress' || lesson.status === 'available'
    );
    if (nextLesson) {
      navigate(`/module/${selectedModule.id}/lesson/${nextLesson.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        {/* Mobile menu button */}
        {isMobile && (
          <button 
            className="mobile-menu-btn" 
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <RiMenuFoldLine />
          </button>
        )}

        <div className="modules-content">
          {/* Sidebar with module list */}
          <div className="modules-sidebar">
            <h2>Learning Modules</h2>
            <div className="modules-list">
              {modulesData.map((module) => (
                <div
                  key={module.id}
                  className={`module-item ${selectedModule.id === module.id ? 'active' : ''}`}
                  onClick={() => handleModuleSelect(module)}
                >
                <div className="module-header">
                  <span className="module-emoji">{module.emoji}</span>
                  <span className="module-title">Module {module.id}: {module.title}</span>
                </div>
                <div className="module-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{module.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="module-details">
          <div className="module-detail-header">
            <h1>
              <span className="module-emoji-large">{selectedModule.emoji}</span>
              Module {selectedModule.id}: {selectedModule.title}
            </h1>
          </div>

          <div className="lessons-list">
            {selectedModule.lessons.map((lesson, index) => (
              <div key={lesson.id} className={`lesson-item ${lesson.status}`}>
                <div className="lesson-number">
                  {lesson.status === 'completed' ? (
                    <div className="checkmark">✓</div>
                  ) : (
                    <div className="lesson-num">{index + 1}</div>
                  )}
                </div>
                <div className="lesson-content">
                  <h3>Lesson {lesson.id}: {lesson.title}</h3>
                  {lesson.status === 'completed' && lesson.completedDate && (
                    <p className="completion-date">Completed on {lesson.completedDate}</p>
                  )}
                  {lesson.status === 'in_progress' && (
                    <p className="status-text">In progress</p>
                  )}
                  {lesson.status === 'locked' && lesson.unlockDate && (
                    <p className="unlock-date">Unlock on {lesson.unlockDate}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="module-footer">
            <div className="progress-section">
              <div className="progress-info">
                <span className="progress-label">Progress: {selectedModule.progress}%</span>
                <span className="completion-date">Completion date: {selectedModule.completionDate}</span>
              </div>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${selectedModule.progress}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              className="continue-button"
              onClick={handleContinueModule}
              disabled={selectedModule.progress === 0}
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
