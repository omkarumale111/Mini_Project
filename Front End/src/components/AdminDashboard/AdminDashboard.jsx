import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiSettings4Line, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileList3Line,
  RiBarChart2Line,
  RiMessage2Line
} from "react-icons/ri";
import logo from '../../assets/Logo.png';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <div 
          className="admin-backdrop" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
      >
        <div className="sidebar-header">
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          {!sidebarCollapsed && <h2>Admin Panel</h2>}
        </div>
        
        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul>
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>Users</span>}
            </li>
            <li 
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <RiFileList3Line className="nav-icon" />
              {!sidebarCollapsed && <span>Courses</span>}
            </li>
            <li 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <RiBarChart2Line className="nav-icon" />
              {!sidebarCollapsed && <span>Analytics</span>}
            </li>
            <li 
              className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <RiMessage2Line className="nav-icon" />
              {!sidebarCollapsed && <span>Messages</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li 
              className="nav-item" 
              onClick={handleLogout}
            >
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Logout</span>}
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main-content">
        <div className="admin-top-bar">
          <div className="admin-logo-group">
            <img src={logo} alt="WriteEdge Logo" className="admin-logo" />
            <span className="admin-logo-text">WriteEdge Admin</span>
          </div>
          <div className="admin-user-menu">
            <button 
              className="profile-button"
              onClick={() => setActiveTab('profile')}
            >
              <RiUserLine className="user-icon" />
              <span>Admin User</span>
            </button>
          </div>
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Placeholder components
const DashboardOverview = () => (
  <div className="dashboard-overview">
    <h1>Admin Dashboard</h1>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Users</h3>
        <p className="stat-number">1,234</p>
        <p className="stat-change">+12% from last month</p>
      </div>
      <div className="stat-card">
        <h3>Active Courses</h3>
        <p className="stat-number">24</p>
        <p className="stat-change">+3 this month</p>
      </div>
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p className="stat-number">$12,345</p>
        <p className="stat-change">+8% from last month</p>
      </div>
    </div>
    
    <div className="recent-activity">
      <h2>Recent Activity</h2>
      <div className="activity-list">
        {/* Activity items would be mapped here */}
        <div className="activity-item">
          <div className="activity-icon">👤</div>
          <div className="activity-details">
            <p><strong>John Doe</strong> completed the Business Writing course</p>
            <span className="activity-time">2 hours ago</span>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon">📝</div>
          <div className="activity-details">
            <p>New user <strong>Jane Smith</strong> registered</p>
            <span className="activity-time">5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileSection = () => (
  <div className="profile-section">
    <h1>My Profile</h1>
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>AU</span>
        </div>
        <div className="profile-info">
          <h2>Admin User</h2>
          <p>Administrator</p>
        </div>
      </div>
      
      <div className="profile-details">
        <h3>Account Information</h3>
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">admin@writeedge.com</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Role:</span>
          <span className="detail-value">Administrator</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Member Since:</span>
          <span className="detail-value">January 15, 2024</span>
        </div>
      </div>
      
      <div className="profile-actions">
        <button className="edit-profile-btn">Edit Profile</button>
        <button className="change-password-btn">Change Password</button>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
