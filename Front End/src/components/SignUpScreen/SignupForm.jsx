import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/Logo.png';
import { storage } from '../../utils/storage';

const SignupForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
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
      const response = await fetch("http://localhost:5001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Signup response data:', data);

      if (response.ok) {
        // Store user data temporarily and redirect to profile setup
        storage.setUser(data.user);
        
        // Redirect to respective detail page based on role
        if (role === 'student') {
          navigate('/student-details');
        } else if (role === 'admin') {
          navigate('/teacher-details');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Failed to connect to server");
    }
  };


  return (
    <div className="signup-form-section" style={{ margin: '1.5rem auto', padding: '1.2rem', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="signup-logo-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <img src={Logo} alt="WriteEdge Logo" style={{ height: '40px', width: 'auto' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffd700' }}>WriteEdge</span>
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#333', margin: 0 }}>Create Account</h1>
        <p style={{ color: '#666', margin: 0, fontSize: '0.85rem' }}>Start your learning journey</p>
      </div>

      {/* Role Selection Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '0.4rem', 
        margin: '1rem auto',
        padding: '0.2rem',
        borderRadius: '6px',
        backgroundColor: '#f8f9fa',
        maxWidth: '260px'
      }}>
        <button
          type="button"
          onClick={() => setRole('student')}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '5px',
            border: 'none',
            background: role === 'student' ? '#4CAF50' : 'transparent',
            color: role === 'student' ? 'white' : '#666',
            fontWeight: role === 'student' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          I am a Student
        </button>
        <button
          type="button"
          onClick={() => setRole('admin')}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '5px',
            border: 'none',
            background: role === 'admin' ? '#2196F3' : 'transparent',
            color: role === 'admin' ? 'white' : '#666',
            fontWeight: role === 'admin' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          I am a Teacher
        </button>
      </div>

      {error && <p className="error-message" style={{ color: '#e74c3c', margin: '0 0 0.8rem', textAlign: 'center', fontSize: '0.85rem' }}>{error}</p>}

      <form className="signup-form" onSubmit={handleSignup} autoComplete="on" style={{ margin: 0 }}>
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
            autoComplete="true"
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
            autoComplete="true"
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
            autoComplete="true"
          />
        </div>

        <button type="submit" className="signup-button" style={{ marginTop: '0.8rem' }}>
          Sign Up
        </button>
      </form>

      <p className="login-redirect" style={{ marginTop: '18px', fontSize: '0.9rem', textAlign: 'center' }}>
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
