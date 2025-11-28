import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import {
  RiArrowLeftLine,
  RiTrophyLine,
  RiFileTextLine,
  RiBarChartLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxCircleLine,
  RiDashboardLine,
  RiUserLine,
  RiQuestionLine,
  RiLogoutCircleRLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileEditLine,
  RiGroupLine
} from 'react-icons/ri';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import logo from '../assets/Logo.png';
import './StudentPerformanceDetails.css';

const StudentPerformanceDetails = () => {
  const { studentId } = useParams();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
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

    fetchPerformanceData(user.id, studentId);
  }, [studentId, navigate]);

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

  const fetchPerformanceData = async (teacherId, studentId) => {
    try {
      console.log('Fetching performance data...');
      console.log('Teacher ID:', teacherId);
      console.log('Student ID:', studentId);
      
      const url = `http://localhost:5001/api/teacher/${teacherId}/student/${studentId}/performance`;
      console.log('API URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setPerformanceData(data);
        console.log('Performance data set successfully');
      } else {
        console.error('Failed to fetch performance data:', data.message);
        console.error('Full error response:', data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="teacher-report-container">
        <div className="report-content-wrapper">
          <div className="performance-details-container">
            <div className="loading-spinner">Loading performance data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!performanceData || !performanceData.overallStats) {
    return (
      <div className="teacher-report-container">
        <div className="report-content-wrapper">
          <div className="performance-details-container">
            <div className="no-data">
              <h2>No Performance Data Available</h2>
              <p>This student hasn't taken any tests yet.</p>
              <button onClick={() => navigate('/my-students')}>
                <RiArrowLeftLine /> Back to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { studentInfo, teacherInfo, overallStats, individualTests, trends } = performanceData;

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
        <div className="performance-details-container">
      {/* Header */}
      <div className="performance-header">
        <button className="back-button" onClick={() => navigate('/my-students')}>
          <RiArrowLeftLine /> Back to Students
        </button>
        <div className="student-header-info">
          <div className="student-avatar-large">
            {studentInfo.firstName.charAt(0)}{studentInfo.lastName.charAt(0)}
          </div>
          <div>
            <h1>{studentInfo.firstName} {studentInfo.lastName}</h1>
            <p className="student-email">{studentInfo.email}</p>
            <p className="student-school">{studentInfo.schoolCollege} - {studentInfo.gradeYear}</p>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="overall-stats-section">
        <h2>Overall Performance</h2>
        <div className="stats-grid-detailed">
          <div className="stat-card-detailed main-score">
            <div className="stat-icon-large">
              <RiTrophyLine />
            </div>
            <div className="stat-content-large">
              <h3>Overall Average</h3>
              <div 
                className="score-circle-large"
                style={{
                  background: `conic-gradient(${getScoreColor(overallStats.avgOverallScore)} ${overallStats.avgOverallScore * 3.6}deg, #e5e7eb 0deg)`
                }}
              >
                <div className="score-inner-large">
                  {overallStats.avgOverallScore?.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card-detailed">
            <div className="stat-label">Grammar Score</div>
            <div className="stat-value" style={{ color: getScoreColor(overallStats.avgGrammarScore) }}>
              {overallStats.avgGrammarScore?.toFixed(1) || 'N/A'}
            </div>
            <div className="progress-bar-large">
              <div
                className="progress-fill-large"
                style={{
                  width: `${overallStats.avgGrammarScore || 0}%`,
                  backgroundColor: getScoreColor(overallStats.avgGrammarScore)
                }}
              />
            </div>
          </div>

          <div className="stat-card-detailed">
            <div className="stat-label">Content Score</div>
            <div className="stat-value" style={{ color: getScoreColor(overallStats.avgContentScore) }}>
              {overallStats.avgContentScore?.toFixed(1) || 'N/A'}
            </div>
            <div className="progress-bar-large">
              <div
                className="progress-fill-large"
                style={{
                  width: `${overallStats.avgContentScore || 0}%`,
                  backgroundColor: getScoreColor(overallStats.avgContentScore)
                }}
              />
            </div>
          </div>

          <div className="stat-card-detailed">
            <div className="stat-label">Creativity Score</div>
            <div className="stat-value" style={{ color: getScoreColor(overallStats.avgCreativityScore) }}>
              {overallStats.avgCreativityScore?.toFixed(1) || 'N/A'}
            </div>
            <div className="progress-bar-large">
              <div
                className="progress-fill-large"
                style={{
                  width: `${overallStats.avgCreativityScore || 0}%`,
                  backgroundColor: getScoreColor(overallStats.avgCreativityScore)
                }}
              />
            </div>
          </div>

          <div className="stat-card-detailed">
            <div className="stat-label">Total Tests</div>
            <div className="stat-value">{overallStats.totalTests}</div>
            <RiFileTextLine className="stat-icon-small" />
          </div>
        </div>
      </div>

      {/* Trends Analysis */}
      <div className="trends-section">
        <h2>Performance Trends</h2>
        <div className="trends-grid">
          <div className="trend-card">
            <div className="trend-icon">
              {parseFloat(trends.improvement) >= 0 ? (
                <RiArrowUpLine style={{ color: '#10b981' }} />
              ) : (
                <RiArrowDownLine style={{ color: '#ef4444' }} />
              )}
            </div>
            <div className="trend-content">
              <h3>Improvement</h3>
              <p className={parseFloat(trends.improvement) >= 0 ? 'positive' : 'negative'}>
                {trends.improvement}%
              </p>
              <span className="trend-description">
                {parseFloat(trends.improvement) >= 0 ? 'Improving' : 'Declining'} from first to last test
              </span>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-icon">
              <RiTrophyLine style={{ color: '#10b981' }} />
            </div>
            <div className="trend-content">
              <h3>Strongest Area</h3>
              <p className="area-name">{trends.strongestArea}</p>
              <span className="trend-description">Best performing category</span>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-icon">
              <RiBarChartLine style={{ color: '#f59e0b' }} />
            </div>
            <div className="trend-content">
              <h3>Needs Focus</h3>
              <p className="area-name">{trends.weakestArea}</p>
              <span className="trend-description">Area for improvement</span>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-icon">
              <RiCheckboxCircleLine style={{ color: '#3b82f6' }} />
            </div>
            <div className="trend-content">
              <h3>Consistency</h3>
              <p className="consistency-score">{trends.consistency}%</p>
              <span className="trend-description">Score consistency across tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      {individualTests.length > 1 && (
        <div className="charts-section">
          <h2>Performance Over Time</h2>
          
          {/* Line Chart - Overall Progress */}
          <div className="chart-container">
            <h3>Overall Score Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={individualTests.slice().reverse().map((test, index) => ({
                name: `Test ${index + 1}`,
                date: new Date(test.submittedAt).toLocaleDateString(),
                overall: test.reviewScore || 0,
                grammar: test.grammarScore || 0,
                content: test.contentScore || 0,
                creativity: test.creativityScore || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="overall" stroke="#667eea" strokeWidth={3} name="Overall Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Category Comparison */}
          <div className="chart-container">
            <h3>Score Breakdown by Test</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={individualTests.slice().reverse().map((test, index) => ({
                name: `Test ${index + 1}`,
                Grammar: test.grammarScore || 0,
                Content: test.contentScore || 0,
                Creativity: test.creativityScore || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Grammar" fill="#10b981" />
                <Bar dataKey="Content" fill="#3b82f6" />
                <Bar dataKey="Creativity" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart - Latest Performance Profile */}
          <div className="chart-container">
            <h3>Latest Performance Profile</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={[
                { category: 'Grammar', score: individualTests[0]?.grammarScore || 0, fullMark: 100 },
                { category: 'Content', score: individualTests[0]?.contentScore || 0, fullMark: 100 },
                { category: 'Creativity', score: individualTests[0]?.creativityScore || 0, fullMark: 100 },
                { category: 'Overall', score: individualTests[0]?.reviewScore || 0, fullMark: 100 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Latest Test" dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Test Results */}
      <div className="individual-tests-section">
        <h2>Individual Test Results</h2>
        <div className="tests-table-container">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Code</th>
                <th>Date</th>
                <th>Overall</th>
                <th>Grammar</th>
                <th>Content</th>
                <th>Creativity</th>
              </tr>
            </thead>
            <tbody>
              {individualTests.map((test) => (
                <tr key={test.submissionId}>
                  <td className="test-name">{test.testName}</td>
                  <td className="test-code">{test.testCode}</td>
                  <td className="test-date">
                    {new Date(test.submittedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(test.reviewScore) }}
                    >
                      {test.reviewScore || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(test.grammarScore) }}
                    >
                      {test.grammarScore || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(test.contentScore) }}
                    >
                      {test.contentScore || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(test.creativityScore) }}
                    >
                      {test.creativityScore || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="timeline-summary">
        <p>
          <strong>First Test:</strong> {new Date(overallStats.firstTestDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Last Test:</strong> {new Date(overallStats.lastTestDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Teacher:</strong> {teacherInfo.firstName} {teacherInfo.lastName}
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceDetails;
