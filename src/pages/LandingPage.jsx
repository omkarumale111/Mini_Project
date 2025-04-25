import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/Logo.png";
import heroImage from "../assets/Pre_sign1.jpg";
import icon1 from "../assets/1.png";
import icon2 from "../assets/2.png";
import icon3 from "../assets/3.png";
import preSign2 from "../assets/Pre_sign2.png";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-root">
      {/* Header/Nav */}
      <header className="landing-header">
        <div className="landing-logo-group">
          <img src={logo} alt="WriteEdge Logo" className="landing-logo" />
          <span className="landing-logo-text">WriteEdge</span>
        </div>
        <nav className="landing-nav">
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Courses</a>
          <a href="#" className="nav-link">Modules</a>
          <a className="nav-link login-link" onClick={() => navigate('/login')}>Log in</a>
        </nav>
      </header>

      {/* Hero/Main Section */}
      <main className="landing-main">
        <div className="landing-hero-row">
          <div className="landing-hero-img-wrap">
            <img src={heroImage} alt="Content Clarity Credibility" className="landing-hero-img" />
            <div className="landing-hero-text-overlay no-bg">
              <h2 className="landing-hero-overlay-title no-bg">Content.<br />Clarity.<br />Credibility.</h2>
            </div>
          </div>
        </div>
        <div className="landing-content-row">
          <div className="landing-desc-row">
            <div className="landing-text-and-icons">
              <div className="landing-desc-left">
                <div className="landing-desc-text">
                  WriteEdge empowers students and professionals to master real-world, corporate writing.<br />
                  With structured modules, AI-driven feedback, and prompt-based simulations, learning is practical and effective.
                </div>
                <button className="landing-register-btn" onClick={() => navigate('/signup')}>REGISTER NOW</button>
              </div>
              <div className="landing-icons-row">
                <img src={icon1} alt="Quick Access 1" className="landing-icon" />
                <img src={icon2} alt="Quick Access 2" className="landing-icon" />
                <img src={icon3} alt="Quick Access 3" className="landing-icon" />
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Scroll-down Section */}
      <div className="landing-scroll-section">
        <img src={preSign2} alt="WriteEdge Context" className="landing-scroll-img" />
        <div className="landing-scroll-content">
          <img src={logo} alt="WriteEdge Logo" className="landing-scroll-logo" />
          <div className="landing-scroll-title">WriteEdge</div>
          <div className="landing-scroll-subtitle">Sharpen Your Writing ,Gain the Edge</div>
          <div className="landing-scroll-text">
            From basics to brilliance–learn to write like a pro.
          </div>
          <button className="landing-scroll-btn" onClick={() => navigate('/signup')}>Start Learning</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
