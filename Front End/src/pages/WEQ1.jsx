import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WEQ1.css";

const PROBLEM_STATEMENT = "Respond to a customer complaint about a delayed product delivery, ensuring professionalism and offering a resolution.";

const initialText = "";

const WEQ1 = () => {
  const [text, setText] = useState(initialText);
  const [activeBox, setActiveBox] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter your response before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Get the current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser || !currentUser.id) {
        alert("Please log in to submit your response.");
        navigate('/login');
        return;
      }

      // First, analyze the text
      const analysisResponse = await fetch('http://localhost:5001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze text');
      }

      const analysisResult = await analysisResponse.json();
      setFeedback({
        spellAndGrammar: analysisResult.spellAndGrammar,
        contentFeedback: analysisResult.contentFeedback,
        suggestions: analysisResult.suggestions
      });

      // Then save the response
      const saveResponse = await fetch('http://localhost:5001/api/weq1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          content: text
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save response');
      }

      const result = await saveResponse.json();
      console.log('Response saved successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackBoxes = [
    {
      title: "Spell & Grammar Check",
      content: feedback?.spellAndGrammar || "Submit your text to see spelling and grammar analysis"
    },
    {
      title: "Content Feedback",
      content: feedback?.contentFeedback || "Submit your text to see content feedback"
    },
    {
      title: "Suggestions",
      content: feedback?.suggestions || "Submit your text to see suggestions for improvement"
    }
  ];

  const handleBoxClick = (index) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="weq1-root">
      <header className="weq1-header">
        <div className="weq1-logo-row">
          <span className="weq1-logo-text">WriteEdge</span>
          <nav className="weq1-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="weq1-title-row">
          <span className="weq1-section">Writing Essentials</span>
          <span className="weq1-question">Question 1</span>
        </div>
      </header>
      <main className="weq1-main">
        <div className="weq1-problem-label">PROBLEM STATEMENT</div>
        <div className="weq1-problem-box">{PROBLEM_STATEMENT}</div>
        <div className="weq1-main-row fit-main-row">
          <div className="weq1-editor-col fit-editor">
            <textarea
              className="weq1-editor fit-editor-area"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
              disabled={isSubmitting}
            />
            <div className="weq1-wordcount">Word Count {wordCount}</div>
            <button 
              className="weq1-submit" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
          <div className="weq1-feedback-col fit-feedback">
            {feedbackBoxes.map((box, index) => (
              <div
                key={index}
                className={`feedback-box ${activeBox === index ? "active" : ""}`}
                onClick={() => handleBoxClick(index)}
              >
                <div className="feedback-title">{box.title}</div>
                {activeBox === index && (
                  <div className="feedback-content">{box.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WEQ1;