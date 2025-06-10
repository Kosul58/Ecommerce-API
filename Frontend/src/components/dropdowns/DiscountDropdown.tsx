import { useState, useRef, useEffect, useCallback } from "react";
import Button from "../buttons/Buttons";

export interface Discounts {
  id: string;
  discountName: string;
  timestamp: string;
}

interface DiscountDropdownProps {
  discounts?: Discounts[];
  onSelectDiscount?: (discount: Discounts) => void;
  buttonText?: string;
}

const DiscountDropdown: React.FC<DiscountDropdownProps> = ({
  discounts = [],
  onSelectDiscount,
  buttonText = "Select Discount Type",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Discounts | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleToggleDropdown = () => setIsOpen((prev) => !prev);

  const handleDiscountClick = (discount: Discounts) => {
    setSelected(discount);
    onSelectDiscount?.(discount);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <Button type="button" onClick={handleToggleDropdown} variant="secondary">
        {selected?.discountName || buttonText}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full h-40 overflow-y-auto origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
          <div className="py-1 text-sm text-gray-700">
            {discounts.length > 0 ? (
              discounts.map((discount) => (
                <button
                  type="button"
                  key={discount.id}
                  onClick={() => handleDiscountClick(discount)}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-50 hover:text-purple-900 transition-colors duration-150"
                  role="menuitem"
                >
                  {discount.discountName}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-center">
                No discounts available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountDropdown;
