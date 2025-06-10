import React, { useState, useEffect } from "react";

interface ProductStatusDropdownProps {
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
  isDisabled?: boolean;
}

const productStatuses = ["Requested", "Rejected", "Accepted", "Ready"];

const ProductStatusDropdown: React.FC<ProductStatusDropdownProps> = ({
  initialStatus,
  onStatusChange,
  isDisabled = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    productStatuses.includes(initialStatus) ? initialStatus : productStatuses[0]
  );
  useEffect(() => {
    if (
      initialStatus !== selectedStatus &&
      productStatuses.includes(initialStatus)
    ) {
      setSelectedStatus(initialStatus);
    }
  }, [initialStatus]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    onStatusChange(newStatus);
  };

  return (
    <select
      value={selectedStatus}
      onChange={handleChange}
      disabled={isDisabled}
      className={`
        block w-full px-3 py-1 text-sm font-medium rounded-md border
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${
          isDisabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
        }
      `}
    >
      {productStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
};

export default ProductStatusDropdown;
