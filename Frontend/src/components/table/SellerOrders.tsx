import React from "react";
import { FaRegEye } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import ProductStatusDropdown from "../dropdowns/ProductStatus";
import { type SellerOrder } from "../../hooks/orders";

interface OrderTableProps {
  orders: SellerOrder[];
  onUpdateStatus?: (
    orderId: string,
    newStatus: SellerOrder["orderstatus"]
  ) => void;
  onUpdateProductItemStatus: (orderId: string, newStatus: string) => void;
  onViewOrder: (order: SellerOrder) => void;
  onTrackOrder: (order: SellerOrder) => void;
  showNotification: (message: string, type: "success" | "error") => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onUpdateStatus,
  onUpdateProductItemStatus,
  onViewOrder,
  onTrackOrder,
  showNotification,
}) => {
  const columnHeaders = {
    orderid: "Order ID",
    name: "Product Name",
    quantity: "Quantity",
    price: "Price",
    status: "Overall Order Status",
    productItemStatus: "Product Item Status",
    paymentStatus: "Payment",
    paymentMethod: "Payment Method",
    ...(onUpdateStatus && { actions: "Actions" }),
  };

  const headerKeys = Object.keys(
    columnHeaders
  ) as (keyof typeof columnHeaders)[];

  const handleProductStatusChange = (order: SellerOrder, newStatus: string) => {
    const currentStatus = order.productstatus;
    const invalidTransitions: Record<string, string[]> = {
      Rejected: [],
      Accepted: ["Requested", "Rejected"],
      Ready: ["Requested", "Rejected", "Accepted"],
    };

    if (newStatus === currentStatus) {
      showNotification(
        `Product status for order ${order.orderid} is already '${newStatus}'.`,
        "error"
      );
      return;
    }

    if (invalidTransitions[currentStatus]?.includes(newStatus)) {
      showNotification(
        `Cannot change product status for order ${order.orderid} from '${currentStatus}' to '${newStatus}'.`,
        "error"
      );
      return;
    }

    showNotification(
      `Updating product status for order ${order.orderid} to '${newStatus}'...`,
      "success"
    );
    onUpdateProductItemStatus(order.orderid, newStatus);
  };

  const renderStatusBadge = (status: SellerOrder["orderstatus"]) => {
    const statusClasses: Record<string, string> = {
      Delivered: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-indigo-100 text-indigo-800",
      Canceled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-md shadow-md border border-gray-300 min-h-[84%] ">
      <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
        <thead className="bg-blue-50">
          <tr>
            {headerKeys.map((key) => (
              <th
                key={key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap
                  ${key === "name" && "min-w-[150px] max-w-[150px]"}
                  ${key === "productItemStatus" && "w-36"}
                `}
              >
                {columnHeaders[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-sm">
          {orders.map((order) => {
            const currentProductItemStatus = order.productstatus;

            return (
              <tr key={order.orderid} className="hover:bg-gray-50">
                {headerKeys.map((key) => {
                  let cellContent: React.ReactNode;

                  switch (key) {
                    case "name":
                      cellContent = (
                        <div className="max-w-[150px] truncate">
                          {order.name}
                        </div>
                      );
                      break;
                    case "price":
                      cellContent = `$${order.price.toLocaleString()}`;
                      break;
                    case "status":
                      cellContent = renderStatusBadge(order.orderstatus);
                      break;
                    case "productItemStatus":
                      cellContent = (
                        <ProductStatusDropdown
                          initialStatus={currentProductItemStatus}
                          onStatusChange={(newStatus) =>
                            handleProductStatusChange(order, newStatus)
                          }
                          isDisabled={currentProductItemStatus === "Rejected"}
                        />
                      );
                      break;
                    case "paymentStatus":
                      cellContent = (
                        <span
                          className={`font-semibold ${
                            order.paymentStatus
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {order.paymentStatus ? "Completed" : "Pending"}
                        </span>
                      );
                      break;
                    case "actions":
                      cellContent = (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewOrder(order)}
                            className="text-gray-600 hover:text-blue-500"
                            title="View Order Details"
                          >
                            <FaRegEye className="h-5 w-5 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => onTrackOrder(order)}
                            className="text-gray-600 hover:text-green-500"
                            title="Track Order"
                          >
                            <FaTruckFast className="h-5 w-5 cursor-pointer" />
                          </button>
                        </div>
                      );
                      break;
                    default: {
                      const value = order[key as keyof SellerOrder];
                      cellContent =
                        typeof value === "boolean" ||
                        typeof value === "number" ||
                        typeof value === "string"
                          ? value.toString()
                          : "";
                    }
                  }

                  return (
                    <td
                      key={key}
                      className="px-4 py-2 text-left text-gray-800 whitespace-nowrap"
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
