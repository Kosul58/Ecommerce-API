import React from "react";
import type { SellerOrder } from "../../hooks/orders";
import { IoClose } from "react-icons/io5";

interface ViewOrderProps {
  order: SellerOrder | null;
  onClose: () => void;
}

const ViewOrder: React.FC<ViewOrderProps> = ({ order, onClose }) => {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="hidden sm:block absolute right-4 top-4 text-gray-500 hover:text-gray-800 cursor-pointer"
          aria-label="Close"
        >
          <IoClose className="h-6 w-6" />
        </button>

        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Order Details
        </h2>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700">
          <p>
            <strong className="font-medium">Order ID:</strong> {order.orderid}
          </p>
          <p>
            <strong className="font-medium">Product Name:</strong> {order.name}
          </p>
          <p>
            <strong className="font-medium">Product ID:</strong>{" "}
            {order.productid}
          </p>
          <p>
            <strong className="font-medium">Quantity:</strong> {order.quantity}
          </p>
          <p>
            <strong className="font-medium">Price:</strong> $
            {order.price.toFixed(2)}
          </p>
          <p>
            <strong className="font-medium">Order Status:</strong>
            <span
              className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                order.orderstatus === "Delivered"
                  ? "bg-green-100 text-green-800"
                  : order.orderstatus === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.orderstatus === "Processing"
                  ? "bg-blue-100 text-blue-800"
                  : order.orderstatus === "Shipped"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.orderstatus}
            </span>
          </p>
          <p>
            <strong className="font-medium">Payment Status:</strong>
            <span
              className={`ml-2 font-semibold ${
                order.paymentStatus ? "text-green-600" : "text-red-600"
              }`}
            >
              {order.paymentStatus ? "Completed" : "Pending"}
            </span>
          </p>
          <p>
            <strong className="font-medium">Payment Method:</strong>{" "}
            {order.paymentMethod}
          </p>
        </div>

        <div className="mt-6 flex justify-end sm:hidden">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
