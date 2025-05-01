import React from "react";
import "./LoginScreen.css";
import LoginForm from "./LoginForm";
import loginImage from "../../assets/download.jpg";

const LoginScreen = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <LoginForm />
        </div>
        <div className="login-image-section">
          <img src={loginImage} alt="Signin visual" className="login-image" />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;