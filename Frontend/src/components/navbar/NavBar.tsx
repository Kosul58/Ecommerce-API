import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMenu, LuX, LuShoppingCart } from "react-icons/lu";
import { FaUser, FaBox, FaSignOutAlt } from "react-icons/fa";
import { PiSignInLight } from "react-icons/pi";
import { useUserData } from "../../hooks/useAuth";
import UserDropdown from "../dropdowns/Dropdown";
import ProductSearch from "../search/ProductSearch";

const NavBar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: user } = useUserData();

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

  const handleSearch = (value: string) => {
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };
  return (
    <nav
      className="bg-gradient-to-r from-gray-800 to-gray-900 text-white h-[12vh] min-h-[90px] z-50 max-h-[95px]
     "
    >
      <div className="hidden md:flex w-full justify-end items-center px-4 py-1 bg-gray-800/80 text-sm">
        <p
          className="cursor-pointer hover:underline transition duration-150 text-gray-300 hover:text-white  flex justify-center items-center gap-2"
          onClick={sellerSignIn}
        >
          Seller Portal
        </p>
      </div>

      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-1">
        <div className="flex justify-between items-center h-14">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="max-lg:text-lg lg:text-2xl font-bold text-purple-400 hover:text-purple-300  transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ecommerce
            </Link>
          </div>

          <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
            <Link
              to="/"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white text-sm lg:text-base font-medium cursor-pointer hover:underline transition duration-150 "
            >
              Contact
            </Link>

            <ProductSearch onSearch={(data) => handleSearch(data)} />
          </div>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <div className="flex items-center gap-2 text-white font-semibold">
                <UserDropdown username={user.username} />
              </div>
            ) : (
              <button
                onClick={userSignIn}
                className="flex items-center px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all duration-300 transform hover:scale-105 shadow-md text-sm cursor-pointer gap-1"
              >
                <PiSignInLight />
                Sign In
              </button>
            )}
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
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Products
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
            >
              Contact
            </Link>
            <Link
              to="/seller"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:underline transition-colors duration-300"
            >
              Seller Portal
            </Link>

            <ProductSearch
              onSearch={(data) => {
                handleSearch(data);
                setIsMobileMenuOpen(false);
              }}
            />

            <div className="pt-4 pb-3 border-t border-gray-700 space-y-4">
              {user ? (
                <div className="w-full px-4 py-2 text-center text-white font-semibold">
                  <span className="text-purple-400">{user.username}</span>
                </div>
              ) : (
                <button
                  onClick={userSignIn}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all duration-300 shadow-md max-lg:text:lg max-lg:px-2 max-lg:py-1 cursor-pointer"
                >
                  User Sign In
                </button>
              )}
              <Link
                to={`/cart}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
              >
                <LuShoppingCart className="mr-2" size={20} /> Cart
              </Link>
              <Link
                to={`/order}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
              >
                <FaBox className="mr-2" size={20} /> Order
              </Link>
              <Link
                to={`/userprofile}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
              >
                <FaUser className="mr-2" size={20} /> User Profile
              </Link>
              <Link
                to={`/userprofile}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
              >
                <FaSignOutAlt className="mr-2" size={20} /> Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
