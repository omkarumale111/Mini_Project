import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css";
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiFileTextLine, 
  RiBarChartLine, 
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine
} from "react-icons/ri";
import logo from '../assets/Logo.png';

const Report = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user and students data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStudents(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch students by class teacher
  const fetchStudents = async (teacherId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/students-by-teacher/${teacherId}`);
      const data = await response.json();
      
      if (response.ok) {
        // Transform data to match the component's expected format
        const formattedStudents = data.students.map(student => ({
          id: student.id,
          name: student.first_name && student.last_name 
            ? `${student.first_name} ${student.last_name}`
            : student.email,
          email: student.email,
          year: student.grade_year || 'N/A',
          school: student.school_college || 'N/A',
          totalTests: student.total_tests || 0,
          avgScore: 0 // Will be calculated from actual test data
        }));
        setStudents(formattedStudents);
      } else {
        console.error('Failed to fetch students:', data.error);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const navigateToSection = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch student report when a student is selected
  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    if (user && user.id) {
      try {
        setReportLoading(true);
        const response = await fetch(`http://localhost:5001/api/student-report/${student.id}?teacherId=${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setStudentReport(data);
        } else {
          console.error('Failed to fetch student report:', data.error);
          if (response.status === 403) {
            alert('Access denied: This student is not in your class.');
            setSelectedStudent(null);
          }
        }
      } catch (error) {
        console.error('Error fetching student report:', error);
      } finally {
        setReportLoading(false);
      }
    }
  };

  return (
    <div className="teacher-report-container">
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
              className="nav-item active"
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
            <h1>Reports & Analytics</h1>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content-wrapper">
          {!selectedStudent ? (
            // Student Selection View
            <div className="students-grid-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <p>Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <p>No students found in your class.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                    Students need to have their class teacher name set in their profile to appear here.
                  </p>
                </div>
              ) : (
                <div className="students-grid">
                  {students.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-card-header">
                        <div className="student-avatar">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h3>{student.name}</h3>
                      </div>
                      <div className="student-card-info">
                        <div className="info-row">
                          <span className="info-label">Year:</span>
                          <span className="info-value">{student.year}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Tests Completed:</span>
                          <span className="info-value">{student.totalTests}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Email:</span>
                          <span className="info-value" style={{ fontSize: '0.85rem' }}>{student.email}</span>
                        </div>
                      </div>
                      <button 
                        className="details-btn"
                        onClick={() => handleStudentSelect(student)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Detailed Report View
            <div className="report-detail-container">
              <div className="report-header">
                <button 
                  className="back-btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentReport(null);
                  }}
                >
                  ← Back to Students
                </button>
                <h2>{selectedStudent.name}'s Performance Report</h2>
              </div>

              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <p>Loading report data...</p>
                </div>
              ) : (
                <div className="dashboard-container">
                  <div className="dashboard-grid">
                    {/* Left Section - Overview */}
                    <div className="overview-section">
                      <h3>Overview & Scores</h3>
                      <div className="student-info">
                        <p><strong>{selectedStudent.name}</strong></p>
                        <p>Email: {selectedStudent.email}</p>
                        <p>Year: {selectedStudent.year}</p>
                        <p>School: {selectedStudent.school}</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                      </div>

                      <div className="score-container-wrapper">
                        <div className="score-chart-section">
                            <div className="score-text">
                              Tests Completed: {selectedStudent.totalTests}
                            </div>
                            <div className="score-circle"></div>
                        </div>

                        <div className="score-details">
                            <p>Total Submissions: {studentReport?.submissions?.length || 0}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                              Detailed analytics coming soon
                            </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Test History */}
                    <div className="details-section">
                      <h3>Test Submission History</h3>

                      {studentReport?.submissions && studentReport.submissions.length > 0 ? (
                        studentReport.submissions.map((submission, index) => (
                          <div key={submission.test_id} className="question-card">
                            <h4>{submission.test_name}</h4>
                            <p>
                              Submitted: {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="question-card">
                          <p style={{ color: '#666' }}>No test submissions yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom - Tips */}
                  <div className="tips-section">
                    <h3>Student Information</h3>
                    <ul>
                      <li><strong>Total Tests:</strong> {selectedStudent.totalTests} completed</li>
                      <li><strong>Grade/Year:</strong> {selectedStudent.year}</li>
                      <li><strong>School:</strong> {selectedStudent.school}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
