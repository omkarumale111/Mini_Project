import React, { useState } from 'react';
import './PracticeInterface.css';

const PracticeInterface = () => {
  const [questions] = useState([
    {
      id: 1,
      question: "Describe your experience with teamwork in a professional setting.",
      placeholder: "Share specific examples of how you've collaborated with others..."
    },
    {
      id: 2,
      question: "What are your career goals for the next five years?",
      placeholder: "Explain your professional aspirations and how you plan to achieve them..."
    },
    {
      id: 3,
      question: "How do you handle challenging situations or conflicts at work?",
      placeholder: "Provide examples of problem-solving approaches you've used..."
    },
    {
      id: 4,
      question: "What motivates you to perform your best work?",
      placeholder: "Discuss what drives your professional performance..."
    }
  ]);

  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      // Combine all answers into one text for analysis
      const combinedText = questions.map(q => 
        `Question: ${q.question}\nAnswer: ${answers[q.id]}`
      ).join('\n\n');

      const response = await fetch('http://localhost:5001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing your responses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setFeedback(null);
    setShowFeedback(false);
  };

  return (
    <div className="practice-interface">
      <div className="practice-header">
        <h1>Writing Practice Interface</h1>
        <p>Answer the questions below and receive AI-powered feedback on your writing</p>
      </div>

      <div className="practice-content">
        {/* Questions Section - 70% */}
        <div className="questions-section">
          <div className="questions-header">
            <h2>Practice Questions</h2>
            <div className="progress-indicator">
              {Object.keys(answers).length} of {questions.length} answered
            </div>
          </div>

          <div className="questions-container">
            {questions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-number">Question {index + 1}</div>
                <h3 className="question-text">{question.question}</h3>
                <textarea
                  className="answer-input"
                  placeholder={question.placeholder}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  rows="6"
                />
                <div className="character-count">
                  {answers[question.id]?.length || 0} characters
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(answers).length !== questions.length}
            >
              {isLoading ? 'Analyzing...' : 'Submit for Analysis'}
            </button>
            <button 
              className="reset-btn" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Feedback Section - 30% */}
        <div className="feedback-section">
          {!showFeedback && !isLoading && (
            <div className="feedback-placeholder">
              <div className="placeholder-icon">📝</div>
              <h3>Feedback will appear here</h3>
              <p>Complete all questions and click "Submit for Analysis" to receive detailed feedback on your writing.</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Analyzing your responses...</h3>
              <p>Our AI is reviewing your writing for grammar, clarity, and overall quality.</p>
            </div>
          )}

          {showFeedback && feedback && (
            <div className="feedback-content">
              <h2>Analysis Results</h2>
              
              <div className="feedback-section-item">
                <h3>📚 Grammar & Spelling</h3>
                <div className="feedback-text">
                  {feedback.spellAndGrammar}
                </div>
              </div>

              <div className="feedback-section-item">
                <h3>💡 Content Feedback</h3>
                <div className="feedback-text">
                  {feedback.contentFeedback}
                </div>
              </div>

              <div className="feedback-section-item">
                <h3>🎯 Suggestions</h3>
                <div className="feedback-text">
                  {feedback.suggestions}
                </div>
              </div>

              <button 
                className="new-attempt-btn"
                onClick={handleReset}
              >
                Start New Practice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeInterface;
