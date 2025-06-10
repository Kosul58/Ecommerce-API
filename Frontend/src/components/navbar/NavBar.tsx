import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMenu, LuX, LuShoppingCart } from "react-icons/lu";
import { FaUser, FaBox, FaSignOutAlt } from "react-icons/fa";
import { PiSignInLight } from "react-icons/pi";
import { useUserData, useUserSignOut } from "../../hooks/useAuth";
import UserDropdown from "../dropdowns/UserDropdown";
import ProductSearch from "../search/ProductSearch";
import Button from "../buttons/Buttons";

const NavBar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutateAsync: signOut, isPending } = useUserSignOut();

  const handleSignOut = async () => {
    try {
      await signOut();
      alert("User Signed Out successfully");
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };
  const { data: user } = useUserData();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const sellerSignIn = () => {
    handleNavigate("/seller");
  };

  const adminSignIn = () => {
    handleNavigate("/admin");
  };
  const userSignIn = () => {
    handleNavigate("/user");
  };

  const handleSearch = (value: string) => {
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };
  return (
    <nav
      className="bg-gradient-to-r from-gray-800 to-gray-900 text-white h-[12vh] min-h-[90px]  z-50 max-h-[95px] max-sm:min-h-[60px] max-sm:max-h-[65px]
     "
    >
      <div className="hidden md:flex w-full justify-end items-center px-4 py-1 bg-gray-800/80 text-sm gap-4">
        <p
          className="cursor-pointer hover:underline transition duration-150 text-gray-300 hover:text-white  flex justify-center items-center gap-2"
          onClick={adminSignIn}
        >
          Admin Portal
        </p>
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
              className="max-lg:text-lg lg:text-2xl font-bold text-white   transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hamro Bajar
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
              <Button onClick={userSignIn} variant="primary" size="medium">
                <PiSignInLight />
                Sign In
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              onClick={toggleMobileMenu}
              variant="outline"
              className="bg-none"
            >
              {isMobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 pb-4 min-h-screen overflow-auto">
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
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:underline transition-colors duration-300"
            >
              Admin Portal
            </Link>

            <ProductSearch
              onSearch={(data) => {
                handleSearch(data);
                setIsMobileMenuOpen(false);
              }}
            />

            <div className="pt-4 pb-3 border-t border-gray-700 space-y-4">
              {!user ? (
                <div className="w-full flex justify-center items-center">
                  <Button
                    onClick={userSignIn}
                    variant="primary"
                    size="medium"
                    className="w-full"
                  >
                    User Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-full px-4 py-2 text-center text-white font-semibold">
                    <span className="text-purple-400">{user.username}</span>
                  </div>
                  <div
                    onClick={() => handleNavigate("/cart")}
                    className="w-full flex items-center justify-center px-4 py-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
                  >
                    <LuShoppingCart className="mr-2" size={20} /> Cart
                  </div>
                  <div
                    onClick={() => handleNavigate("/order")}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
                  >
                    <FaBox className="mr-2" size={20} /> Order
                  </div>
                  <div
                    onClick={() => handleNavigate("/userprofile")}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300"
                  >
                    <FaUser className="mr-2" size={20} /> User Profile
                  </div>
                  <div
                    onClick={() => handleSignOut()}
                    className={`w-full flex items-center justify-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors duration-300 ${
                      isPending ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <FaSignOutAlt className="mr-2" size={20} /> Sign Out
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
