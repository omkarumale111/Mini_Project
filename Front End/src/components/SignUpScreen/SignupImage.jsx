import React from "react";
import loginImage from "../../assets/download.jpg"; // Make sure this path is correct and the image exists

const LoginImage = () => {
  return (
    <div className="login-image-section">
      <img src={loginImage} alt="Login visual" className="login-image" />
    </div>
  );
};

export default LoginImage;