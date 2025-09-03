import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/Logo.png';

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

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className="signup-form-section" style={{ maxWidth: '450px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div className="signup-logo-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={Logo} alt="WriteEdge Logo" style={{ height: '50px', width: 'auto' }} />
          <span style={{ fontSize: '1.8rem', fontWeight: 600, color: '#ffd700' }}>WriteEdge</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333', margin: 0 }}>Create Account</h1>
        <p style={{ color: '#666', margin: 0 }}>Start your learning journey</p>
      </div>

      {/* Role Selection Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        margin: '1.5rem auto',
        padding: '0.25rem',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        maxWidth: '280px'
      }}>
        <button
          type="button"
          onClick={() => setRole('student')}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: role === 'student' ? '#4CAF50' : 'transparent',
            color: role === 'student' ? 'white' : '#666',
            fontWeight: role === 'student' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            textAlign: 'center',
            fontSize: '0.9rem'
          }}
        >
          I am a Student
        </button>
        <button
          type="button"
          onClick={() => setRole('admin')}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: role === 'admin' ? '#2196F3' : 'transparent',
            color: role === 'admin' ? 'white' : '#666',
            fontWeight: role === 'admin' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            textAlign: 'center',
            fontSize: '0.9rem'
          }}
        >
          I am a Teacher
        </button>
      </div>

      {error && <p className="error-message" style={{ color: '#e74c3c', margin: '0 0 1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

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

        <button type="submit" className="signup-button" style={{ marginTop: '1rem' }}>
          Sign Up
        </button>
      </form>

      <div className="social-login-container">
        <div className="social-divider">
          <span>OR</span>
        </div>

        <button 
          className="social-button google-button"
          onClick={() => handleSocialLogin('google')}
        >
          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cGF0aCBmaWxsPSIjRkZDMTA3IiBkPSJNNDMuNjExLDIwLjA4M0g0MlYyMEgyNHY4aDExLjMwM2MtMS42NDksNC42NTctNi4wOCw4LTExLjMwMyw4Yy02LjYyNywwLTEyLTUuMzczLTEyLTEyYzAtNi42MjcsNS4zNzMtMTIsMTItMTJjMy4wNTksMCw1Ljg0MiwxLjE1NCw3Ljk2MSwzLjAzOWw1LjY1Ny01LjY1N0MzNC4wNDYsNi4wNTMsMjkuMjY4LDQsMjQsNEMxMi45NTUsNCw0LDEyLjk1NSw0LDI0YzAsMTEuMDQ1LDguOTU1LDIwLDIwLDIwYzExLjA0NSwwLDIwLTguOTU1LDIwLTIwQzQ0LDIyLjY1OSw0My44NjIsMjEuMzUsNDMuNjExLDIwLjA4M3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjRkYzRDAwIiBkPSJNNi4zMDYsMTQuNjkxbDYuNTcxLDQuODE5QzE0LjY1NSwxNS4xMDgsMTguOTYxLDEyLDI0LDEyYzMuMDU5LDAsNS44NDIsMS4xNTQsNy45NjEsMy4wMzlsNS42NTctNS42NTdDMzQuMDQ2LDYuMDUzLDI5LjI2OCw0LDI0LDRDMTYuMzE4LDQsOS42NTYsOC4zMzcsNi4zMDYsMTQuNjkxeiI+PC9wYXRoPjxwYXRoIGZpbGw9IiM0Q0FGNTAiIGQ9Ik0yNCw0NGM1LjE2NiwwLDkuODYtMS45NzcsMTMuNDA5LTUuMTkybC02LjE5LTUuMjM4QzI5LjIxMSwzNS4wOTEsMjYuNzE1LDM2LDI0LDM2Yy01LjIwMiwwLTkuNjE5LTMuMzE3LTExLjI4My03Ljk0NmwtNi41MjIsNS4wMjVDOS41MDUsMzkuNTU2LDE2LjIyNyw0NCwyNCw0NHoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMTk3NkQyIiBkPSJNNDMuNjExLDIwLjA4M0g0MlYyMEgyNHY4aDExLjMwM2MtMC43OTIsMi4yMzctMi4yMzEsNC4xNjYtNC4wODcsNS41NzFjMC4wMDEtMC4wMDEsMC4wMDItMC4wMDEsMC4wMDMtMC4wMDJsNi4xOSw1LjIzOEMzNi45NzEsMzkuMjA1LDQ0LDM0LDQ0LDI0QzQ0LDIyLjY1OSw0My44NjIsMjEuMzUsNDMuNjExLDIwLjA4M3oiPjwvcGF0aD48L3N2Zz4=" alt="Google" />
          Continue with Google
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

export default SignupForm;
