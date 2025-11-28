import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { 
  RiUserLine, 
  RiBarChartLine, 
  RiFileTextLine,
  RiArrowRightLine,
  RiSearchLine,
  RiTrophyLine,
  RiAlertLine,
  RiDashboardLine,
  RiQuestionLine,
  RiLogoutCircleRLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiGroupLine,
  RiDownloadLine,
  RiFileExcelLine
} from 'react-icons/ri';
import logo from '../assets/Logo.png';
import './MyStudents.css';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'name', 'tests'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const user = storage.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchStudents(user.id);
    fetchStatistics(user.id);
  }, [navigate]);

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
    storage.removeUser();
    navigate('/login');
  };

  const fetchStudents = async (teacherId) => {
    try {
      console.log('Fetching students for teacher:', teacherId);
      const response = await fetch(`http://localhost:5001/api/teacher/${teacherId}/students`);
      const data = await response.json();
      
      console.log('Students API response:', data);
      
      if (response.ok) {
        setStudents(data.students || []);
        console.log('Students set:', data.students?.length || 0);
      } else {
        console.error('Failed to fetch students:', data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/teacher/${teacherId}/statistics`);
      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const viewStudentDetails = (studentId) => {
    navigate(`/student-performance/${studentId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Work';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'School/College', 'Grade/Year', 'Tests Taken', 'Overall Score', 'Grammar Score', 'Content Score', 'Creativity Score'];
    const csvData = filteredStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      student.email,
      student.schoolCollege,
      student.gradeYear,
      student.totalTests,
      student.avgOverallScore?.toFixed(1) || 'N/A',
      student.avgGrammarScore?.toFixed(1) || 'N/A',
      student.avgContentScore?.toFixed(1) || 'N/A',
      student.avgCreativityScore?.toFixed(1) || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_performance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      return fullName.includes(searchLower) || 
             student.email.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.avgOverallScore || 0) - (a.avgOverallScore || 0);
      } else if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'tests') {
        return b.totalTests - a.totalTests;
      }
      return 0;
    });

  console.log('MyStudents render - loading:', loading, 'students:', students.length, 'statistics:', statistics);

  if (loading) {
    return (
      <div className="teacher-report-container">
        <div className="report-content-wrapper">
          <div className="my-students-container">
            <div className="loading-spinner">Loading students...</div>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => navigateToSection('/my-students')}
            >
              <RiGroupLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Students</span>}
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
      <div className="report-content-wrapper">
        <div className="my-students-container">
      {/* Header Section */}
      <div className="students-header">
        <div className="header-content">
          <h1>My Students</h1>
          <p>Track and monitor student performance across all tests</p>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <RiUserLine />
            </div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{statistics.totalStudents}</p>
            </div>
          </div>

          <div className="stat-card tests">
            <div className="stat-icon">
              <RiFileTextLine />
            </div>
            <div className="stat-content">
              <h3>Total Tests Given</h3>
              <p className="stat-number">{statistics.totalTestsGiven}</p>
            </div>
          </div>

          <div className="stat-card average">
            <div className="stat-icon">
              <RiBarChartLine />
            </div>
            <div className="stat-content">
              <h3>Class Average</h3>
              <p className="stat-number">{statistics.averageClassScore}%</p>
            </div>
          </div>

          <div className="stat-card distribution">
            <div className="stat-icon">
              <RiTrophyLine />
            </div>
            <div className="stat-content">
              <h3>Score Distribution</h3>
              <div className="distribution-bars">
                <div className="dist-item">
                  <span>Excellent (90+)</span>
                  <span className="dist-count">{statistics.scoreDistribution.excellent}</span>
                </div>
                <div className="dist-item">
                  <span>Good (75-89)</span>
                  <span className="dist-count">{statistics.scoreDistribution.good}</span>
                </div>
                <div className="dist-item">
                  <span>Average (60-74)</span>
                  <span className="dist-count">{statistics.scoreDistribution.average}</span>
                </div>
                <div className="dist-item">
                  <span>Needs Work (&lt;60)</span>
                  <span className="dist-count">{statistics.scoreDistribution.needsWork}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers & Needs Attention */}
      {statistics && (statistics.topPerformers.length > 0 || statistics.needsAttention.length > 0) && (
        <div className="highlights-section">
          {statistics.topPerformers.length > 0 && (
            <div className="highlight-card top-performers">
              <h3><RiTrophyLine /> Top Performers</h3>
              <div className="highlight-list">
                {statistics.topPerformers.map((student, index) => (
                  <div key={student.studentId} className="highlight-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{student.name}</span>
                    <span className="score" style={{ color: getScoreColor(student.avgScore) }}>
                      {student.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statistics.needsAttention.length > 0 && (
            <div className="highlight-card needs-attention">
              <h3><RiAlertLine /> Needs Attention</h3>
              <div className="highlight-list">
                {statistics.needsAttention.map((student) => (
                  <div key={student.studentId} className="highlight-item">
                    <span className="name">{student.name}</span>
                    <span className="score" style={{ color: getScoreColor(student.avgScore) }}>
                      {student.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-box">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Average Score</option>
            <option value="name">Name</option>
            <option value="tests">Tests Taken</option>
          </select>
        </div>

        <div className="export-controls">
          <button className="export-btn" onClick={exportToCSV} title="Export to CSV">
            <RiFileExcelLine /> Export CSV
          </button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="students-grid">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.studentId} className="student-card">
              <div className="student-header">
                <div className="student-avatar">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div className="student-info">
                  <h3>{student.firstName} {student.lastName}</h3>
                  <p className="student-email">{student.email}</p>
                  <p className="student-school">{student.schoolCollege} - {student.gradeYear}</p>
                </div>
              </div>

              <div className="student-stats">
                <div className="stat-item">
                  <label>Tests Taken</label>
                  <span className="stat-value">{student.totalTests}</span>
                </div>

                <div className="stat-item">
                  <label>Overall Score</label>
                  <div className="score-display">
                    <div 
                      className="score-circle"
                      style={{ 
                        background: `conic-gradient(${getScoreColor(student.avgOverallScore)} ${(student.avgOverallScore || 0) * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    >
                      <div className="score-inner">
                        {student.avgOverallScore != null ? Number(student.avgOverallScore).toFixed(1) : 'N/A'}
                      </div>
                    </div>
                    <span 
                      className="score-label"
                      style={{ color: getScoreColor(student.avgOverallScore) }}
                    >
                      {student.avgOverallScore != null ? getScoreLabel(student.avgOverallScore) : 'No Data'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="performance-breakdown">
                <div className="breakdown-item">
                  <label>Grammar</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${student.avgGrammarScore || 0}%`,
                        backgroundColor: getScoreColor(student.avgGrammarScore)
                      }}
                    />
                  </div>
                  <span>{student.avgGrammarScore != null ? Number(student.avgGrammarScore).toFixed(1) : 'N/A'}</span>
                </div>

                <div className="breakdown-item">
                  <label>Content</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${student.avgContentScore || 0}%`,
                        backgroundColor: getScoreColor(student.avgContentScore)
                      }}
                    />
                  </div>
                  <span>{student.avgContentScore != null ? Number(student.avgContentScore).toFixed(1) : 'N/A'}</span>
                </div>

                <div className="breakdown-item">
                  <label>Creativity</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${student.avgCreativityScore || 0}%`,
                        backgroundColor: getScoreColor(student.avgCreativityScore)
                      }}
                    />
                  </div>
                  <span>{student.avgCreativityScore != null ? Number(student.avgCreativityScore).toFixed(1) : 'N/A'}</span>
                </div>
              </div>

              <div className="student-dates">
                <p>First Test: {new Date(student.firstTestDate).toLocaleDateString()}</p>
                <p>Last Test: {new Date(student.lastTestDate).toLocaleDateString()}</p>
              </div>

              <button 
                className="view-details-btn"
                onClick={() => viewStudentDetails(student.studentId)}
              >
                View Detailed Performance <RiArrowRightLine />
              </button>
            </div>
          ))
        ) : (
          <div className="no-students">
            <RiUserLine size={64} />
            <h3>No Students Found</h3>
            <p>
              {searchTerm 
                ? 'No students match your search criteria.' 
                : 'No students have taken your tests yet.'}
            </p>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default MyStudents;
