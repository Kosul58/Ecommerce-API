import AdminSignUp from "./forms/react-hook/AdminSignUp";
import SellerSignUp from "./forms/react-hook/SellerSignUp";
import UserSignUp from "./forms/react-hook/UserSignUp";
import AdminSignIn from "./forms/react-hook/AdminSignIn";
import SellerSignIn from "./forms/react-hook/SellerSignIn";
import UserSignIn from "./forms/react-hook/UserSignIn";

interface SignInProps {
  setSellerSigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBar: React.FC<SignInProps> = ({ setSellerSigned }) => {
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
          <AdminSignIn />
          <SellerSignIn setSellerSigned={setSellerSigned} />
          <UserSignIn />
        </div>
      </nav>
    </>
  );
};

export default NavBar;
