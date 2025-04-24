import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("Signup form submitted");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log('Attempting to sign up with:', { email });
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        // Redirect to login page after successful signup
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="signup-form-section">
      <h1 className="welcome-title">Create Account</h1>
      <p className="start-learning">Start your learning journey</p>

      {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

      <form className="signup-form" onSubmit={handleSignup} autoComplete="on">
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

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            className="form-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>

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

export default SignupForm;
