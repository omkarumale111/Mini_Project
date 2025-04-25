import React, { useState } from "react";
import "./WEQ1.css";

const PROBLEM_STATEMENT = "Respond to a customer complaint about a delayed product delivery, ensuring professionalism and offering a resolution.";

const initialText = "";

function ExpandableBox({ title, children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`weq1-feedback-box expandable${expanded ? " expanded" : ""}`} onClick={() => setExpanded((e) => !e)}>
      <div className="expandable-title">{title}</div>
      {expanded && <div className="expandable-content">{children}</div>}
    </div>
  );
}

const SpellCheckBox = () => (
  <ExpandableBox title="Spell & Grammar Check">
    No spelling errors found. Sentence structure is clear. (Expanded details: All sentences are grammatically correct. No passive voice detected.)
  </ExpandableBox>
);
const ContentFeedbackBox = () => (
  <ExpandableBox title="Content Feedback">
    Good use of apology and assurance. Consider adding a specific resolution. (Expanded details: The response is polite and empathetic. You could mention a compensation or estimated delivery date.)
  </ExpandableBox>
);
const SuggestionsBox = () => (
  <ExpandableBox title="Suggestions">
    Try to personalize the response and mention a delivery date if possible. (Expanded details: Address the customer by name and offer a direct contact for further assistance.)
  </ExpandableBox>
);

const WEQ1 = () => {
  const [text, setText] = useState(initialText);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="weq1-root">
      <header className="weq1-header">
        <div className="weq1-logo-row">
          <span className="weq1-logo-text">WriteEdge</span>
          <nav className="weq1-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="/login">LOG OUT</a>
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
              onChange={e => setText(e.target.value)}
              placeholder="Type your response here..."
            />
            <div className="weq1-wordcount">Word Count {wordCount}</div>
            <button className="weq1-submit">SUBMIT</button>
          </div>
          <div className="weq1-feedback-col fit-feedback">
            <SpellCheckBox />
            <ContentFeedbackBox />
            <SuggestionsBox />
          </div>
        </div>
      </main>
    </div>
  );
};

export default WEQ1;
