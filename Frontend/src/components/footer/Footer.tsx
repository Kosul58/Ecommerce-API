import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-transparent text-white p-5">
      <div className="w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-3">Ecommerce</h2>
          <p className="text-sm text-gray-400">
            Your trusted destination for quality products at unbeatable prices.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Shop</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>
              <a href="/products" className="hover:text-white">
                All Products
              </a>
            </li>
            <li>
              <a href="/categories" className="hover:text-white">
                Categories
              </a>
            </li>
            <li>
              <a href="/offers" className="hover:text-white">
                Deals
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Support</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>
              <a href="/faq" className="hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/returns" className="hover:text-white">
                Returns
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="hover:text-white">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="hover:text-white">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="hover:text-white">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
