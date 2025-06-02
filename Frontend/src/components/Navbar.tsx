import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuMenu, LuX, LuShoppingCart, LuSearch } from "react-icons/lu";
import { PiSignInLight } from "react-icons/pi";
const NavBar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const sellerSignIn = () => {
    handleNavigate("/seller");
  };

  const userSignIn = () => {
    handleNavigate("/user");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white h-[12vh] min-h-[80px]">
      <div className="hidden md:flex w-full justify-end items-center px-4 py-1 bg-gray-800/80 text-sm">
        <p
          className="cursor-pointer hover:underline transition duration-150 text-gray-300 hover:text-white  flex justify-center items-center gap-2"
          onClick={sellerSignIn}
        >
          Seller Portal
        </p>
      </div>

      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex-shrink-0">
            <a
              href="/"
              className="max-lg:text-lg lg:text-2xl font-bold text-purple-400 hover:text-purple-300  transition-colors duration-300"
            >
              Ecommerce
            </a>
          </div>

          <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
            <a
              href="/"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Home
            </a>
            <a
              href="/products"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Products
            </a>
            <a
              href="/about"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Contact
            </a>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-3 py-1.5 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 w-32 md:w-48 hover:w-48 md:hover:w-64 text-sm"
              />
              <LuSearch
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={userSignIn}
              className="flex items-center px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all duration-300 transform hover:scale-105 shadow-md text-sm cursor-pointer gap-1"
            >
              <PiSignInLight />
              Sign In
            </button>

            <a
              href="/cart"
              className="relative text-gray-300 hover:text-white transition-colors duration-300"
              title="cart"
            >
              <LuShoppingCart className="size-8 max-[830px]:size-6" />
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/"
              onClick={() => handleNavigate("/")}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Home
            </a>
            <a
              href="/products"
              onClick={() => handleNavigate("/products")}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Products
            </a>

            <a
              href="/about"
              onClick={() => handleNavigate("/about")}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              About
            </a>
            <a
              href="/contact"
              onClick={() => handleNavigate("/contact")}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Contact
            </a>
            <a
              href="/seller"
              onClick={() => handleNavigate("/seller")}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:underline transition-colors duration-300"
            >
              Seller Portal
            </a>

            <div className="relative px-3 py-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <LuSearch
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>

            <div className="pt-4 pb-3 border-t border-gray-700 space-y-2">
              <button
                onClick={userSignIn}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all duration-300 shadow-md max-lg:text:lg max-lg:px-2 max-lg:py-1 cursor-pointer"
              >
                User Sign In
              </button>
              <a
                href="/cart"
                onClick={() => handleNavigate("/cart")}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
              >
                <LuShoppingCart className="mr-2" size={20} /> Cart
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
