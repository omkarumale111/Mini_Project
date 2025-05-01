import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RBQ1.css";

const PROBLEM_STATEMENT = "Write a brief report summarizing the quarterly sales performance of a retail store, highlighting key metrics and trends.";

const initialText = "";

const RBQ1 = () => {
  const [text, setText] = useState(initialText);
  const [activeBox, setActiveBox] = useState(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const navigate = useNavigate();

  const feedbackBoxes = [
    {
      title: "Structure & Format",
      content: "Check report formatting. Include clear sections: Executive Summary, Key Metrics, Analysis, and Recommendations. (Expanded details: Use headers, bullet points, and data visualization where appropriate.)"
    },
    {
      title: "Content Analysis",
      content: "Ensure all key metrics are covered. Compare with previous quarters. (Expanded details: Include sales figures, growth rate, top-performing products, and areas for improvement.)"
    },
    {
      title: "Professional Tone",
      content: "Maintain formal business language. Be objective and data-driven. (Expanded details: Use precise terminology, avoid personal opinions, and support claims with data.)"
    }
  ];

  const handleBoxClick = (index) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="rbq1-root">
      <header className="rbq1-header">
        <div className="rbq1-logo-row">
          <span className="rbq1-logo-text">WriteEdge</span>
          <nav className="rbq1-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="rbq1-title-row">
          <span className="rbq1-section">Reports & Brief</span>
          <span className="rbq1-question">Question 1</span>
        </div>
      </header>
      <main className="rbq1-main">
        <div className="rbq1-problem-label">PROBLEM STATEMENT</div>
        <div className="rbq1-problem-box">{PROBLEM_STATEMENT}</div>
        <div className="rbq1-main-row fit-main-row">
          <div className="rbq1-editor-col fit-editor">
            <textarea
              className="rbq1-editor fit-editor-area"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
            />
            <div className="rbq1-wordcount">Word Count {wordCount}</div>
            <button className="rbq1-submit">SUBMIT</button>
          </div>
          <div className="rbq1-feedback-col fit-feedback">
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

export default RBQ1;
