import React from "react";
import {
  FaSignOutAlt,
  FaBoxOpen,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineSupportAgent } from "react-icons/md";
import { LuMessageSquareMore } from "react-icons/lu";
import { type Section } from "../../pages/SellerDashboard";
import { type Seller } from "../../types/sellertypes";
import { useSellerSignOut } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SellerSideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeKey: Section;
  onSelect: (key: Section) => void;
  seller: Seller;
}

const SellerSideOverlay: React.FC<SellerSideOverlayProps> = ({
  isOpen,
  onClose,
  activeKey,
  onSelect,
  seller,
}) => {
  const navigate = useNavigate();
  const { mutateAsync: signOut, isPending } = useSellerSignOut();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.log(err);
    } finally {
      navigate("/");
    }
  };

  const handleMenuItemSelect = (key: Section) => {
    onSelect(key);
    onClose(); // close overlay after navigation
  };

  const isActive = (key: Section) => key === activeKey;

  const navItemClass = (key: Section) =>
    `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer
      ${
        isActive(key)
          ? "bg-indigo-600 text-white shadow-md font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
      }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 md:hidden transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="text-lg font-bold text-indigo-800 truncate">
            {seller?.username || "Seller"}
          </div>
        </div>

        <div className="overflow-auto flex-1 px-3 py-4 space-y-2">
          <button
            onClick={() => handleMenuItemSelect("dashboard")}
            className={navItemClass("dashboard")}
          >
            <BiSolidDashboard className="text-xl" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleMenuItemSelect("viewproducts")}
            className={navItemClass("viewproducts")}
          >
            <FaBoxOpen className="text-xl" />
            <span>Products</span>
          </button>

          <button
            onClick={() => handleMenuItemSelect("Orders")}
            className={navItemClass("Orders")}
          >
            <FaClipboardList className="text-xl" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => handleMenuItemSelect("support")}
            className={navItemClass("support")}
          >
            <MdOutlineSupportAgent className="text-xl" />
            <span>Support</span>
          </button>

          <button
            onClick={() => handleMenuItemSelect("message")}
            className={navItemClass("message")}
          >
            <LuMessageSquareMore className="text-xl" />
            <span>Message</span>
          </button>

          <button
            onClick={() => handleMenuItemSelect("setting")}
            className={navItemClass("setting")}
          >
            <FaCog className="text-xl" />
            <span>Setting</span>
          </button>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSideOverlay;
