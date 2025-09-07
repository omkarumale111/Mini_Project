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
  RiBookLine
} from "react-icons/ri";
import Logo from '../assets/Logo.png';
import './AboutPage.css';

const DashboardAbout = () => {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="about-root dashboard-layout">
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
            <img src={Logo} alt="WriteEdge Logo" className="sidebar-logo" />
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
              className="nav-item"
              onClick={() => navigateToModule('/modules')}
            >
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          <ul>
            <li 
              className="nav-item active"
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

      {/* Main Content */}
      <main className="about-content">
        <section className="about-intro">
          <h1>About WriteEdge</h1>
          <p className="intro-text">
            WriteEdge is a state-of-the-art platform designed to help students and professionals master the
            art of written communication through AI-powered assessment and feedback.
          </p>
        </section>

        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to empower learners with the writing skills necessary for success in academic and professional
            environments. We believe effective writing is not just about grammar and spelling—it's about clarity, persuasiveness, and
            purpose.
          </p>
        </section>

        <section className="how-it-works">
          <h2>How It Works</h2>
          <p>WriteEdge combines advanced AI technology with educational best practices to provide:</p>
          <ul>
            <li>Comprehensive assessments of writing skills through customizable tests</li>
            <li>Detailed, contextual feedback on grammar, content, and style</li>
            <li>Personalized suggestions for improvement</li>
            <li>Analytics that track progress over time</li>
            <li>Tools for educators to design tests and monitor student performance</li>
          </ul>
        </section>

        <section className="technology-section">
          <h2>Our Technology</h2>
          <p>At the heart of WriteEdge is our proprietary AI engine that analyzes written responses across multiple dimensions:</p>
          <ul>
            <li>Linguistic accuracy (grammar, spelling, punctuation)</li>
            <li>Content relevance and depth</li>
            <li>Structural coherence and organization</li>
            <li>Stylistic elements and tone appropriateness</li>
          </ul>
          <p className="tech-note">
            Our AI has been trained on millions of text samples to provide feedback that's not just accurate, but helpful and
            actionable.
          </p>
        </section>

        <section className="for-users">
          <div className="for-students">
            <h2>For Students</h2>
            <p>As a student, WriteEdge helps you:</p>
            <ul>
              <li>Identify and correct persistent writing errors</li>
              <li>Develop stronger argumentation and analysis skills</li>
              <li>Practice responding to various writing prompts</li>
              <li>Prepare for academic and professional writing tasks</li>
              <li>Track improvement over time with detailed analytics</li>
            </ul>
          </div>

          <div className="for-educators">
            <h2>For Educators</h2>
            <p>As an educator or administrator, WriteEdge enables you to:</p>
            <ul>
              <li>Create customized writing assessments</li>
              <li>Set difficulty levels and scoring parameters</li>
              <li>Monitor student performance across classes or cohorts</li>
              <li>Identify common writing challenges</li>
              <li>Save time on grading while providing more detailed feedback</li>
            </ul>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            WriteEdge was developed by a team of educators, linguists, and AI specialists committed to advancing writing education.
            With decades of combined experience in educational technology, our team understands the challenges of teaching and
            learning writing skills in today's fast-paced digital environment.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-group">
              <img src={Logo} alt="WriteEdge Logo" className="footer-logo" />
              <span className="footer-logo-text">WriteEdge</span>
            </div>
            <p className="footer-tagline">Empowering better writing through AI-driven feedback and assessment.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Contact</h4>
              <p>contact@writeedge.com</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Education Ave, Suite 100</p>
              <p>New York, NY 10001</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 WriteEdge. All rights reserved.</p>
          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default DashboardAbout;
