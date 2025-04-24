import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock password reset functionality
    if (email) {
      setMessage("Password reset link has been sent to your email.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-form-container">
          <div className="forgot-password-form-section">
            <h1 className="forgot-title">Forgot Password?</h1>
            <p className="forgot-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {message && <div className="success-message">{message}</div>}

            <form className="forgot-form" onSubmit={handleSubmit}>
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

              <button type="submit" className="reset-button">
                Send Reset Link
              </button>

              <button
                type="button"
                className="back-to-login"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
