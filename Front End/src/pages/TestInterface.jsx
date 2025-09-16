import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestInterface.css';
import { RiArrowLeftLine, RiSendPlaneLine, RiTimeLine, RiFileTextLine } from 'react-icons/ri';

const TestInterface = () => {
  const { testCode } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchTestData();
    } else {
      navigate('/login');
    }
  }, [testCode, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    
    alert('Time is up! Your test will be submitted automatically.');
    await submitTest(true);
  };

  const submitTest = async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const submissionData = {
        testId: test.id,
        studentId: user.id,
        answers: test.questions.map(question => ({
          questionId: question.id,
          answerText: answers[question.id] ? answers[question.id].trim() : ''
        }))
      };

      const response = await fetch('http://localhost:5001/api/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(isAutoSubmit ? 'Test submitted automatically due to time limit!' : 'Test submitted successfully!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTestData = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/test/${testCode}`);
      const data = await response.json();
      
      if (response.ok) {
        setTest(data.test);
        // Initialize answers object
        const initialAnswers = {};
        data.test.questions.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);
        
        // Set up timer if test has time limit
        if (data.test.time_limit_minutes) {
          const startTime = Date.now();
          setTestStartTime(startTime);
          setTimeRemaining(data.test.time_limit_minutes * 60); // Convert to seconds
        }
      } else {
        setError(data.error || 'Failed to load test');
      }
    } catch (err) {
      console.error('Error fetching test:', err);
      setError('Failed to load test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const unansweredQuestions = test.questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit your test? This action cannot be undone.')) {
      return;
    }

    await submitTest(false);
  };

  const getAnswerWordCount = (questionId) => {
    const answer = answers[questionId] || '';
    return answer.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isWordLimitExceeded = (questionId) => {
    const question = test?.questions.find(q => q.id === questionId);
    if (!question || !question.word_limit) return false;
    
    const wordCount = getAnswerWordCount(questionId);
    return wordCount > question.word_limit;
  };

  if (isLoading) {
    return (
      <div className="test-interface-container">
        <div className="loading">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-interface-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/take-test')}>Back to Test Entry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-interface-container">
      <div className="test-header">
        <button 
          className="back-button"
          onClick={() => navigate('/take-test')}
        >
          <RiArrowLeftLine /> Back
        </button>
        <div className="test-info">
          <h1>{test.test_name}</h1>
          <div className="test-meta">
            <span className="test-code">Code: {test.test_code}</span>
            <span className="question-count">
              <RiFileTextLine /> {test.questions.length} Questions
            </span>
            {timeRemaining !== null && (
              <span className={`timer ${timeRemaining <= 300 ? 'warning' : ''} ${timeRemaining <= 60 ? 'critical' : ''}`}>
                <RiTimeLine /> Time Remaining: {formatTime(timeRemaining)}
              </span>
            )}
          </div>
        </div>
      </div>

      {test.description && (
        <div className="test-description">
          <p>{test.description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="test-form">
        <div className="questions-container">
          {test.questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <h3>Question {index + 1}</h3>
                <div className="word-count">
                  <span className={isWordLimitExceeded(question.id) ? 'word-count-exceeded' : ''}>
                    Words: {getAnswerWordCount(question.id)}
                    {question.word_limit && ` / ${question.word_limit} max`}
                  </span>
                  {isWordLimitExceeded(question.id) && (
                    <span className="word-limit-warning">Word limit exceeded!</span>
                  )}
                </div>
              </div>
              
              <div className="question-text">
                {question.question_text}
                {question.word_limit && (
                  <div className="word-limit-info">
                    <small>Maximum {question.word_limit} words</small>
                  </div>
                )}
              </div>
              
              <div className="answer-section">
                <label htmlFor={`answer-${question.id}`}>Your Answer:</label>
                <textarea
                  id={`answer-${question.id}`}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Write your answer here (3-4 sentences recommended)..."
                  rows="6"
                  required
                  className={isWordLimitExceeded(question.id) ? 'word-limit-exceeded' : ''}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="submit-section">
          <div className="submit-info">
            <p>Please review your answers before submitting. Once submitted, you cannot make changes.</p>
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            <RiSendPlaneLine />
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestInterface;
