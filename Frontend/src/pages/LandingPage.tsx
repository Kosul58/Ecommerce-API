import React from "react";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/Navbar";
import HeroPage from "../components/HeroPage";

const LandingPage = () => {
  return (
    <>
      <header className="fixed top-0 z-50 w-full">
        <NavBar />
      </header>
      <HeroPage />
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default LandingPage;
