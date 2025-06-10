import React, { useState, useCallback } from "react";
import {
  FaSignOutAlt,
  FaBoxOpen,
  FaClipboardList,
  FaCog,
  FaChevronCircleLeft,
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineSupportAgent } from "react-icons/md";
import { LuMessageSquareMore } from "react-icons/lu";
import { type Section } from "../../pages/AdminDashboard";
import { useAdminSignOut, type Admin } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  activeKey: Section;
  onSelect: (key: Section) => void;
  admin: Admin;
};

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onSelect, admin }) => {
  const navigate = useNavigate();
  const { mutateAsync: signOut, isPending } = useAdminSignOut();

  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      alert("Admin signout successfull");
    } catch (err) {
      console.log(err);
    } finally {
      navigate("/");
    }
  };

  const handleMenuItemSelect = useCallback(
    (key: Section) => {
      onSelect(key);
    },
    [onSelect]
  );

  const isActive = (key: Section) => key === activeKey;

  const navItemClass = (key: Section) =>
    `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer
      ${
        isActive(key)
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold hover:from-indigo-600 hover:to-purple-700 focus:ring-purple-500"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
      }
      ${collapsed ? "justify-center" : ""}`;

  return (
    <aside
      className={`relative h-screen bg-white border-r border-gray-200 shadow-xl flex flex-col justify-start
        transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }  max-[500px]:hidden `}
    >
      <div
        className={`p-4 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } border-b border-gray-200`}
      >
        {!collapsed && (
          <div className="text-lg font-bold text-indigo-800 truncate">
            {admin?.username || "Seller"}
          </div>
        )}
        <button
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Toggle sidebar"
        >
          <FaChevronCircleLeft
            className={`text-xl transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
            title="Collapse"
          />
        </button>
      </div>
      <div className="overflow-auto">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          <button
            onClick={() => handleMenuItemSelect("dashboard")}
            className={navItemClass("dashboard")}
            title={collapsed ? "Dashboard" : ""}
          >
            <BiSolidDashboard className="text-xl" />
            {!collapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => handleMenuItemSelect("products")}
            className={navItemClass("products")}
            title={collapsed ? "Products" : ""}
          >
            <FaBoxOpen className="text-xl" />
            {!collapsed && <span>Products</span>}
          </button>

          <button
            onClick={() => handleMenuItemSelect("Orders")}
            className={navItemClass("Orders")}
            title={collapsed ? "Orders" : ""}
          >
            <FaClipboardList className="text-xl" />
            {!collapsed && <span>Orders</span>}
          </button>

          <button
            onClick={() => handleMenuItemSelect("support")}
            className={navItemClass("support")}
            title={collapsed ? "Support" : ""}
          >
            <MdOutlineSupportAgent className="text-xl" />
            {!collapsed && <span>Support</span>}
          </button>

          <button
            onClick={() => handleMenuItemSelect("message")}
            className={navItemClass("message")}
            title={collapsed ? "Message" : ""}
          >
            <LuMessageSquareMore className="text-xl" />
            {!collapsed && <span>Message</span>}
          </button>

          <button
            onClick={() => handleMenuItemSelect("setting")}
            className={navItemClass("setting")}
            title={collapsed ? "Setting" : ""}
          >
            <FaCog className="text-xl" />
            {!collapsed && <span>Setting</span>}
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-100 font-semibold
          
            transition-all duration-200 cursor-pointer
            ${collapsed ? "justify-center" : "justify-start"}`}
        >
          <FaSignOutAlt className="text-xl" />
          {!collapsed && (
            <span>{isPending ? "Signing out..." : "Sign Out"}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
