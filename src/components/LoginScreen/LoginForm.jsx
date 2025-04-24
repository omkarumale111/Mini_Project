import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Modified login logic: any value grants access
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    // If both fields have any value, allow access
    if (email && password) {
      navigate("/dashboard");
    } else {
      setError("Please enter both email and password.");
    }
  };

  return (
    <div className="login-form-section">
      <h1 className="welcome-title">Welcome Back!</h1>
      <p className="resume-learning">Resume learning</p>

      {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <a 
          href="/forgot-password" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/forgot-password");
          }}
          className="forgot-password"
        >
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