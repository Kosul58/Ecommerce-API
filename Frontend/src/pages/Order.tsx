import React from "react";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { useUserOrders } from "../hooks/orders";

const Order = () => {
  const { data: orders, isLoading: orderLoading, isError } = useUserOrders();

  const handleTrackOrder = (orderId: string) => {
    // Implement tracking logic or redirect
    alert(`Tracking order: ${orderId}`);
  };

  const handleCancelOrder = (orderId: string) => {
    // Replace with actual cancellation logic
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (confirmCancel) {
      alert(`Cancelled order: ${orderId}`);
    }
  };

  return (
    <div className="flex flex-col h-fit">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <NavBar />
      </header>

      <main className="flex-grow px-4 py-10 max-w-6xl mx-auto w-full min-h-screen">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-6">
          My Orders
        </h1>

        {orderLoading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load orders</p>
        ) : orders?.data?.length === 0 ? (
          <p className="text-center text-gray-600">No orders found</p>
        ) : (
          <div className="space-y-6">
            {orders?.data.map((order) => (
              <div
                key={order.orderid}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Order ID:{" "}
                    <span className="text-purple-600">{order.orderid}</span>
                  </h2>
                  <span className="text-sm text-white bg-purple-600 px-2 py-1 rounded">
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-2 space-y-1">
                  <p>
                    <strong>Type:</strong> {order.type}
                  </p>
                  <p>
                    <strong>Total:</strong> Rs. {order.total}
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {order.paymentMethod}
                  </p>
                  <div className="flex">
                    <strong>Payment Status:</strong>
                    {order.paymentStatus === true ? (
                      <p className="text-green-400">True</p>
                    ) : (
                      <p className="text-red-400">False</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  {order.items.map((item) => (
                    <div
                      key={item.productid}
                      className="mb-3 border-b pb-2 last:border-none"
                    >
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: Rs. {item.price} × {item.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => alert(`Viewing order: ${order.orderid}`)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Order
                  </button>
                  <button
                    onClick={() => handleTrackOrder(order.orderid)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order.orderid)}
                    disabled={order.status !== "Placed"}
                    className={`px-3 py-1 text-sm rounded ${
                      order.status !== "Placed"
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white shadow-sm">
        <Footer />
      </footer>
    </div>
  );
};

export default Order;
