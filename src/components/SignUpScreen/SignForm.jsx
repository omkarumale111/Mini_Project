import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaLinkedin, FaGithub, FaFacebook } from "react-icons/fa";
import GoogleIcon from "./GoogleIcon";

const SignForm = () => {
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    // Form submission logic here if needed
    // Then redirect to login
    navigate("/login");
  };

  return (
    <div className="login-form-section">
      <h1 className="welcome-title">Welcome!</h1>
      <p className="resume-learning">Please enter your details</p>

      <form className="login-form" onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="fullname">Full Name</label>
          <input
            type="text"
            id="fullname"
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>

      <div className="login-divider">
        <span className="divider-line"></span>
        <span className="divider-text">or</span>
        <span className="divider-line"></span>
      </div>

      <button className="secondary-button">
        <GoogleIcon size={18} /> Continue with Google
      </button>

      <div className="social-buttons">
        <button className="social-button linkedin">
          <FaLinkedin className="social-icon" /> LinkedIn
        </button>
        <button className="social-button github">
          <FaGithub className="social-icon" /> GitHub
        </button>
        <button className="social-button facebook">
          <FaFacebook className="social-icon" /> Facebook
        </button>
      </div>

      <p className="login-redirect">
        Already have an account?{" "}
        <a 
          href="/login" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }} 
          className="login-link"
        >
          Log In
        </a>
      </p>
    </div>
  );
};

export default SignForm;