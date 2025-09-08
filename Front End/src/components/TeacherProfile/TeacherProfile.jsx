import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherProfile.css";
import { 
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
  RiSaveLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';

/**
 * TeacherProfile component provides profile management for admin/teacher users.
 * It displays personal information, admin stats, and allows profile editing.
 */
const TeacherProfile = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'omkarumale111',
    email: 'omkarumale111@gmail.com',
    position: 'Senior Administrator',
    department: 'English Department',
    institution: 'University of Technology',
    phoneNumber: '(555) 123-4567',
    professionalBio: 'Experienced administrator with over 8 years in educational assessment and curriculum development. Specializing in writing program administration and student performance evaluation.'
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

  const navigateToSection = (path) => {
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
    <div className="teacher-profile-container">
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
              className="nav-item active"
              onClick={() => navigateToSection('/teacher-profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item"
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
              onClick={handleLogout}
            >
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </li>
            <li 
              className="nav-item"
              onClick={() => navigateToSection('/teacher-about')}
            >
              <RiQuestionLine className="nav-icon" />
              {!sidebarCollapsed && <span>About</span>}
            </li>
          </ul>
        </div>
      </div>

      {/* Main content area */}
      <div className="teacher-main-content">
        {/* Top Navigation Bar */}
        <div className="teacher-top-bar">
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          
          <div className="top-bar-title">
            <h1>Admin Dashboard</h1>
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-header">
            <h2>Administrator Profile</h2>
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
                <p className="profile-title">{profileData.position}</p>
                <p className="profile-department">{profileData.department}</p>
                <p className="profile-institution">{profileData.institution}</p>
              </div>

              {/* Admin Stats */}
              <div className="admin-stats">
                <h4>Admin Stats</h4>
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-label">Active Tests</span>
                    <span className="stat-value">4</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Student Users</span>
                    <span className="stat-value">124</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Submissions</span>
                    <span className="stat-value">315</span>
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
                    <label>Position/Title</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.position}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.department}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Institution</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.institution}</span>
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
                    <label>Professional Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.professionalBio}
                        onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                        rows="4"
                      />
                    ) : (
                      <p>{profileData.professionalBio}</p>
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

export default TeacherProfile;
