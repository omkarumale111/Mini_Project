import React from "react";
import "./ReportsBrief.css";
import { FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  { name: "Level 1", unlocked: true },
  { name: "Level 2", unlocked: false },
  { name: "Level 3", unlocked: false },
  { name: "Level 4", unlocked: false }
];

const ReportsBrief = () => {
  const navigate = useNavigate();
  return (
    <div className="rb-container">
      <header className="rb-header">
        <div className="rb-logo-row">
          <span className="rb-logo-text">WriteEdge</span>
          <nav className="rb-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="rb-title-row">
          <span className="rb-module">MODULE 2</span>
          <h1 className="rb-title">Reports & Brief</h1>
        </div>
      </header>
      <div className="rb-content-horizontal">
        {LEVELS.map((level, idx) => (
          <div className="rb-level-section" key={level.name}>
            <div className={`rb-level-bar${level.unlocked ? " active" : ""}`}>
              {level.name} {level.unlocked ? null : <FaLock className="rb-lock-icon" />}
            </div>
            <div className="rb-questions">
              {[1, 2, 3, 4].map((qNum) => (
                <div className="rb-qcard" key={`L${idx + 1}Q${qNum}`}>
                  <div className="rb-q">Q{qNum}</div>
                  <button
                    className={`rb-btn${level.unlocked && qNum === 1 && idx === 0 ? " rb-unlocked" : ""}`}
                    disabled={!(level.unlocked && qNum === 1 && idx === 0)}
                    onClick={() => {
                      if (level.unlocked && qNum === 1 && idx === 0) navigate("/rbq1");
                    }}
                  >
                    {level.unlocked && qNum === 1 && idx === 0 ? <FaArrowRight /> : <FaLock />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsBrief;
