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
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    schoolCollege: '',
    gradeYear: '',
    interests: '',
    goals: ''
  });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Get user data and profile from localStorage and API
  useEffect(() => {
    const fetchProfile = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        try {
          const response = await fetch(`http://localhost:5001/api/student-profile/${parsedUser.id}`);
          const data = await response.json();
          
          if (response.ok && data.profile) {
            setProfileData({
              firstName: data.profile.first_name || '',
              lastName: data.profile.last_name || '',
              email: parsedUser.email,
              dateOfBirth: data.profile.date_of_birth || '',
              phone: data.profile.phone || '',
              address: data.profile.address || '',
              schoolCollege: data.profile.school_college || '',
              gradeYear: data.profile.grade_year || '',
              interests: data.profile.interests || '',
              goals: data.profile.goals || ''
            });
          } else {
            // No profile found, set default with user email
            setProfileData(prev => ({
              ...prev,
              email: parsedUser.email
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfileData(prev => ({
            ...prev,
            email: parsedUser.email
          }));
        }
      }
      setLoading(false);
    };

    fetchProfile();
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

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/save-student-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth,
          phone: profileData.phone,
          address: profileData.address,
          schoolCollege: profileData.schoolCollege,
          gradeYear: profileData.gradeYear,
          interests: profileData.interests,
          goals: profileData.goals
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Show success message
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to connect to server. Please try again.');
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0] : '';
    const last = lastName ? lastName[0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`.trim() || 'User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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
          </div>
          
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-header">
            <h2>Student Profile</h2>
          </div>

          {loading ? (
            <div className="loading-message">Loading profile...</div>
          ) : (
            <div className="profile-main">
              {/* Profile Card */}
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    <span>{getInitials(profileData.firstName, profileData.lastName)}</span>
                  </div>
                </div>
                
                <div className="profile-info">
                  <h3>{getFullName()}</h3>
                  <p className="profile-title">{profileData.email}</p>
                  <p className="profile-department">{profileData.schoolCollege}</p>
                  <p className="profile-institution">{profileData.gradeYear}</p>
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
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.firstName || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.lastName || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Email Address</label>
                    <span>{profileData.email}</span>
                  </div>
                  <div className="info-field">
                    <label>Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDateForInput(profileData.dateOfBirth)}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <span>{formatDate(profileData.dateOfBirth)}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.phone || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>School/College</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.schoolCollege}
                        onChange={(e) => handleInputChange('schoolCollege', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.schoolCollege || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Grade/Year</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.gradeYear}
                        onChange={(e) => handleInputChange('gradeYear', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.gradeYear || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Address</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows="2"
                      />
                    ) : (
                      <span>{profileData.address || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="info-row full-width">
                  <div className="info-field">
                    <label>Interests & Hobbies</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.interests}
                        onChange={(e) => handleInputChange('interests', e.target.value)}
                        rows="3"
                      />
                    ) : (
                      <p>{profileData.interests || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="info-row full-width">
                  <div className="info-field">
                    <label>Learning Goals</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.goals}
                        onChange={(e) => handleInputChange('goals', e.target.value)}
                        rows="3"
                      />
                    ) : (
                      <p>{profileData.goals || 'Not provided'}</p>
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
        )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
