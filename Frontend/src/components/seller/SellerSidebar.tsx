import React, { useState, useCallback } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaBoxOpen,
  FaClipboardList,
  FaCog,
  FaChevronCircleLeft,
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineSupportAgent } from "react-icons/md";
import { LuMessageSquareMore } from "react-icons/lu";
import { type Section } from "../../pages/SellerDashboard";
import { type Seller } from "../../types/sellertypes";

type SidebarProps = {
  activeKey: Section;
  onSelect: (key: Section) => void;
  onLogout: () => void;
  seller: Seller;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  onSelect,
  onLogout,
  seller,
}) => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [openCollapsedMenu, setOpenCollapsedMenu] = useState<string | null>(
    null
  );
  const [popoutMenuTop, setPopoutMenuTop] = useState<number | null>(null);

  const toggleDropdown = useCallback(
    (key: string, event?: React.MouseEvent<HTMLButtonElement>) => {
      if (collapsed) {
        if (openCollapsedMenu === key) {
          setOpenCollapsedMenu(null);
          setPopoutMenuTop(null);
        } else {
          setOpenCollapsedMenu(key);
          if (event && event.currentTarget) {
            setPopoutMenuTop(event.currentTarget.getBoundingClientRect().top);
          }
        }
      } else {
        setOpenDropdowns((prev) => ({
          ...prev,
          [key]: !prev[key],
        }));
        setOpenCollapsedMenu(null);
        setPopoutMenuTop(null);
      }
    },
    [collapsed, openCollapsedMenu]
  );

  const handleMenuItemSelect = useCallback(
    (key: Section) => {
      onSelect(key);
      setOpenCollapsedMenu(null);
      setPopoutMenuTop(null);
    },
    [onSelect]
  );

  const isActive = (key: Section) => key === activeKey;

  const navItemClass = (key: Section) =>
    `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer
      ${
        isActive(key)
          ? "bg-indigo-600 text-white shadow-md font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
      }
      ${collapsed ? "justify-center" : ""}`;

  const dropdownToggleClass = (key: string) =>
    `w-full flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer
      ${
        isActive(key as Section)
          ? "bg-indigo-600 text-white shadow-md font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
      }
      ${collapsed ? "justify-center" : "justify-between"}`;

  const subItemClass = (key: Section) =>
    `w-full text-left pl-10 pr-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer
      ${
        isActive(key)
          ? "bg-indigo-100 text-indigo-800 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-indigo-700"
      }`;

  const collapsedMenuClass =
    "absolute left-full ml-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 origin-left animate-fade-in-left";

  return (
    <aside
      className={`relative h-screen bg-white border-r border-gray-200 shadow-xl flex flex-col justify-start
        transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}
      onClick={() => {
        if (openCollapsedMenu !== null && !collapsed) {
          setOpenCollapsedMenu(null);
          setPopoutMenuTop(null);
        }
      }}
    >
      <div
        className={`p-4 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } border-b border-gray-200`}
      >
        {!collapsed && (
          <div className="text-lg font-bold text-indigo-800 truncate">
            {seller?.username || "Seller"}
          </div>
        )}
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setOpenCollapsedMenu(null);
            setPopoutMenuTop(null);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 cursor-pointer"
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

          <div className="relative">
            <button
              onClick={(e) => toggleDropdown("products", e)}
              className={dropdownToggleClass("products")}
              title={collapsed ? "Products" : ""}
            >
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center w-full" : "gap-3"
                }`}
              >
                <FaBoxOpen className="text-xl" />
                {!collapsed && <span>Products</span>}
              </div>
              {!collapsed &&
                (openDropdowns.products ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                ))}
              {collapsed &&
                (openCollapsedMenu === "products" ? (
                  <FaChevronUp className="text-xs absolute right-1" />
                ) : (
                  <FaChevronDown className="text-xs absolute right-1" />
                ))}
            </button>
            {!collapsed && openDropdowns.products && (
              <div className={`mt-1 space-y-1`}>
                <button
                  onClick={() => handleMenuItemSelect("addProduct")}
                  className={subItemClass("addProduct")}
                >
                  Add Product
                </button>
                <button
                  onClick={() => handleMenuItemSelect("viewproducts")}
                  className={subItemClass("viewproducts")}
                >
                  View Products
                </button>
                <button
                  onClick={() => handleMenuItemSelect("editProduct")}
                  className={subItemClass("editProduct")}
                >
                  Edit Product
                </button>
                <button
                  onClick={() => handleMenuItemSelect("manageProduct")}
                  className={subItemClass("manageProduct")}
                >
                  Manage Products
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => toggleDropdown("orders", e)}
              className={dropdownToggleClass("orders")}
              title={collapsed ? "Orders" : ""}
            >
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center w-full" : "gap-3"
                }`}
              >
                <FaClipboardList className="text-xl" />
                {!collapsed && <span>Orders</span>}
              </div>
              {!collapsed &&
                (openDropdowns.orders ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                ))}
              {collapsed &&
                (openCollapsedMenu === "orders" ? (
                  <FaChevronUp className="text-xs absolute right-1" />
                ) : (
                  <FaChevronDown className="text-xs absolute right-1" />
                ))}
            </button>
            {!collapsed && openDropdowns.orders && (
              <div className={`mt-1 space-y-1`}>
                <button
                  onClick={() => handleMenuItemSelect("Orders")}
                  className={subItemClass("Orders")}
                >
                  View Orders
                </button>
                <button
                  onClick={() => handleMenuItemSelect("manageOrders")}
                  className={subItemClass("manageOrders")}
                >
                  Manage Orders
                </button>
                <button
                  onClick={() => handleMenuItemSelect("trackOrder")}
                  className={subItemClass("trackOrder")}
                >
                  Track Order
                </button>
              </div>
            )}
          </div>

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

      {collapsed &&
        openCollapsedMenu === "products" &&
        popoutMenuTop !== null && (
          <div className={collapsedMenuClass} style={{ top: popoutMenuTop }}>
            <button
              onClick={() => handleMenuItemSelect("addProduct")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              Add Product
            </button>
            <button
              onClick={() => handleMenuItemSelect("viewproducts")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              View Products
            </button>
            <button
              onClick={() => handleMenuItemSelect("editProduct")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              Edit Product
            </button>
            <button
              onClick={() => handleMenuItemSelect("manageProduct")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              Manage Products
            </button>
          </div>
        )}

      {collapsed &&
        openCollapsedMenu === "orders" &&
        popoutMenuTop !== null && (
          <div className={collapsedMenuClass} style={{ top: popoutMenuTop }}>
            <button
              onClick={() => handleMenuItemSelect("Orders")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              View Orders
            </button>
            <button
              onClick={() => handleMenuItemSelect("manageOrders")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              Manage Orders
            </button>
            <button
              onClick={() => handleMenuItemSelect("trackOrder")}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md cursor-pointer"
            >
              Track Order
            </button>
          </div>
        )}

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer
            ${collapsed ? "justify-center" : "justify-start"}`}
        >
          <FaSignOutAlt className="text-xl" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
