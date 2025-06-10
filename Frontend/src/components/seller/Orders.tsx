import React, { useState, useMemo } from "react";
import {
  useSellerOrders,
  type SellerOrder,
  useUpdateProductStatus,
} from "../../hooks/orders";
import SearchBar from "../search/SearchBar";
import PaginationComponent from "../pagination/Pagination";
import Notification from "../notifications/Notification";
import OrderTable from "../table/SellerOrders";
import ViewOrder from "../modals/ViewOrder";
import TrackOrderModal from "../modals/TrackOrder";
import type { AxiosError } from "axios";

interface Seller {
  username: string;
}

interface OrdersProps {
  seller: Seller;
}

const Orders: React.FC<OrdersProps> = ({ seller }) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification(null);
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const { data: orderData, error, isLoading, refetch } = useSellerOrders();
  console.log("Fetched Order Data:", orderData);

  const { mutateAsync: updateProductStatus, isPending: statusUpdatePending } =
    useUpdateProductStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const orders: SellerOrder[] = useMemo(() => {
    return orderData?.data || [];
  }, [orderData?.data]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    return orders.filter(
      (order: SellerOrder) =>
        order.orderid.toLowerCase().includes(lowerCaseSearchQuery) ||
        order.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        order.orderstatus.toLowerCase().includes(lowerCaseSearchQuery) ||
        order.paymentMethod.toLowerCase().includes(lowerCaseSearchQuery) ||
        (order.orderTrack.length > 0 &&
          order.orderTrack[order.orderTrack.length - 1].status
            .toLowerCase()
            .includes(lowerCaseSearchQuery))
    );
  }, [orders, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [currentPage, filteredOrders, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateOverallOrderStatus = async (
    orderId: string,
    newStatus: SellerOrder["productstatus"]
  ) => {
    if (statusUpdatePending) {
      showNotification("Status update already in progress.", "error");
      return;
    }

    try {
      showNotification(
        `Updating order ${orderId} overall status to ${newStatus}...`,
        "success"
      );

      const orderToUpdate = orders.find((order) => order.orderid === orderId);

      if (!orderToUpdate) {
        showNotification("Order not found.", "error");
        return;
      }

      const payload = {
        orderid: orderId,
        productid: orderToUpdate.productid,
        status: newStatus,
      };

      await updateProductStatus(payload);
      showNotification("Overall order status updated successfully.", "success");
    } catch (err) {
      const error = err as AxiosError;
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        showNotification(
          (error.response.data as { message: string }).message,
          "error"
        );
      } else if (error.message) {
        showNotification(`Error: ${error.message}`, "error");
      } else {
        showNotification(
          "An unexpected error occurred during overall status update.",
          "error"
        );
      }
    } finally {
      refetch();
    }
  };

  const handleUpdateProductItemStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    if (statusUpdatePending) {
      showNotification("Status update already in progress.", "error");
      return;
    }

    try {
      const orderToUpdate = orders.find((order) => order.orderid === orderId);
      if (!orderToUpdate) {
        showNotification("Order not found for product status update.", "error");
        return;
      }

      const payload = {
        orderid: orderId,
        productid: orderToUpdate.productid,
        status: newStatus,
      };

      await updateProductStatus(payload);
      showNotification(
        `Product item status for order ${orderId} updated to '${newStatus}' successfully.`,
        "success"
      );
    } catch (err) {
      const error = err as AxiosError;
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        showNotification(
          (error.response.data as { message: string }).message,
          "error"
        );
      } else if (error.message) {
        showNotification(`Error: ${error.message}`, "error");
      } else {
        showNotification(
          "An unexpected error occurred during product item status update.",
          "error"
        );
      }
    } finally {
      refetch();
    }
  };

  const handleViewOrder = (order: SellerOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleTrackOrder = (order: SellerOrder) => {
    setSelectedOrder(order);
    setIsTrackModalOpen(true);
  };

  const handleCloseTrackModal = () => {
    setIsTrackModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-gray-600">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-red-600">
        Error: {error.message}
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center w-full h-screen max-h-screen bg-gray-100">
      <div className="flex justify-between w-full flex-shrink-0 px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex flex-col">
          <h3 className="text-xs text-gray-500">Seller /</h3>
          <h1 className="text-lg font-semibold text-gray-800">Orders</h1>
        </div>
        <div className="flex flex-col items-end">
          <h3 className="text-xs text-gray-500">seller</h3>
          <h1 className="text-lg font-semibold text-gray-800">
            {seller?.username || "N/A"}
          </h1>
        </div>
      </div>

      <div className="flex justify-between w-full px-6 py-2 bg-white border-b border-gray-200">
        <div className="flex flex-col justify-center max-sm:items-center">
          <h1 className="text-md max-sm:text-sm">Manage Customer Orders</h1>
          <h2 className="text-xs text-gray-400 max-[780px]:hidden">
            View and manage all customer orders placed for your products.
          </h2>
        </div>
        <div></div>
      </div>

      <div className="flex flex-col items-center justify-end w-full px-4 bg-white border-b border-gray-200 md:flex-row">
        <div className="w-full max-w-sm">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <section className="flex flex-col items-center justify-between min-h-[400px] flex-grow w-full p-2 overflow-y-auto bg-gray-50 shadow-lg">
        {filteredOrders.length === 0 ? (
          <p className="py-8 text-lg text-gray-600">
            {searchQuery ? "No orders match your search." : "No orders found."}
          </p>
        ) : (
          <OrderTable
            orders={currentOrders}
            onUpdateStatus={handleUpdateOverallOrderStatus}
            onUpdateProductItemStatus={handleUpdateProductItemStatus}
            onViewOrder={handleViewOrder}
            onTrackOrder={handleTrackOrder}
            showNotification={showNotification}
          />
        )}
        {filteredOrders.length > 0 && (
          <div className="flex justify-center flex-shrink-0 w-full mt-4">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {isViewModalOpen && (
        <ViewOrder order={selectedOrder} onClose={handleCloseViewModal} />
      )}

      {isTrackModalOpen && (
        <TrackOrderModal
          order={selectedOrder}
          onClose={handleCloseTrackModal}
        />
      )}
    </section>
  );
};

export default Orders;
