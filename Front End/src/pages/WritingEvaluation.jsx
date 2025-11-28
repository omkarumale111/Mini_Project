import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiBarChartLine,
  RiDownloadLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import logo from '../assets/Logo.png';
import './WritingEvaluation.css';

/**
 * WritingEvaluation component allows students to submit essays for AI evaluation
 * and view detailed reports with scores, feedback, and suggestions.
 */
const WritingEvaluation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  // Get user data from sessionStorage
  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
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

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    storage.removeUser();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!essayText.trim()) {
      setError('Please enter your essay text');
      return;
    }

    if (essayText.trim().split(/\s+/).length < 50) {
      setError('Essay must be at least 50 words');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/evaluate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: essayText,
          studentName: studentName || 'Student',
          teacherName: teacherName || 'Teacher',
          studentId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate essay');
      }

      const data = await response.json();
      setEvaluationReport(data);
      setShowReport(true);
    } catch (err) {
      setError('Failed to evaluate essay. Please try again.');
      console.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleDownloadPDF = () => {
    if (!evaluationReport) return;

    // Create a printable version
    const printWindow = window.open('', '_blank');
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Writing Evaluation Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #4a90e2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4a90e2;
              margin: 0;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #4a90e2;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .score-box {
              text-align: center;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 10px;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
            }
            .content-box {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #4a90e2;
              margin: 10px 0;
              white-space: pre-wrap;
            }
            .suggestions-list {
              padding-left: 20px;
            }
            .final-remarks {
              background: #e8f5e9;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #4caf50;
              font-style: italic;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Writing Evaluation Report</h1>
          </div>

          <div class="section">
            <h2>Student Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Student Name:</div>
                <div>${escapeHtml(evaluationReport.studentName)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teacher Name:</div>
                <div>${escapeHtml(evaluationReport.teacherName)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Submission Time:</div>
                <div>${new Date(evaluationReport.submissionTime).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Evaluation Summary</h2>
            <div class="score-box">
              Gemini Review Score: ${evaluationReport.score}/100
            </div>
            
            <h3>Grammatical Accuracy</h3>
            <div class="content-box">${escapeHtml(evaluationReport.grammaticalAccuracy)}</div>
            
            <h3>Content Quality</h3>
            <div class="content-box">${escapeHtml(evaluationReport.contentQuality)}</div>
            
            <h3>Feedback Summary</h3>
            <div class="content-box">${escapeHtml(evaluationReport.feedbackSummary)}</div>
          </div>

          <div class="section">
            <h2>Detailed Suggestions</h2>
            <div class="content-box suggestions-list">${escapeHtml(evaluationReport.suggestions)}</div>
          </div>

          <div class="section">
            <h2>Final Remarks</h2>
            <div class="final-remarks">${escapeHtml(evaluationReport.finalRemarks)}</div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 30px; background: #4a90e2; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print / Save as PDF
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  const handleNewEvaluation = () => {
    setShowReport(false);
    setEvaluationReport(null);
    setEssayText('');
    setError('');
  };

  return (
    <div className="take-test-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible || !isMobile ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          {!sidebarCollapsed && <h2 className="sidebar-title">Student Portal</h2>}
        </div>
        
        <nav className="sidebar-nav">
          <button onClick={() => navigateToModule('/dashboard')} className="nav-item">
            <RiDashboardLine className="nav-icon" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button onClick={() => navigateToModule('/profile')} className="nav-item">
            <RiUserLine className="nav-icon" />
            {!sidebarCollapsed && <span>Profile</span>}
          </button>
          <button onClick={() => navigateToModule('/modules')} className="nav-item">
            <RiPencilLine className="nav-icon" />
            {!sidebarCollapsed && <span>Modules</span>}
          </button>
          <button onClick={() => navigateToModule('/take-test')} className="nav-item">
            <RiFileTextLine className="nav-icon" />
            {!sidebarCollapsed && <span>Take Test</span>}
          </button>
          <button onClick={() => navigateToModule('/writing-evaluation')} className="nav-item active">
            <RiBarChartLine className="nav-icon" />
            {!sidebarCollapsed && <span>Writing Evaluation</span>}
          </button>
        </nav>

        <button onClick={handleLogout} className="nav-item logout-btn">
          <RiLogoutCircleRLine className="nav-icon" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <button onClick={toggleSidebar} className="menu-toggle">
            {sidebarCollapsed || !sidebarVisible ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          <h1 className="page-title">Writing Evaluation</h1>
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
        </header>

        <div className="content-area">
          {!showReport ? (
            <div className="evaluation-form-container">
              <div className="form-header">
                <h2>Submit Your Essay for Evaluation</h2>
                <p>Get detailed AI-powered feedback on your writing</p>
              </div>

              <form onSubmit={handleSubmit} className="evaluation-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="studentName">Student Name</label>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your name"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="teacherName">Teacher Name</label>
                    <input
                      type="text"
                      id="teacherName"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Enter teacher's name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="essayText">Essay Text *</label>
                  <textarea
                    id="essayText"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Paste or type your essay here (minimum 50 words)..."
                    className="form-textarea"
                    rows="15"
                    required
                  />
                  <div className="word-count">
                    Word count: {essayText.trim().split(/\s+/).filter(word => word.length > 0).length}
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <RiCheckboxCircleLine />
                      Submit for Evaluation
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="report-container">
              <div className="report-header">
                <h2>Evaluation Report</h2>
                <div className="report-actions">
                  <button onClick={handleDownloadPDF} className="action-btn download-btn">
                    <RiDownloadLine />
                    Download PDF
                  </button>
                  <button onClick={handleNewEvaluation} className="action-btn new-btn">
                    New Evaluation
                  </button>
                </div>
              </div>

              <div className="report-content">
                {/* Student Information */}
                <section className="report-section">
                  <h3 className="section-title">Student Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Student Name:</span>
                      <span className="info-value">{evaluationReport.studentName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Teacher Name:</span>
                      <span className="info-value">{evaluationReport.teacherName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Submission Time:</span>
                      <span className="info-value">
                        {new Date(evaluationReport.submissionTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Evaluation Summary */}
                <section className="report-section">
                  <h3 className="section-title">Evaluation Summary</h3>
                  
                  <div className="score-display">
                    <div className="score-circle">
                      <div className="score-value">{evaluationReport.score}</div>
                      <div className="score-label">out of 100</div>
                    </div>
                    <div className="score-description">
                      <h4>Gemini Review Score</h4>
                      <p>Based on writing quality, clarity, content relevance, and structure</p>
                    </div>
                  </div>

                  <div className="feedback-item">
                    <h4>Grammatical Accuracy</h4>
                    <div className="feedback-content">
                      {evaluationReport.grammaticalAccuracy}
                    </div>
                  </div>

                  <div className="feedback-item">
                    <h4>Content Quality</h4>
                    <div className="feedback-content">
                      {evaluationReport.contentQuality}
                    </div>
                  </div>

                  <div className="feedback-item">
                    <h4>Feedback Summary</h4>
                    <div className="feedback-content">
                      {evaluationReport.feedbackSummary}
                    </div>
                  </div>
                </section>

                {/* Detailed Suggestions */}
                <section className="report-section">
                  <h3 className="section-title">Detailed Suggestions</h3>
                  <div className="suggestions-content">
                    {evaluationReport.suggestions}
                  </div>
                </section>

                {/* Final Remarks */}
                <section className="report-section final-section">
                  <h3 className="section-title">Final Remarks</h3>
                  <div className="final-remarks-content">
                    {evaluationReport.finalRemarks}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WritingEvaluation;
