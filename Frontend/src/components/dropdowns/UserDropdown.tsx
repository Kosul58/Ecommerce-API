import { useState, useRef, useEffect } from "react";
import { FaUser, FaShoppingCart, FaBox, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { useUserSignOut } from "../../hooks/useAuth";
import Button from "../buttons/Buttons";
interface userprops {
  username: string;
}
const UserDropdown: React.FC<userprops> = ({ username }) => {
  const navigate = useNavigate();
  const { mutateAsync: signOut, isPending } = useUserSignOut();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      alert("Sigout successfull");
    } catch (err) {
      console.log(err);
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button onClick={() => setIsOpen(!isOpen)}>
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
      </Button>

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
            <button
              disabled={isPending}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={() => handleSignOut()}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
