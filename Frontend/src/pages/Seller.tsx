import React, { useState } from "react";
import SellerSignIn from "../components/forms/react-hook/SellerSignIn";
import SellerSignUp from "../components/forms/react-hook/SellerSignUp";

const Seller = () => {
  const [isSignIn, setIsSignIn] = useState(true); // default is Sign In

  const toggleForm = () => {
    setIsSignIn((prev) => !prev);
  };

  return (
    <div>
      {isSignIn ? (
        <SellerSignIn toggleToSignUp={toggleForm} />
      ) : (
        <SellerSignUp toggleToSignIn={toggleForm} />
      )}
    </div>
  );
};

export default Seller;
