import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageTests.css';
import { 
  RiArrowLeftLine, 
  RiEyeLine, 
  RiDeleteBin6Line, 
  RiFileTextLine,
  RiGroupLine,
  RiCalendarLine,
  RiCodeLine
} from 'react-icons/ri';

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchTests(JSON.parse(userData).id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchTests = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/teacher-tests/${teacherId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTests(data.tests || []);
      } else {
        console.error('Failed to fetch tests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestSubmissions = async (testId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/test-submissions/${testId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        console.error('Failed to fetch submissions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleViewTest = (test) => {
    setSelectedTest(test);
    fetchTestSubmissions(test.id);
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/delete-test/${testId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setTests(tests.filter(test => test.id !== testId));
          if (selectedTest && selectedTest.id === testId) {
            setSelectedTest(null);
            setSubmissions([]);
          }
          alert('Test deleted successfully');
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete test');
        }
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="manage-tests-container">
        <div className="loading">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="manage-tests-container">
      <div className="manage-tests-header">
        <button 
          className="back-button"
          onClick={() => navigate('/teacher-dashboard')}
        >
          <RiArrowLeftLine /> Back to Dashboard
        </button>
        <h1>Manage Tests</h1>
      </div>

      <div className="manage-tests-content">
        {/* Tests List */}
        <div className="tests-section">
          <h2>Your Tests ({tests.length})</h2>
          
          {tests.length === 0 ? (
            <div className="no-tests">
              <RiFileTextLine size={48} />
              <p>No tests created yet</p>
              <button 
                className="create-first-test-btn"
                onClick={() => navigate('/create-test')}
              >
                Create Your First Test
              </button>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map(test => (
                <div key={test.id} className="test-card">
                  <div className="test-header">
                    <h3>{test.test_name}</h3>
                    <div className="test-code">
                      <RiCodeLine />
                      <span>{test.test_code}</span>
                    </div>
                  </div>
                  
                  {test.description && (
                    <p className="test-description">{test.description}</p>
                  )}
                  
                  <div className="test-stats">
                    <div className="stat">
                      <RiFileTextLine />
                      <span>{test.question_count} Questions</span>
                    </div>
                    <div className="stat">
                      <RiGroupLine />
                      <span>{test.submission_count} Submissions</span>
                    </div>
                    <div className="stat">
                      <RiCalendarLine />
                      <span>{formatDate(test.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="test-actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewTest(test)}
                    >
                      <RiEyeLine /> View Details
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Details and Submissions */}
        {selectedTest && (
          <div className="test-details-section">
            <h2>Test Details: {selectedTest.test_name}</h2>
            
            <div className="test-info-card">
              <div className="info-row">
                <strong>Test Code:</strong> 
                <span className="test-code-display">{selectedTest.test_code}</span>
              </div>
              <div className="info-row">
                <strong>Created:</strong> {formatDate(selectedTest.created_at)}
              </div>
              <div className="info-row">
                <strong>Questions:</strong> {selectedTest.question_count}
              </div>
              <div className="info-row">
                <strong>Total Submissions:</strong> {submissions.length}
              </div>
            </div>

            <h3>Student Submissions</h3>
            
            {submissions.length === 0 ? (
              <div className="no-submissions">
                <p>No student submissions yet</p>
              </div>
            ) : (
              <div className="submissions-list">
                {submissions.map(submission => (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <h4>Student: {submission.student_email}</h4>
                      <span className="submission-date">
                        {formatDate(submission.submitted_at)}
                      </span>
                    </div>
                    
                    <div className="answers-section">
                      {submission.answers.map((answer, index) => (
                        <div key={answer.question_id} className="answer-item">
                          <div className="question-text">
                            <strong>Q{index + 1}:</strong> {answer.question_text}
                          </div>
                          <div className="answer-text">
                            <strong>Answer:</strong> {answer.answer_text || 'No answer provided'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTests;
