import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/Logo.png';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      console.log('Attempting to sign in...');
      const response = await fetch("http://localhost:5001/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        // Store user data if needed
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect based on user role
        if (data.user.role === 'admin') {
          navigate("/teacher-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Failed to connect to server. Please try again later.");
    }
  };

  return (
    <div className="login-form-section">
      <div className="login-logo-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <img src={Logo} alt="WriteEdge Logo" style={{ height: '50px', width: 'auto' }} />
        <span style={{ fontSize: '1.8rem', fontWeight: 600, color: '#ffd700' }}>WriteEdge</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="welcome-title" style={{ margin: 0 }}>Welcome Back!</h1>
        <p className="resume-learning" style={{ margin: 0, color: '#888', fontWeight: 400 }}>Resume learning</p>
      </div>
      {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
      <form className="login-form" onSubmit={handleLogin} style={{ marginBottom: 8 }}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Email"
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div></div>
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
            className="forgot-password"
            style={{ fontSize: 13, color: '#888' }}
          >
            Forgot Password?
          </a>
        </div>
        <button type="submit" className="login-button" style= {{borderRadius:999, background: '#00050aff', color: '#f5f5f5'}}>Log In</button>
      </form>
      <p className="signup-redirect" style={{ textAlign: 'center', marginTop: 24 }}>
        Don't have an account?{' '}
        <a
          href="/signup"
          onClick={(e) => {
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