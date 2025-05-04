import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WEQ1.css";

const PROBLEM_STATEMENT = "Respond to a customer complaint about a delayed product delivery, ensuring professionalism and offering a resolution.";

const initialText = "";

const WEQ1 = () => {
  const [text, setText] = useState(initialText);
  const [activeBox, setActiveBox] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter your response before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Get the current user from localStorage (assuming you store it there after login)
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser || !currentUser.id) {
        alert("Please log in to submit your response.");
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/weq1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          content: text
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      const result = await response.json();
      alert('Your response has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackBoxes = [
    {
      title: "Spell & Grammar Check",
      content: "No spelling errors found. Sentence structure is clear. (Expanded details: All sentences are grammatically correct. No passive voice detected.)"
    },
    {
      title: "Content Feedback",
      content: "Good use of apology and assurance. Consider adding a specific resolution. (Expanded details: The response is polite and empathetic. You could mention a compensation or estimated delivery date.)"
    },
    {
      title: "Suggestions",
      content: "Try to personalize the response and mention a delivery date if possible. (Expanded details: Address the customer by name and offer a direct contact for further assistance.)"
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