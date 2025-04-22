import React from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Skip authentication and redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="login-form-section">
      <h1 className="welcome-title">Welcome Back!</h1>
      <p className="resume-learning">Resume learning</p>

      <form className="login-form" onSubmit={handleLogin}>
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

        <a href="#forgot" className="forgot-password">
          Forgot Password?
        </a>

        <button type="submit" className="login-button">
          Log in
        </button>
      </form>

      <div className="login-divider">
        <span className="divider-line"></span>
        <span className="divider-text">or</span>
        <span className="divider-line"></span>
      </div>

      <button className="secondary-button">
        Log in with Email
      </button>

      <p className="signup-redirect">
        Don't have an account?{" "}
        <a 
          href="/signup" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/signup");
          }} 
          className="signup-link"
        >
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default LoginForm;