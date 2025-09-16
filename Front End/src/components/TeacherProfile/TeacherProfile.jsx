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
  RiSaveLine,
  RiCalendarEventLine
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
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    institution: '',
    department: '',
    qualification: '',
    experienceYears: '',
    specialization: '',
    bio: ''
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
          const response = await fetch(`http://localhost:5001/api/teacher-profile/${parsedUser.id}`);
          const data = await response.json();
          
          if (response.ok && data.profile) {
            setProfileData({
              firstName: data.profile.first_name || '',
              lastName: data.profile.last_name || '',
              email: parsedUser.email,
              dateOfBirth: data.profile.date_of_birth || '',
              phone: data.profile.phone || '',
              address: data.profile.address || '',
              institution: data.profile.institution || '',
              department: data.profile.department || '',
              qualification: data.profile.qualification || '',
              experienceYears: data.profile.experience_years || '',
              specialization: data.profile.specialization || '',
              bio: data.profile.bio || ''
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

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/save-teacher-profile', {
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
          institution: profileData.institution,
          department: profileData.department,
          qualification: profileData.qualification,
          experienceYears: profileData.experienceYears ? parseInt(profileData.experienceYears) : null,
          specialization: profileData.specialization,
          bio: profileData.bio
        }),
      });

      if (response.ok) {
        setIsEditing(false);
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
    return (first + last).toUpperCase() || 'T';
  };

  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`.trim() || 'Teacher';
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
            <h1>Admin Dashboard</h1>
          </div>
          
          <div className="top-bar-nav">
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-header">
            <h2>Teacher Profile</h2>
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
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.dateOfBirth || 'Not provided'}</span>
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
                    <label>Institution</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.institution || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.department || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Qualification</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.qualification}
                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                      />
                    ) : (
                      <span>{profileData.qualification || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-field">
                    <label>Years of Experience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.experienceYears}
                        onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                        min="0"
                        max="50"
                      />
                    ) : (
                      <span>{profileData.experienceYears || 'Not provided'}</span>
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
                    <label>Specialization</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        rows="3"
                      />
                    ) : (
                      <p>{profileData.specialization || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="info-row full-width">
                  <div className="info-field">
                    <label>Professional Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows="4"
                      />
                    ) : (
                      <p>{profileData.bio || 'Not provided'}</p>
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

export default TeacherProfile;
