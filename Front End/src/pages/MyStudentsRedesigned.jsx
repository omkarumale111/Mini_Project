import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
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
  RiFilterLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiStarLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiFileExcelLine
} from 'react-icons/ri';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import logo from '../assets/Logo.png';
import './MyStudentsRedesigned.css';

const MyStudentsRedesigned = () => {
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterBy, setFilterBy] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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
      const response = await fetch(`http://localhost:5001/api/teacher/${teacherId}/students`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students || []);
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
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Work';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'School/College', 'Grade/Year', 'Tests Taken', 'Overall Score', 'Grammar Score', 'Content Score', 'Creativity Score', 'First Test', 'Last Test'];
    const csvData = filteredStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      student.email,
      student.schoolCollege,
      student.gradeYear,
      student.totalTests,
      student.avgOverallScore?.toFixed(1) || 'N/A',
      student.avgGrammarScore?.toFixed(1) || 'N/A',
      student.avgContentScore?.toFixed(1) || 'N/A',
      student.avgCreativityScore?.toFixed(1) || 'N/A',
      new Date(student.firstTestDate).toLocaleDateString(),
      new Date(student.lastTestDate).toLocaleDateString()
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
      const matchesSearch = fullName.includes(searchLower) || student.email.toLowerCase().includes(searchLower);
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'excellent') return matchesSearch && student.avgOverallScore >= 90;
      if (filterBy === 'good') return matchesSearch && student.avgOverallScore >= 75 && student.avgOverallScore < 90;
      if (filterBy === 'average') return matchesSearch && student.avgOverallScore >= 60 && student.avgOverallScore < 75;
      if (filterBy === 'poor') return matchesSearch && student.avgOverallScore < 60;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.avgOverallScore || 0) - (a.avgOverallScore || 0);
      } else if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'tests') {
        return b.totalTests - a.totalTests;
      } else if (sortBy === 'recent') {
        return new Date(b.lastTestDate) - new Date(a.lastTestDate);
      }
      return 0;
    });

  // Prepare chart data
  const scoreDistributionData = statistics ? [
    { name: 'Excellent (90+)', value: statistics.scoreDistribution.excellent, color: '#10b981' },
    { name: 'Good (75-89)', value: statistics.scoreDistribution.good, color: '#3b82f6' },
    { name: 'Average (60-74)', value: statistics.scoreDistribution.average, color: '#f59e0b' },
    { name: 'Needs Work (<60)', value: statistics.scoreDistribution.needsWork, color: '#ef4444' }
  ] : [];

  const topPerformersData = statistics?.topPerformers?.slice(0, 5).map(s => ({
    name: s.name.split(' ')[0],
    score: s.avgScore
  })) || [];

  if (loading) {
    return (
      <div className="teacher-report-container">
        <div className="report-content-wrapper">
          <div className="loading-container">
            <motion.div 
              className="loading-spinner-modern"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RiGroupLine size={48} />
            </motion.div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-report-container">
      {/* Mobile backdrop */}
      {isMobile && sidebarVisible && (
        <motion.div 
          className="backdrop visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <motion.div 
        className={`teacher-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
        initial={false}
        animate={{ width: sidebarCollapsed ? '80px' : '260px' }}
        transition={{ duration: 0.3 }}
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

        <nav className="teacher-nav-menu">
          <ul>
            <li className="nav-item" onClick={() => navigateToSection('/teacher-dashboard')}>
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToSection('/teacher-profile')}>
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToSection('/create-test')}>
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Create Test</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToSection('/manage-tests')}>
              <RiFileEditLine className="nav-icon" />
              {!sidebarCollapsed && <span>Manage Tests</span>}
            </li>
            <li className="nav-item active" onClick={() => navigateToSection('/my-students')}>
              <RiGroupLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Students</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToSection('/reports')}>
              <RiBarChartLine className="nav-icon" />
              {!sidebarCollapsed && <span>Reports</span>}
            </li>
          </ul>
        </nav>

        <div className="bottom-menu">
          <ul>
            <li className="nav-item" onClick={() => navigateToSection('/teacher-about')}>
              <RiQuestionLine className="nav-icon" />
              {!sidebarCollapsed && <span>About</span>}
            </li>
            <li className="nav-item" onClick={handleLogout}>
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="report-content-wrapper">
        <motion.div 
          className="my-students-redesigned"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <div className="page-header">
            <div className="header-left">
              <h1><RiGroupLine /> My Students</h1>
              <p>Track and monitor student performance across all tests</p>
            </div>
            <div className="header-right">
              <motion.button 
                className="export-btn-header"
                onClick={exportToCSV}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Export to CSV"
              >
                <RiFileExcelLine /> Export CSV
              </motion.button>
              <div className="view-toggle">
                <button 
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <RiDashboardLine />
                </button>
                <button 
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <RiFileTextLine />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          {statistics && (
            <motion.div 
              className="statistics-dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stat-cards-grid">
                <motion.div 
                  className="stat-card-modern total"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon-modern">
                    <RiUserLine />
                  </div>
                  <div className="stat-content-modern">
                    <span className="stat-label">Total Students</span>
                    <span className="stat-value">{statistics.totalStudents}</span>
                    <span className="stat-trend positive">
                      <RiArrowUpLine /> Active
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card-modern tests"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon-modern">
                    <RiFileTextLine />
                  </div>
                  <div className="stat-content-modern">
                    <span className="stat-label">Total Tests</span>
                    <span className="stat-value">{statistics.totalTestsGiven}</span>
                    <span className="stat-trend">
                      <RiCheckboxCircleLine /> Completed
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card-modern average"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon-modern">
                    <RiBarChartLine />
                  </div>
                  <div className="stat-content-modern">
                    <span className="stat-label">Class Average</span>
                    <span className="stat-value">{statistics.averageClassScore || 0}%</span>
                    <div className="mini-progress">
                      <div 
                        className="mini-progress-fill"
                        style={{ 
                          width: `${statistics.averageClassScore || 0}%`,
                          backgroundColor: getScoreColor(statistics.averageClassScore || 0)
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card-modern top"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon-modern">
                    <RiTrophyLine />
                  </div>
                  <div className="stat-content-modern">
                    <span className="stat-label">Top Performer</span>
                    <span className="stat-value-small">
                      {statistics.topPerformers[0]?.name || 'N/A'}
                    </span>
                    <span className="stat-trend positive">
                      <RiStarLine /> {statistics.topPerformers[0]?.avgScore || 0}%
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <motion.div 
                  className="chart-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3><RiBarChartLine /> Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {scoreDistributionData.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: item.color }} />
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  className="chart-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3><RiTrophyLine /> Top 5 Performers</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topPerformersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="score" fill="#667eea" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Controls Section */}
          <motion.div 
            className="controls-section-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="search-box-modern">
              <RiSearchLine className="search-icon-modern" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div className="filter-item">
                <RiFilterLine />
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                  <option value="all">All Students</option>
                  <option value="excellent">Excellent (90+)</option>
                  <option value="good">Good (75-89)</option>
                  <option value="average">Average (60-74)</option>
                  <option value="poor">Needs Work (&lt;60)</option>
                </select>
              </div>

              <div className="filter-item">
                <RiArrowUpLine />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="tests">Sort by Tests</option>
                  <option value="recent">Sort by Recent</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Students Grid/List */}
          <AnimatePresence mode="wait">
            {filteredStudents.length > 0 ? (
              <motion.div 
                className={`students-container ${viewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
              >
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    className={`student-card-modern ${getPerformanceLevel(student.avgOverallScore)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                    layout
                  >
                    <div className="student-card-header">
                      <div className="student-avatar-modern">
                        <span>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</span>
                        <div className="status-indicator active" />
                      </div>
                      <div className="student-info-modern">
                        <h3>{student.firstName} {student.lastName}</h3>
                        <p className="student-email-modern">{student.email}</p>
                        <p className="student-school-modern">
                          {student.schoolCollege} • {student.gradeYear}
                        </p>
                      </div>
                      <div className="student-score-badge">
                        <div 
                          className="circular-progress"
                          style={{
                            background: `conic-gradient(${getScoreColor(student.avgOverallScore)} ${(student.avgOverallScore || 0) * 3.6}deg, #e5e7eb 0deg)`
                          }}
                        >
                          <div className="circular-progress-inner">
                            {student.avgOverallScore != null ? Number(student.avgOverallScore).toFixed(0) : 'N/A'}
                          </div>
                        </div>
                        <span className="score-label-modern">
                          {student.avgOverallScore != null ? getScoreLabel(student.avgOverallScore) : 'No Data'}
                        </span>
                      </div>
                    </div>

                    <div className="student-stats-modern">
                      <div className="stat-item-modern">
                        <RiFileTextLine />
                        <span className="stat-label-small">Tests</span>
                        <span className="stat-value-small">{student.totalTests}</span>
                      </div>
                      <div className="stat-item-modern">
                        <RiTimeLine />
                        <span className="stat-label-small">Last Test</span>
                        <span className="stat-value-small">
                          {new Date(student.lastTestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="performance-bars-modern">
                      <div className="performance-bar-item">
                        <div className="bar-header">
                          <span>Grammar</span>
                          <span className="bar-value">
                            {student.avgGrammarScore != null ? Number(student.avgGrammarScore).toFixed(0) : 'N/A'}
                          </span>
                        </div>
                        <div className="progress-bar-modern">
                          <motion.div 
                            className="progress-fill-modern"
                            initial={{ width: 0 }}
                            animate={{ width: `${student.avgGrammarScore || 0}%` }}
                            transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                            style={{ backgroundColor: getScoreColor(student.avgGrammarScore) }}
                          />
                        </div>
                      </div>

                      <div className="performance-bar-item">
                        <div className="bar-header">
                          <span>Content</span>
                          <span className="bar-value">
                            {student.avgContentScore != null ? Number(student.avgContentScore).toFixed(0) : 'N/A'}
                          </span>
                        </div>
                        <div className="progress-bar-modern">
                          <motion.div 
                            className="progress-fill-modern"
                            initial={{ width: 0 }}
                            animate={{ width: `${student.avgContentScore || 0}%` }}
                            transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                            style={{ backgroundColor: getScoreColor(student.avgContentScore) }}
                          />
                        </div>
                      </div>

                      <div className="performance-bar-item">
                        <div className="bar-header">
                          <span>Creativity</span>
                          <span className="bar-value">
                            {student.avgCreativityScore != null ? Number(student.avgCreativityScore).toFixed(0) : 'N/A'}
                          </span>
                        </div>
                        <div className="progress-bar-modern">
                          <motion.div 
                            className="progress-fill-modern"
                            initial={{ width: 0 }}
                            animate={{ width: `${student.avgCreativityScore || 0}%` }}
                            transition={{ duration: 1, delay: index * 0.05 + 0.4 }}
                            style={{ backgroundColor: getScoreColor(student.avgCreativityScore) }}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      className="view-details-btn-modern"
                      onClick={() => viewStudentDetails(student.studentId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details <RiArrowRightLine />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="no-students-modern"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <RiUserLine size={80} />
                <h3>No Students Found</h3>
                <p>
                  {searchTerm || filterBy !== 'all'
                    ? 'No students match your search or filter criteria.' 
                    : 'No students have taken your tests yet.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MyStudentsRedesigned;
