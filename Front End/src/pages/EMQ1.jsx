import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EMQ1.css";

const PROBLEM_STATEMENT = "Draft a professional email to schedule a team meeting to discuss the upcoming project launch, ensuring all necessary details are included.";

const initialText = "";

const EMQ1 = () => {
  const [text, setText] = useState(initialText);
  const [activeBox, setActiveBox] = useState(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const navigate = useNavigate();

  const feedbackBoxes = [
    {
      title: "Email Structure",
      content: "Check email format: Subject line, greeting, body, and signature. (Expanded details: Clear subject line, professional greeting, concise body paragraphs, and appropriate closing.)"
    },
    {
      title: "Meeting Details",
      content: "Include all essential information: date, time, location/platform, agenda. (Expanded details: Specify meeting duration, virtual meeting link if applicable, and any preparation required.)"
    },
    {
      title: "Professional Tone",
      content: "Maintain clear and courteous language. Be concise yet informative. (Expanded details: Use appropriate salutations, avoid casual language, and maintain a positive tone.)"
    }
  ];

  const handleBoxClick = (index) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="emq1-root">
      <header className="emq1-header">
        <div className="emq1-logo-row">
          <span className="emq1-logo-text">WriteEdge</span>
          <nav className="emq1-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="emq1-title-row">
          <span className="emq1-section">Emails & Memos</span>
          <span className="emq1-question">Question 1</span>
        </div>
      </header>
      <main className="emq1-main">
        <div className="emq1-problem-label">PROBLEM STATEMENT</div>
        <div className="emq1-problem-box">{PROBLEM_STATEMENT}</div>
        <div className="emq1-main-row fit-main-row">
          <div className="emq1-editor-col fit-editor">
            <textarea
              className="emq1-editor fit-editor-area"
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
            />
            <div className="emq1-wordcount">Word Count {wordCount}</div>
            <button className="emq1-submit">SUBMIT</button>
          </div>
          <div className="emq1-feedback-col fit-feedback">
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

export default EMQ1;
