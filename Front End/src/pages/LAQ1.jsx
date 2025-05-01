import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LAQ1.css";

const PROBLEM_STATEMENT = "Write a cover letter for a software developer position, highlighting your relevant skills and experience while demonstrating your enthusiasm for the role.";

const initialText = "";

const LAQ1 = () => {
  const [text, setText] = useState(initialText);
  const [activeBox, setActiveBox] = useState(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const navigate = useNavigate();

  const feedbackBoxes = [
    {
      title: "Letter Format",
      content: "Check proper business letter format: header, date, recipient details, salutation. (Expanded details: Include your contact information, company address, and professional closing.)"
    },
    {
      title: "Content Structure",
      content: "Review paragraph organization: introduction, body paragraphs, conclusion. (Expanded details: Strong opening, relevant experience in body, clear call to action in closing.)"
    },
    {
      title: "Skills Alignment",
      content: "Match skills to job requirements. Show enthusiasm and cultural fit. (Expanded details: Use specific examples of achievements, demonstrate knowledge of the company.)"
    }
  ];

  const handleBoxClick = (index) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="laq1-root">
      <header className="laq1-header">
        <div className="laq1-logo-row">
          <span className="laq1-logo-text">WriteEdge</span>
          <nav className="laq1-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="laq1-title-row">
          <span className="laq1-section">Letters & Applications</span>
          <span className="laq1-question">Question 1</span>
        </div>
      </header>
      <main className="laq1-main">
        <div className="laq1-problem-label">PROBLEM STATEMENT</div>
        <div className="laq1-problem-box">{PROBLEM_STATEMENT}</div>
        <div className="laq1-main-row fit-main-row">
          <div className="laq1-editor-col fit-editor">
            <textarea
              className="laq1-editor fit-editor-area"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
            />
            <div className="laq1-wordcount">Word Count {wordCount}</div>
            <button className="laq1-submit">SUBMIT</button>
          </div>
          <div className="laq1-feedback-col fit-feedback">
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

export default LAQ1;
