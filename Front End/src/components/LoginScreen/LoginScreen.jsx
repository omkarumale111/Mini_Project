import React from "react";
import "./LoginScreen.css";
import LoginForm from "./LoginForm";

const LoginScreen = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;