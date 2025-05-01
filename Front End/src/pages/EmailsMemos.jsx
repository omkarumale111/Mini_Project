import React from "react";
import "./EmailsMemos.css";
import { FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  { name: "Level 1", unlocked: true },
  { name: "Level 2", unlocked: false },
  { name: "Level 3", unlocked: false },
  { name: "Level 4", unlocked: false }
];

const EmailsMemos = () => {
  const navigate = useNavigate();
  return (
    <div className="em-container">
      <header className="em-header">
        <div className="em-logo-row">
          <span className="em-logo-text">WriteEdge</span>
          <nav className="em-nav">
            <a href="/modules">MODULES</a>
            <a href="/dashboard">DASHBOARD</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG OUT</a>
          </nav>
        </div>
        <div className="em-title-row">
          <span className="em-module">MODULE 3</span>
          <h1 className="em-title">Emails & Memos</h1>
        </div>
      </header>
      <div className="em-content-horizontal">
        {LEVELS.map((level, idx) => (
          <div className="em-level-section" key={level.name}>
            <div className={`em-level-bar${level.unlocked ? " active" : ""}`}>
              {level.name} {level.unlocked ? null : <FaLock className="em-lock-icon" />}
            </div>
            <div className="em-questions">
              {[1, 2, 3, 4].map((qNum) => (
                <div className="em-qcard" key={`L${idx + 1}Q${qNum}`}>
                  <div className="em-q">Q{qNum}</div>
                  <button
                    className={`em-btn${level.unlocked && qNum === 1 && idx === 0 ? " em-unlocked" : ""}`}
                    disabled={!(level.unlocked && qNum === 1 && idx === 0)}
                    onClick={() => {
                      if (level.unlocked && qNum === 1 && idx === 0) navigate("/emq1");
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

export default EmailsMemos;
