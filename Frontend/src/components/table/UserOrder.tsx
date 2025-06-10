import React from "react";
import { type Order } from "../../hooks/orders";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaBan,
  FaEye,
} from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const formatCurrency = (amount: number) =>
  `Rs.${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

interface OrderTableProps {
  orders: Order[] | undefined;
  onViewOrder: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  onReturnOrder: (order: Order) => void;
  isReturning: boolean;
}

const UserOrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewOrder,
  onTrackOrder,
  onCancelOrder,
  onReturnOrder,
  isReturning,
}) => {
  const navigate = useNavigate();
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20">
        <FaBoxOpen className="text-5xl text-purple-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600 mb-6">No orders found.</p>

        <button
          onClick={() => navigate("/cart")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          Place Order
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow rounded-lg bg-white w-[95%]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-purple-50">
          <tr>
            {[
              "Order ID",
              "Type",
              "Total",
              "Payment Method",
              "Payment",
              "Status",
              "Products",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="p-4 text-left text-sm font-semibold text-gray-700"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isCancellable = order.status === "Placed";
            return (
              <tr
                key={order.orderid}
                className="bg-white hover:bg-gray-50 transition"
              >
                <td className="p-4 font-semibold text-gray-700 whitespace-nowrap">
                  {order.orderid}
                </td>
                <td className="p-4 text-sm whitespace-nowrap">{order.type}</td>
                <td className="p-4 whitespace-nowrap">
                  {formatCurrency(order.total)}
                </td>
                <td className="p-4 min-w-[150px] whitespace-nowrap">
                  {order.paymentMethod}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {order.paymentStatus ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <FaCheckCircle /> Paid
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <FaTimesCircle /> Unpaid
                    </span>
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                {/* New Products Cell */}
                <td className="p-4 text-sm max-w-[250px]">
                  <ul className="list-disc list-inside space-y-0.5">
                    {order.items.map((item) => (
                      <li
                        key={item.productid}
                        className="text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {item.name} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </td>
                {/* End New Products Cell */}
                <td className="p-4 flex gap-2 text-lg whitespace-nowrap">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="text-gray-600 hover:text-purple-700 cursor-pointer"
                    title="View Order"
                    aria-label="View Order"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => onTrackOrder(order)}
                    className="text-gray-600 hover:text-blue-800 cursor-pointer"
                    title="Track Order"
                    aria-label="Track Order"
                  >
                    <FaTruck />
                  </button>

                  {order.status === "Delivered" ? (
                    <button
                      onClick={() => onReturnOrder(order)}
                      disabled={!isReturning}
                      className={`${
                        isReturning
                          ? "text-red-600 hover:text-red-800 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title="Return Order"
                      aria-label="Return Order"
                    >
                      <TbTruckReturn />
                    </button>
                  ) : (
                    <button
                      onClick={() => onCancelOrder(order)}
                      disabled={!isCancellable}
                      className={`${
                        isCancellable
                          ? "text-red-600 hover:text-red-800 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title="Cancel Order"
                      aria-label="Cancel Order"
                    >
                      <FaBan />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrderTable;
