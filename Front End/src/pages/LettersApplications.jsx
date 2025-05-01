import React from "react";
import "./LettersApplications.css";
import { FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  { name: "Level 1", unlocked: true },
  { name: "Level 2", unlocked: false },
  { name: "Level 3", unlocked: false },
  { name: "Level 4", unlocked: false }
];

const LettersApplications = () => {
  const navigate = useNavigate();
  return (
    <div className="la-container">
      <header className="la-header">
        <div className="la-logo-row">
          <span className="la-logo-text">WriteEdge</span>
          <nav className="la-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="la-title-row">
          <span className="la-module">MODULE 4</span>
          <h1 className="la-title">Letters & Applications</h1>
        </div>
      </header>
      <div className="la-content-horizontal">
        {LEVELS.map((level, idx) => (
          <div className="la-level-section" key={level.name}>
            <div className={`la-level-bar${level.unlocked ? " active" : ""}`}>
              {level.name} {level.unlocked ? null : <FaLock className="la-lock-icon" />}
            </div>
            <div className="la-questions">
              {[1, 2, 3, 4].map((qNum) => (
                <div className="la-qcard" key={`L${idx + 1}Q${qNum}`}>
                  <div className="la-q">Q{qNum}</div>
                  <button
                    className={`la-btn${level.unlocked && qNum === 1 && idx === 0 ? " la-unlocked" : ""}`}
                    disabled={!(level.unlocked && qNum === 1 && idx === 0)}
                    onClick={() => {
                      if (level.unlocked && qNum === 1 && idx === 0) navigate("/laq1");
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

export default LettersApplications;
