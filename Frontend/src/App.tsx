import AdminSignUp from "./components/AdminSignUp";
import SellerSignUp from "./components/SellerSignUp";
import UserSignUp from "./components/UserSignUp";

function App() {
  return (
    <>
      <section className="w-full h-screen bg-black flex justify-evenly items-center">
        <UserSignUp />
        <SellerSignUp />
        <AdminSignUp />
      </section>
    </>
  );
}

export default App;
