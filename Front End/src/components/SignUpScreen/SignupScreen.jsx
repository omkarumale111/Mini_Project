import React from "react";
import SignupForm from "./SignupForm";
import "./SignupForm.css";

const SignupScreen = () => {
  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form-container">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;
