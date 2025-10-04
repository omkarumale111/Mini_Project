import React from "react";
import "./Report.css";

const Report = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <h2 className="dashboard-title">STUDENT WRITING PERFORMANCE ANALYTICS</h2>

      <div className="dashboard-grid">
        {/* Left Section - Overview */}
        <div className="overview-section">
          <h3>Overview & Scores</h3>
          <div className="student-info">
            <p><strong>Anna S.</strong></p>
            <p>ID: 12245</p>
            <p>Date: --/--/----</p>
          </div>

          <div className="score-container-wrapper">
            <div className="score-chart-section">
                <div className="score-text">Overall Score 85%</div>
                <div className="score-circle"></div>
            </div>

            <div className="score-details">
                <p>Accuracy: 88%</p>
                <p>Grammar: 80%</p>
                <p>Spelling: 95%</p>
                <p>Relevancy: 72%</p>
            </div>
          </div>

        </div>

        {/* Right Section - Detailed Breakdown */}
        <div className="details-section">
          <h3>Detailed Question Breakdown</h3>

          <div className="question-card">
            <h4>Question 1: Essay Prompt (88%)</h4>
            <p>
              The main point <span className="highlight">is about</span>{" "}
              (We arise me is the future. We need to make it good.)
            </p>
            <div className="tag grammar">Grammar: Subject-verb agreement</div>
          </div>

          <div className="question-card">
            <h4>Question 2: Short Report (80%)</h4>
            <p>
              The main point <span className="highlight">is about</span>{" "}
              (We aniteme its the future. We need to make it good.)
            </p>
            <div className="tag spelling">Spelling: Off-topic</div>
          </div>
        </div>
      </div>

      {/* Bottom - Tips */}
      <div className="tips-section">
        <h3>Tips for Improvement</h3>
        <ul>
          <li><strong>Spelling:</strong> Proofread carefully.</li>
          <li><strong>Grammar:</strong> Review subject-verb introduction, body.</li>
          <li><strong>Flow of Structure:</strong> Maintain formal language for paragraphs.</li>
        </ul>
      </div>
    </div>
  );
};

export default Report;
