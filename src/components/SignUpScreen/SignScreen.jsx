import React from "react";
import "./SignScreen.css";
import LoginForm from "./SignForm.jsx";
import LoginImage from "./SignupImage";

const LoginScreen = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <LoginForm />
        </div>
        <LoginImage />
      </div>
    </div>
  );
};

export default LoginScreen;