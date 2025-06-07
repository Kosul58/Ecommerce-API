import React from "react";
import { useSellerOrders, type SellerOrder } from "../../hooks/orders";

const Orders = () => {
  const { data, error, isLoading } = useSellerOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-lg text-gray-600">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-lg text-red-600">
        <p>Error loading orders: {error.message}</p>
      </div>
    );
  }

  const orders: SellerOrder[] = data?.data || [];

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-lg text-gray-500">
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="container  bg-gray-200 min-h-screen flex flex-col items-center ">
      <h2 className="text-4xl p-6 w-full flex justify-start font-extrabold text-gray-800 mb-8 text-center tracking-wide bg-white">
        Orders
      </h2>

      <div className="overflow-x-auto w-[95%]  bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Product Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.orderid}
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderid}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[150px] truncate">
                  {order.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${order.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`font-semibold ${
                      order.paymentStatus ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {order.paymentStatus ? "Completed" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
