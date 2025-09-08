import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiSettings4Line, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiSaveLine,
  RiFileTextLine   
} from "react-icons/ri";
import logo from '../assets/Logo.png';

/**
 * StudentProfile component provides profile management for student users.
 * It displays personal information, student stats, and allows profile editing.
 */
const StudentProfile = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'John Smith',
    email: 'john.smith@student.edu',
    studentId: 'STU2024001',
    program: 'Bachelor of Arts in English',
    year: 'Third Year',
    phoneNumber: '(555) 987-6543',
    bio: 'Passionate about creative writing and literature. Currently focusing on improving business communication skills and academic writing techniques.'
  });
  
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData(prev => ({
        ...prev,
        email: parsedUser.email
      }));
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically save to backend
    setIsEditing(false);
    // Show success message or handle save logic
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="student-profile-container">
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
              className="nav-item active"
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

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-header">
            <h2>Student Profile</h2>
          </div>

          <div className="profile-main">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <span>{getInitials(profileData.fullName)}</span>
                </div>
              </div>
              
              <div className="profile-info">
                <h3>{profileData.fullName}</h3>
                <p className="profile-title">{profileData.studentId}</p>
                <p className="profile-department">{profileData.program}</p>
                <p className="profile-institution">{profileData.year}</p>
              </div>

              {/* Student Stats */}
              <div className="student-stats">
                <h4>Learning Progress</h4>
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-label">Modules Completed</span>
                    <span className="stat-value">2/4</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Exercises Done</span>
                    <span className="stat-value">8</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Overall Progress</span>
                    <span className="stat-value">65%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="personal-info">
              <div className="info-header">
                <h3>Personal Information</h3>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <RiFileEditLine />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="info-grid">
                <div className="info-row">
                  <div className="info-field">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.fullName}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.email}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Student ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.studentId}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Program</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.program}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.program}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Academic Year</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.year}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.phoneNumber}</span>
                    )}
                  </div>
                </div>

                <div className="info-row full-width">
                  <div className="info-field">
                    <label>Personal Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows="4"
                      />
                    ) : (
                      <p>{profileData.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="save-actions">
                  <button className="save-btn" onClick={handleSaveChanges}>
                    <RiSaveLine />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
