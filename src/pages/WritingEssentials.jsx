import React from "react";
import "./WritingEssentials.css";
import { FaLock, FaArrowRight } from "react-icons/fa";

const LEVELS = [
  { name: "Level 1", unlocked: true },
  { name: "Level 2", unlocked: false },
  { name: "Level 3", unlocked: false },
  { name: "Level 4", unlocked: false }
];

const WritingEssentials = () => {
  return (
    <div className="we-container">
      <header className="we-header">
        <span className="we-module">MODULE 1</span>
        <h1 className="we-title">Writing Essentials</h1>
      </header>
      <div className="we-content-horizontal">
        {LEVELS.map((level, idx) => (
          <div className="we-level-section" key={level.name}>
            <div className={`we-level-bar${level.unlocked ? " active" : ""}`}>
              {level.name} {level.unlocked ? null : <FaLock className="we-lock-icon" />}
            </div>
            <div className="we-questions">
              {[1, 2, 3, 4].map((qNum) => (
                <div className="we-qcard" key={`L${idx + 1}Q${qNum}`}>
                  <div className="we-q">Q{qNum}</div>
                  <button
                    className={`we-btn${level.unlocked && qNum === 1 && idx === 0 ? " we-unlocked" : ""}`}
                    disabled={!(level.unlocked && qNum === 1 && idx === 0)}
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

export default WritingEssentials;
