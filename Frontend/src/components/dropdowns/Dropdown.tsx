import { useState, useRef, useEffect } from "react";
import { FaUser, FaShoppingCart, FaBox, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
interface userprops {
  username: string;
}
const UserDropdown: React.FC<userprops> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
      >
        {username}
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7l3-3 3 3m0 6l-3 3-3-3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
          <div className="py-1 text-sm text-gray-700">
            <Link
              to={"/userprofile"}
              className="w-full px-4 py-2 hover:bg-purple-50 flex items-center gap-2"
            >
              <FaUser /> Profile
            </Link>
            <Link
              to={"/cart"}
              className="w-full px-4 py-2 hover:bg-purple-50 flex items-center gap-2"
            >
              <FaShoppingCart /> Cart
            </Link>
            <Link
              to={"/order"}
              className="w-full px-4 py-2 hover:bg-purple-50 flex items-center gap-2"
            >
              <FaBox /> Orders
            </Link>
            <Link
              to={"/"}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <FaSignOutAlt /> Log Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
