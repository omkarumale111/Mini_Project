import React from "react";
import SignupForm from "./SignupForm";
import "./SignupForm.css";
import signupImage from "../../assets/download.jpg";

const SignupScreen = () => {
  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form-container">
          <SignupForm />
        </div>
        <div className="signup-image-section">
          <img src={signupImage} alt="Signup visual" className="signup-image" />
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;
