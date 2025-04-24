import React from "react";
import "./SignScreen.css";
import LoginForm from "./SignForm.jsx";
import loginImage from "../../assets/download.jpg";

const LoginScreen = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <LoginForm />
        </div>
        <div className="login-image-section">
          <img src={loginImage} alt="Signup visual" className="login-image" />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;