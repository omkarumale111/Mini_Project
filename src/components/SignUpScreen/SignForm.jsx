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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="welcome-title" style={{ margin: 0 }}>Welcome!</h1>
        <p className="resume-learning" style={{ margin: 0, color: '#888', fontWeight: 400 }}>Please enter your details</p>
      </div>
      <form className="login-form" onSubmit={handleSignUp} style={{ marginBottom: 8 }}>
        <div className="form-group">
          <label htmlFor="fullname">Full Name</label>
          <input
            type="text"
            id="fullname"
            className="form-input"
            placeholder="Full Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="Password"
          />
        </div>
        <button type="submit" className="login-button" style={{ width: '100%', background: '#222', color: '#fff', borderRadius: 24, padding: '0.8rem 0', fontWeight: 600, fontSize: 18, marginTop: 4 }}>Sign Up</button>
      </form>
      <button className="secondary-button" style={{ width: '100%', borderRadius: 8, background: '#fff', color: '#222', fontWeight: 500, fontSize: 16, padding: '0.7rem 0', marginBottom: 10, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <GoogleIcon size={18} /> Continue with Google
      </button>
      <div className="social-buttons" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <button className="social-button linkedin" style={{ flex: 1, background: '#eef6fa', color: '#0077b5', borderRadius: 8, border: 'none', padding: '0.6rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <FaLinkedin className="social-icon" /> LinkedIn
        </button>
        <button className="social-button github" style={{ flex: 1, background: '#f4f4f4', color: '#222', borderRadius: 8, border: 'none', padding: '0.6rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <FaGithub className="social-icon" /> GitHub
        </button>
        <button className="social-button facebook" style={{ flex: 1, background: '#eaf3fb', color: '#1877f3', borderRadius: 8, border: 'none', padding: '0.6rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <FaFacebook className="social-icon" /> Facebook
        </button>
      </div>
      <p className="login-redirect" style={{ textAlign: 'center', marginTop: 18 }}>
        Already have an account?{' '}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
          className="login-link"
          style={{ color: '#222', fontWeight: 600 }}
        >
          Log In
        </a>
      </p>
    </div>
  );
};

export default SignForm;