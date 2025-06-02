import React, { useState } from "react";
import UserSignIn from "../components/forms/react-hook/UserSignIn";
import UserSignUp from "../components/forms/react-hook/UserSignUp";

const User = () => {
  const [isSignIn, setIsSignIn] = useState(true); // default is Sign In

  const toggleForm = () => {
    setIsSignIn((prev) => !prev);
  };

  return (
    <div>
      {isSignIn ? (
        <UserSignIn toggleToSignUp={toggleForm} />
      ) : (
        <UserSignUp toggleToSignIn={toggleForm} />
      )}
    </div>
  );
};

export default User;
