import AdminSignUp from "./AdminSignUp";
import SellerSignUp from "./seller/SellerSignUp";
import UserSignUp from "./UserSignUp";
import AdminSignIn from "./AdminSignIn";
import SellerSignIn from "./seller/SellerSignIn";
import UserSignIn from "./UserSignIn";
import { useState } from "react";

interface SignInProps {
  setSellerSigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBar: React.FC<SignInProps> = ({ setSellerSigned }) => {
  const [formState4, setFormState4] = useState(false);
  const [formState5, setFormState5] = useState(false);
  const [formState6, setFormState6] = useState(false);

  return (
    <>
      <nav className="w-[80%] h-[80px] bg-slate-500 flex justify-evenly gap-2 p-2 rounded-lg">
        <h1 className="w-[50%] flex justify-center items-center text-2xl text-white sm:text-lg">
          Sign Up components check
        </h1>
        <div className="flex justify-end gap-2">
          <AdminSignUp />
          <SellerSignUp />
          <UserSignUp />
        </div>
      </nav>
      <nav className="w-[80%] h-[80px] bg-slate-500 flex justify-evenly gap-2 p-2 rounded-lg ">
        <h1 className="w-[50%] flex justify-center items-center text-2xl text-white sm:text-lg">
          Sign In components check
        </h1>
        <div className="flex justify-end gap-2">
          <AdminSignIn setFormState={setFormState4} formState={formState4} />
          <SellerSignIn
            setFormState={setFormState5}
            setSellerSigned={setSellerSigned}
            formState={formState5}
          />
          <UserSignIn setFormState={setFormState6} formState={formState6} />
        </div>
      </nav>
    </>
  );
};

export default NavBar;
