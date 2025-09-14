import React, { useState } from 'react';

const AIFeedbackSection = ({ answers, requiredFields, lessonId, user }) => {
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGetFeedback = async () => {
    // Check if all required fields are answered
    const unansweredFields = requiredFields.filter(field => !answers[field] || answers[field].trim() === '');
    
    if (unansweredFields.length > 0) {
      alert('Please answer all questions before getting feedback.');
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      // Combine all answers into one text for analysis
      const combinedText = requiredFields.map(field => 
        `${field}: ${answers[field]}`
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
    setFeedback(null);
    setShowFeedback(false);
  };

  const allFieldsCompleted = requiredFields.every(field => answers[field] && answers[field].trim() !== '');

  return (
    <div className="feedback-section">
      {!showFeedback && !isLoading && (
        <div className="feedback-placeholder">
          <div className="placeholder-icon">📝</div>
          <h3>AI Feedback</h3>
          <p>Complete all questions and click "Get AI Feedback" to receive detailed analysis of your writing including grammar suggestions, content feedback, and improvement tips.</p>
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
            className="reset-button"
            onClick={handleReset}
            style={{ width: '100%', marginTop: '15px' }}
          >
            Get New Feedback
          </button>
        </div>
      )}

      {/* Action buttons for parent component */}
      <div className="ai-feedback-actions" style={{ display: 'none' }}>
        <button 
          className="feedback-button"
          onClick={handleGetFeedback}
          disabled={isLoading || !allFieldsCompleted}
        >
          {isLoading ? 'Analyzing...' : 'Get AI Feedback'}
        </button>
      </div>
    </div>
  );
};

export default AIFeedbackSection;
