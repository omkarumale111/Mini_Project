import React from "react";
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Logo from '../assets/Logo.png';
import './LandingPage.css';

/**
 * LandingPage is the public homepage for WriteEdge.
 * It introduces the platform, its value, and provides navigation to key sections.
 * Features a hero section, summary of features, and call-to-action buttons.
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-fade-1, .scroll-fade-2, .scroll-fade-3, .scroll-fade-cta-1, .scroll-fade-cta-2, .scroll-fade-cta-3, .scroll-fade-cta-4');
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, []);
  return (
    <div className="landing-root">
      {/* Header with logo and navigation links */}
      <header className="landing-header">
        <div className="landing-logo-group">
          <img src={Logo} alt="WriteEdge Logo" className="landing-logo" />
          <span className="landing-logo-text">WriteEdge</span>
        </div>
        <nav className="landing-nav">
          <a href="/" className="nav-link active">HOME</a>
          <a href="/about" className="nav-link">ABOUT</a>
          <button className="login-button" onClick={() => navigate('/login')}>LOG IN</button>
        </nav>
      </header>

      {/* Hero section with main content */}
      <main className="landing-main">
        <div className="hero-content">
          <div className="hero-titles">
            <h2 className="fade-in-1">Content.</h2>
            <h2 className="fade-in-2">Clarity.</h2>
            <h2 className="highlight fade-in-3">Credibility.</h2>
          </div>
          <div className="hero-description fade-in-4">
            WriteEdge empowers students and professionals<br />
            to master real-world, corporate writing with AI-<br />
            driven feedback and structured assessments.
          </div>
          <div className="hero-buttons fade-in-5">
            <button className="register-btn" onClick={() => navigate('/signup')}>Register Now</button>
            <button className="learn-more-btn" onClick={() => navigate('/about')}>Learn More</button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Why Choose WriteEdge?</h2>
        <div className="features-grid">
          <div className="feature-card scroll-fade-1">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3>AI-Powered Feedback</h3>
            <p>Get instant, detailed feedback on grammar, content coherence and style to improve your writing skills.</p>
          </div>
          <div className="feature-card scroll-fade-2">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Performance Analytics</h3>
            <p>Track your progress over time with comprehensive analytics and actionable insights.</p>
          </div>
          <div className="feature-card scroll-fade-3">
            <div className="feature-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Real-World Skills</h3>
            <p>Practice with scenario-based tools designed to improve professional writing in corporate settings.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="scroll-fade-cta-1">Ready to Improve Your Writing Skills?</h2>
        <p className="scroll-fade-cta-2">Join thousands of students and professionals who are enhancing their writing abilities with WriteEdge.</p>
        <div className="cta-buttons">
          <div className="scroll-fade-cta-3">
            <button className="cta-register-btn" onClick={() => navigate('/signup')}>Let's Learn Together</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-group">
              <img src={Logo} alt="WriteEdge Logo" className="footer-logo" />
              <span className="footer-logo-text">WriteEdge</span>
            </div>
            <p className="footer-tagline">Empowering better writing through AI-driven feedback and assessment.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Contact</h4>
              <p>contact@writeedge.com</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Education Ave, Suite 100</p>
              <p>New York, NY 10001</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 WriteEdge. All rights reserved.</p>
          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
