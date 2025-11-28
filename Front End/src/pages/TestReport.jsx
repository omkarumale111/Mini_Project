import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  RiCheckboxCircleLine,
  RiHomeLine
} from 'react-icons/ri';
import logo from '../assets/Logo.png';
import './TestReport.css';

/**
 * TestReport component displays the submitted test details with PDF download option
 */
const TestReport = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Feature flag: hide legacy sections per new spec
  const showLegacySections = false;

  // Get submission ID from location state or URL params
  const submissionId = location.state?.submissionId;

  // Get user data from sessionStorage
  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Fetch submission details
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!submissionId) {
        setError('No submission ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/submission-details/${submissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }

        const data = await response.json();
        setSubmission(data.submission);
        
        // Automatically fetch AI evaluation after submission details are loaded
        fetchAIEvaluation();
      } catch (err) {
        setError('Failed to load submission details. Please try again.');
        console.error('Error fetching submission:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAIEvaluation = async (retryCount = 0) => {
      setIsEvaluating(true);
      try {
        const response = await fetch('http://localhost:5001/api/evaluate-test-submission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submissionId })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.pending && retryCount < 10) {
            // Evaluation is being generated, retry after 3 seconds
            setTimeout(() => fetchAIEvaluation(retryCount + 1), 3000);
          } else if (data.evaluation) {
            // Evaluation is ready (either cached or just generated)
            setAiEvaluation(data.evaluation);
            setIsEvaluating(false);
          } else {
            setIsEvaluating(false);
          }
        } else {
          console.error('Failed to fetch AI evaluation');
          setIsEvaluating(false);
        }
      } catch (err) {
        console.error('Error fetching AI evaluation:', err);
        setIsEvaluating(false);
      }
    };

    fetchSubmissionDetails();
  }, [submissionId]);

  // Derived analysis helpers based on submission answers and AI response
  const getCombinedAnswersText = () => {
    if (!submission) return '';
    return (submission.questions_and_answers || [])
      .map((qa, idx) => `Q${idx + 1}: ${qa.question_text}\n${qa.answer || ''}`)
      .join('\n\n')
      .trim();
  };

  const analyzeTextStats = (text) => {
    if (!text) {
      return {
        wordCount: 0,
        paragraphs: 0,
        sentences: 0,
        avgSentenceLength: 0,
        vocabLevel: 'N/A'
      };
    }

    const words = text
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean);
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);

    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);
    const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

    // Simple vocabulary level heuristic based on type-token ratio
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const ttr = wordCount ? uniqueWords / wordCount : 0;
    let vocabLevel = 'Basic';
    if (ttr > 0.45) vocabLevel = 'Advanced';
    else if (ttr > 0.3) vocabLevel = 'Intermediate';

    return {
      wordCount,
      paragraphs: paragraphs.length,
      sentences: sentenceCount,
      avgSentenceLength,
      vocabLevel
    };
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

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    storage.removeUser();
    navigate('/login');
  };

  // Helper function to escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleDownloadPDF = () => {
    if (!submission) return;

    const studentName = submission.student_first_name && submission.student_last_name
      ? `${submission.student_first_name} ${submission.student_last_name}`
      : submission.student_email;

    const teacherName = submission.teacher_first_name && submission.teacher_last_name
      ? `${submission.teacher_first_name} ${submission.teacher_last_name}`
      : submission.teacher_email;

    // Create a printable version
    const printWindow = window.open('', '_blank');
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Submission Report - ${submission.test_name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              max-width: 900px;
              margin: 0 auto;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 4px solid #4a90e2;
              padding-bottom: 25px;
              margin-bottom: 35px;
            }
            .header h1 {
              color: #4a90e2;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header .test-name {
              font-size: 20px;
              color: #666;
              font-weight: 500;
            }
            .success-badge {
              display: inline-block;
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 25px;
              font-size: 18px;
              font-weight: 600;
              margin: 20px 0;
              box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            .section {
              margin-bottom: 35px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #4a90e2;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 12px;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .info-item {
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
              border-left: 4px solid #4a90e2;
            }
            .info-label {
              font-weight: 600;
              color: #666;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #333;
              font-size: 16px;
              font-weight: 500;
            }
            .question-block {
              background: white;
              border: 2px solid #e0e0e0;
              border-radius: 10px;
              padding: 25px;
              margin-bottom: 25px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            .question-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;
            }
            .question-number {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 18px;
              flex-shrink: 0;
            }
            .question-text {
              flex: 1;
              font-size: 16px;
              font-weight: 600;
              color: #333;
              line-height: 1.5;
            }
            .word-limit {
              font-size: 13px;
              color: #666;
              font-style: italic;
              margin-top: 5px;
            }
            .answer-label {
              font-weight: 600;
              color: #4a90e2;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .answer-content {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #4caf50;
              line-height: 1.8;
              white-space: pre-wrap;
              word-wrap: break-word;
              color: #444;
              font-size: 15px;
            }
            .answer-stats {
              display: flex;
              gap: 20px;
              margin-top: 10px;
              font-size: 13px;
              color: #666;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 25px;
              border-top: 2px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
              .question-block { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Test Submission Report</h1>
            <div class="test-name">${escapeHtml(submission.test_name)}</div>
            <div class="success-badge">✓ Successfully Submitted</div>
          </div>

          <div class="section">
            <h2>Submission Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Student Name</div>
                <div class="info-value">${escapeHtml(studentName)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teacher Name</div>
                <div class="info-value">${escapeHtml(teacherName)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Test Code</div>
                <div class="info-value">${escapeHtml(submission.test_code)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Submission Time</div>
                <div class="info-value">${new Date(submission.submitted_at).toLocaleString()}</div>
              </div>
              ${submission.time_limit_minutes ? `
              <div class="info-item">
                <div class="info-label">Time Limit</div>
                <div class="info-value">${submission.time_limit_minutes} minutes</div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Total Questions</div>
                <div class="info-value">${submission.questions_and_answers.length}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Questions & Answers</h2>
            ${submission.questions_and_answers.map((qa, index) => {
              const wordCount = qa.answer ? qa.answer.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
              return `
                <div class="question-block">
                  <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div>
                      <div class="question-text">${escapeHtml(qa.question_text)}</div>
                      ${qa.word_limit ? `<div class="word-limit">Word limit: ${qa.word_limit} words</div>` : ''}
                    </div>
                  </div>
                  <div class="answer-label">Your Answer:</div>
                  <div class="answer-content">${escapeHtml(qa.answer) || 'No answer provided'}</div>
                  <div class="answer-stats">
                    <span><strong>Word Count:</strong> ${wordCount}</span>
                    ${qa.word_limit ? `<span><strong>Limit:</strong> ${qa.word_limit}</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${aiEvaluation ? `
          <div class="section" style="page-break-before: always;">
            <h2 style="color: #667eea;">🤖 AI Evaluation Report</h2>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">GEMINI REVIEW SCORE</div>
                <div style="font-size: 36px; font-weight: bold;">${aiEvaluation.reviewScore}/100</div>
                <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Overall assessment</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e0e0e0;">
                <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 5px;">GRAMMAR ACCURACY</div>
                <div style="font-size: 36px; font-weight: bold; color: #333;">${aiEvaluation.grammarScore}/10</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Grammatical correctness</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e0e0e0;">
                <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 5px;">CONTENT COHERENCE</div>
                <div style="font-size: 36px; font-weight: bold; color: #333;">${aiEvaluation.contentScore}/10</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Structure and flow</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e0e0e0;">
                <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 5px;">CREATIVITY</div>
                <div style="font-size: 36px; font-weight: bold; color: #333;">${aiEvaluation.creativityScore}/10</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">Expression quality</div>
              </div>
            </div>

            <h3 style="color: #4a90e2; margin-top: 25px;">📋 Summary Feedback</h3>
            <div style="background: #f9f9f9; padding: 18px; border-radius: 8px; border-left: 4px solid #4a90e2; margin-bottom: 20px; line-height: 1.7;">
              ${escapeHtml(aiEvaluation.summaryFeedback)}
            </div>

            <h3 style="color: #4a90e2; margin-top: 25px;">📝 Detected Grammar & Language Issues</h3>
            ${aiEvaluation.grammarIssues.includes('No significant errors') ? `
              <div style="background: #d4edda; color: #155724; padding: 18px; border-radius: 8px; text-align: center; font-weight: 600; border: 2px solid #c3e6cb;">
                ✅ No significant errors found - Great job!
              </div>
            ` : `
              ${aiEvaluation.grammarIssues.split('---').map(issue => {
                const excerptMatch = issue.match(/EXCERPT:\s*(.+)/);
                const errorTypeMatch = issue.match(/ERROR_TYPE:\s*(.+)/);
                const correctionMatch = issue.match(/CORRECTION:\s*(.+)/);
                
                if (excerptMatch && errorTypeMatch && correctionMatch) {
                  return `
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; margin-bottom: 12px;">
                      <div style="font-weight: 600; color: #e74c3c; margin-bottom: 8px; font-style: italic;">"${escapeHtml(excerptMatch[1].trim())}"</div>
                      <div style="display: inline-block; padding: 3px 10px; background: #fff3cd; color: #856404; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                        ${escapeHtml(errorTypeMatch[1].trim())}
                      </div>
                      <div style="color: #27ae60; padding-top: 8px; border-top: 1px solid #e0e0e0;">
                        <strong>Correction:</strong> ${escapeHtml(correctionMatch[1].trim())}
                      </div>
                    </div>
                  `;
                }
                return '';
              }).join('')}
            `}

            <h3 style="color: #4a90e2; margin-top: 25px;">💡 Improvement Suggestions</h3>
            ${aiEvaluation.suggestions.split('\n').filter(s => s.trim()).map(suggestion => `
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12; margin-bottom: 10px; line-height: 1.6;">
                💡 ${escapeHtml(suggestion.replace(/^\d+\.\s*/, ''))}
              </div>
            `).join('')}

            <h3 style="color: #4a90e2; margin-top: 25px;">🌟 Final Remarks</h3>
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 10px; border: 2px solid #4caf50; line-height: 1.7; color: #2e7d32; font-weight: 500;">
              ${escapeHtml(aiEvaluation.finalRemarks)}
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>This is an official test submission report${aiEvaluation ? ' with AI evaluation' : ''}.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 12px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              Print / Save as PDF
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="test-report-container">
        <div className="loading-screen">
          <div className="spinner-large"></div>
          <p>Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="test-report-container">
        <div className="error-screen">
          <h2>Error Loading Report</h2>
          <p>{error || 'Submission not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <RiHomeLine /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const studentName = submission.student_first_name && submission.student_last_name
    ? `${submission.student_first_name} ${submission.student_last_name}`
    : submission.student_email;

  const teacherName = submission.teacher_first_name && submission.teacher_last_name
    ? `${submission.teacher_first_name} ${submission.teacher_last_name}`
    : submission.teacher_email;

  return (
    <div className="test-report-container">
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
          <button onClick={() => navigateToModule('/student-report')} className="nav-item">
            <RiBarChartLine className="nav-icon" />
            {!sidebarCollapsed && <span>My Reports</span>}
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
          <h1 className="page-title">Test Submission Report</h1>
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
        </header>

        <div className="content-area">
          <div className="report-wrapper">
            {/* Success Banner */}
            <div className="success-banner">
              <RiCheckboxCircleLine className="success-icon" />
              <div className="success-content">
                <h2>Test Submitted Successfully!</h2>
                <p>Your answers have been recorded and submitted to your teacher.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={handleDownloadPDF} className="action-btn download-btn">
                <RiDownloadLine />
                Download PDF Report
              </button>
              <button onClick={() => navigate('/dashboard')} className="action-btn home-btn">
                <RiHomeLine />
                Back to Dashboard
              </button>
            </div>

            {/* Report Content */}
            <div className="report-content">
              {/* New AI-driven Report Layout (no submission info or Q&A list) */}
              <section className="report-section">
                <h3 className="section-title">AI-Powered Assessment & Analysis</h3>
                {(() => {
                  const combined = getCombinedAnswersText();
                  const stats = analyzeTextStats(combined);
                  const total = aiEvaluation ? aiEvaluation.reviewScore : 0;
                  const percentage = total; // already 0-100
                  const grade = percentage >= 85 ? 'A' : percentage >= 70 ? 'B' : percentage >= 55 ? 'C' : percentage >= 40 ? 'D' : 'F';

                  return (
                    <>
                      {/* Header-like summary cards */}
                      <div className="summary-grid">
                        <div className="summary-card primary">
                          <div className="summary-value">{total}</div>
                          <div className="summary-label">Total Score</div>
                          <div className="summary-sub">out of 100</div>
                        </div>
                        <div className="summary-card">
                          <div className="summary-value">{percentage}%</div>
                          <div className="summary-label">Percentage</div>
                          <div className="summary-sub">Grade: {grade}</div>
                        </div>
                        <div className="summary-card">
                          <div className="summary-value">{stats.wordCount}</div>
                          <div className="summary-label">Word Count</div>
                          <div className="summary-sub">{stats.paragraphs} paragraphs</div>
                        </div>
                      </div>

                      {/* Score Bars */}
                      {aiEvaluation && (
                        <div className="scorebars">
                          <div className="scorebar-item">
                            <div className="scorebar-head">
                              <span>Language & Grammar</span>
                              <strong>{aiEvaluation.grammarScore}/10</strong>
                            </div>
                            <div className="scorebar-track"><div className="scorebar-fill" style={{ width: `${(aiEvaluation.grammarScore/10)*100}%` }}></div></div>
                          </div>
                          <div className="scorebar-item">
                            <div className="scorebar-head">
                              <span>Content & Coherence</span>
                              <strong>{aiEvaluation.contentScore}/10</strong>
                            </div>
                            <div className="scorebar-track"><div className="scorebar-fill" style={{ width: `${(aiEvaluation.contentScore/10)*100}%` }}></div></div>
                          </div>
                          <div className="scorebar-item">
                            <div className="scorebar-head">
                              <span>Creativity & Expression</span>
                              <strong>{aiEvaluation.creativityScore}/10</strong>
                            </div>
                            <div className="scorebar-track"><div className="scorebar-fill" style={{ width: `${(aiEvaluation.creativityScore/10)*100}%` }}></div></div>
                          </div>
                        </div>
                      )}

                      {/* Detailed Analysis */}
                      <div className="analysis-grid">
                        <div className="analysis-card">
                          <div className="analysis-label">Avg Sentence Length</div>
                          <div className="analysis-value">{stats.avgSentenceLength} words</div>
                        </div>
                        <div className="analysis-card">
                          <div className="analysis-label">Vocabulary Level</div>
                          <div className="analysis-value">{stats.vocabLevel}</div>
                        </div>
                        <div className="analysis-card">
                          <div className="analysis-label">Sentences</div>
                          <div className="analysis-value">{stats.sentences}</div>
                        </div>
                        <div className="analysis-card">
                          <div className="analysis-label">Grammar Issues Detected</div>
                          <div className="analysis-value">{aiEvaluation ? (aiEvaluation.grammarIssues.includes('No significant errors') ? 0 : aiEvaluation.grammarIssues.split('---').filter(x => x.trim() && !x.includes('No significant errors')).length) : 0}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </section>

              {/* AI Evaluation Section */}
              {isEvaluating && (
                <section className="report-section ai-evaluation-loading">
                  <h3 className="section-title">🤖 AI Evaluation Report</h3>
                  <div className="loading-evaluation">
                    <div className="spinner-large"></div>
                    <p>Generating AI evaluation using Gemini...</p>
                  </div>
                </section>
              )}

              {aiEvaluation && !isEvaluating && (
                <section className="report-section ai-evaluation">
                  <h3 className="section-title">🤖 AI Evaluation Report</h3>
                  
                  {/* Overall Evaluation Scores */}
                  <div className="evaluation-scores">
                    <div className="score-card primary-score">
                      <div className="score-label">Gemini Review Score</div>
                      <div className="score-value">{aiEvaluation.reviewScore}/100</div>
                      <div className="score-subtitle">Overall assessment</div>
                    </div>
                    <div className="score-card">
                      <div className="score-label">Grammar Accuracy</div>
                      <div className="score-value">{aiEvaluation.grammarScore}/10</div>
                      <div className="score-subtitle">Grammatical correctness</div>
                    </div>
                    <div className="score-card">
                      <div className="score-label">Content Coherence</div>
                      <div className="score-value">{aiEvaluation.contentScore}/10</div>
                      <div className="score-subtitle">Structure and flow</div>
                    </div>
                    <div className="score-card">
                      <div className="score-label">Creativity & Expression</div>
                      <div className="score-value">{aiEvaluation.creativityScore}/10</div>
                      <div className="score-subtitle">Originality and style</div>
                    </div>
                  </div>

                  {/* Summary Feedback */}
                  <div className="evaluation-subsection">
                    <h4 className="subsection-title">📋 Summary Feedback</h4>
                    <div className="feedback-box">
                      {aiEvaluation.summaryFeedback}
                    </div>
                  </div>

                  {/* Grammar Issues */}
                  <div className="evaluation-subsection">
                    <h4 className="subsection-title">📝 Detected Grammar & Language Issues</h4>
                    <div className="grammar-issues">
                      {aiEvaluation.grammarIssues.split('---').map((issue, index) => {
                        if (!issue.trim() || issue.includes('No significant errors')) {
                          return (
                            <div key={index} className="no-errors-message">
                              ✅ No significant errors found - Great job!
                            </div>
                          );
                        }
                        
                        const excerptMatch = issue.match(/EXCERPT:\s*(.+)/);
                        const errorTypeMatch = issue.match(/ERROR_TYPE:\s*(.+)/);
                        const correctionMatch = issue.match(/CORRECTION:\s*(.+)/);
                        
                        if (excerptMatch && errorTypeMatch && correctionMatch) {
                          return (
                            <div key={index} className="grammar-issue-card">
                              <div className="issue-excerpt">"{excerptMatch[1].trim()}"</div>
                              <div className="issue-type">
                                <span className="type-badge">{errorTypeMatch[1].trim()}</span>
                              </div>
                              <div className="issue-correction">
                                <strong>Correction:</strong> {correctionMatch[1].trim()}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Improvement Suggestions */}
                  <div className="evaluation-subsection">
                    <h4 className="subsection-title">💡 Improvement Suggestions</h4>
                    <div className="suggestions-list">
                      {aiEvaluation.suggestions.split('\n').filter(s => s.trim()).map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          {suggestion.replace(/^\d+\.\s*/, '')}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Remarks */}
                  <div className="evaluation-subsection final-remarks-section">
                    <h4 className="subsection-title">🌟 Final Remarks</h4>
                    <div className="final-remarks-box">
                      {aiEvaluation.finalRemarks}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestReport;
