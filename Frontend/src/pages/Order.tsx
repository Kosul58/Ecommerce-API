import React, { useState } from "react";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { useUserOrders, type Order } from "../hooks/orders";
import { FaSpinner, FaBox, FaTimesCircle } from "react-icons/fa";
import UserViewOrder from "../components/modals/UserViewOrder";
import UserTrackOrder from "../components/modals/UserTrackOrder";
import UserOrderTable from "../components/table/UserOrder";
import PaginationComponent from "../components/pagination/Pagination";
import { useNavigate } from "react-router-dom";

const UserOrder = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, isError } = useUserOrders();
  console.log(orders);
  const [selectedOrderForView, setSelectedOrderForView] =
    useState<Order | null>(null);
  const [selectedOrderForTrack, setSelectedOrderForTrack] =
    useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const isReturning = false;

  const handleCancelOrder = (order: Order) => {
    navigate("/cancelorder", { state: { order } });
  };

  const handleReturnOrder = (order: Order) => {
    if (
      window.confirm(
        "Are you sure you want to return this order? Our transport management will be in contact with you soon."
      )
    ) {
      alert(`Returned order: ${order.orderid}`);
    }
  };

  const totalPages = orders ? Math.ceil(orders.length / ordersPerPage) : 1;
  const paginatedOrders = orders?.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <NavBar />
      </header>

      <main className="flex-grow w-full">
        <h1 className="w-full text-2xl font-bold text-gray-800 px-4 py-2 border-b border-gray-300 flex justify-start gap-1 items-center">
          <FaBox className="text-xl" /> Orders
        </h1>

        {isLoading ? (
          <div className="text-center py-20">
            <FaSpinner className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Fetching your orders...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-600">
            <FaTimesCircle className="text-3xl mx-auto mb-4" />
            <p className="text-lg">Failed to load orders. Try again later.</p>
          </div>
        ) : (
          <div className="w-full min-h-[70Vh] flex flex-col items-center mt-4">
            <UserOrderTable
              orders={paginatedOrders || []}
              onViewOrder={setSelectedOrderForView}
              onTrackOrder={setSelectedOrderForTrack}
              onCancelOrder={handleCancelOrder}
              onReturnOrder={handleReturnOrder}
              isReturning={isReturning}
            />
            {orders && orders.length > ordersPerPage && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-white shadow-inner mt-12">
        <Footer />
      </footer>

      <UserViewOrder
        order={selectedOrderForView}
        onClose={() => setSelectedOrderForView(null)}
      />
      <UserTrackOrder
        order={selectedOrderForTrack}
        onClose={() => setSelectedOrderForTrack(null)}
      />
    </div>
  );
};

export default UserOrder;
