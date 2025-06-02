import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8 rounded-t-lg shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-around gap-y-8 sm:gap-x-8 md:gap-x-12 lg:gap-x-16 ">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:w-full md:w-auto flex-1 min-w-[200px]">
            <h2 className="text-2xl font-extrabold mb-4 text-purple-400">
              Ecommerce
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted destination for quality products at unbeatable
              prices. We're committed to delivering the best online shopping
              experience.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:w-full md:w-auto flex-1 min-w-[150px]">
            <h3 className="font-semibold text-lg mb-3 text-purple-300">Shop</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <a
                  href="/products"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/offers"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  Deals & Offers
                </a>
              </li>
              <li>
                <a
                  href="/new-arrivals"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  New Arrivals
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:w-full md:w-auto flex-1 min-w-[150px]">
            <h3 className="font-semibold text-lg mb-3 text-purple-300">
              Support
            </h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <a
                  href="/faq"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="/shipping"
                  className="hover:text-purple-200 transition-colors duration-300"
                >
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:w-full md:w-auto flex-1 min-w-[150px]">
            <h3 className="font-semibold text-lg mb-3 text-purple-300">
              Follow Us
            </h3>
            <div className="flex space-x-5 text-gray-400">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-200 transition-colors duration-300 transform hover:scale-110"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-200 transition-colors duration-300 transform hover:scale-110"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-200 transition-colors duration-300 transform hover:scale-110"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
