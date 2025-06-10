import React from "react";
import { type Order, type OrderItem } from "../../hooks/orders";
import { FaCreditCard, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const formatCurrency = (amount: number) =>
  `Rs.${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
interface OrderViewModalProps {
  order: Order | null;
  onClose: () => void;
}

const UserViewOrder: React.FC<OrderViewModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const orderDate = order.timestamp
    ? new Date(order.timestamp).toLocaleDateString()
    : "N/A";

  const getItemStatusColorClass = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Ready":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-red-200 text-gray-700";
    }
  };

  const getOrderStatusColorClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Canceled":
        return "bg-red-100 text-red-700";
      case "Placed":
      case "Confirmed":
        return "bg-indigo-100 text-indigo-700";
      case "Processing":
      case "Shipped":
      case "Ready for delivery":
      case "Out for Delivery":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="hidden sm:block absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close order details"
        >
          <IoClose className="h-7 w-7" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6 flex max-sm:flex-col max-sm:text-md">
          Order Details:
          <span className="text-purple-700 max-sm:text-sm">
            #{order.orderid}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 mb-8">
          <p className="flex items-center gap-2 max-sm:text-sm">
            <FaCalendarAlt className="text-purple-500" />
            <strong>Order Date:</strong> {orderDate}
          </p>
          <p className="flex items-center gap-2 max-sm:text-sm">
            <FaCreditCard className="text-green-500" />
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
          <p className="flex items-center gap-2 max-sm:text-sm">
            <strong>Payment Status:</strong>{" "}
            {order.paymentStatus ? (
              <span className="text-green-600">Paid</span>
            ) : (
              <span className="text-red-500">Unpaid</span>
            )}
          </p>
          <p className="flex items-center gap-2 max-sm:text-sm">
            <strong>Order Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusColorClass(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </p>

          <p className="flex items-center gap-2 max-sm:text-sm">
            <strong>Total Amount:</strong> {formatCurrency(order.total)}
          </p>
          <p className="flex-grow flex items-center gap-2 md:col-span-2 max-sm:text-sm">
            <FaMapMarkerAlt className="text-blue-500" />
            <strong>Delivery Address:</strong> {order.address}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 max-sm:text-sm">
          Items in this Order ({order.items.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {order.items.map((item: OrderItem) => (
            <div
              key={item.productid}
              className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50"
            >
              <div>
                <p className="font-semibold text-gray-900 max-w-[350px] flex-grow max-sm:text-sm">
                  {item.name}
                </p>
                <p className="text-sm text-gray-600 mt-1 max-sm:text-sm">
                  {formatCurrency(item.price)} x {item.quantity}
                </p>
              </div>
              <p
                className={`text-sm px-3 py-1 max-sm:text-sm rounded-xl text-center font-medium mt-2 sm:mt-0 ${
                  item.active === false
                    ? "bg-red-200 text-red-700"
                    : getItemStatusColorClass(item.status)
                }`}
              >
                {item.active === false
                  ? "Status: Canceled"
                  : `Status: ${item.status}`}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end sm:hidden">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-300 px-5 py-2 font-semibold text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewOrder;
