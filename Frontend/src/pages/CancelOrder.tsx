import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import Notification from "../components/notifications/Notification";
import { type Order, type OrderItem } from "../hooks/orders";
import { FaInfoCircle, FaCheckCircle, FaBan } from "react-icons/fa";
import { useCancelSelectedOrder, useCancelWholeOrder } from "../hooks/orders";
import Button from "../components/buttons/Buttons";

const formatCurrency = (amount: number) =>
  `Rs.${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const CancelOrder: React.FC = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [cancelType, setCancelType] = useState<"full" | "items">("full");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const orderToCancel = location.state?.order as Order | undefined;

  const {
    mutateAsync: cancelSelected,
    isPending: isCancellingSingle,
    isError: hasSingleCancelError,
    error: singleCancelError,
  } = useCancelSelectedOrder();
  const {
    mutateAsync: cancelWhole,
    isPending: isCancellingWhole,
    isError: hasWholeCancelError,
    error: wholeCancelError,
  } = useCancelWholeOrder();

  const isPending = isCancellingSingle || isCancellingWhole;

  useEffect(() => {
    if (orderToCancel) {
      const initiallyCancellableItems = orderToCancel.items.filter(
        (item) =>
          item.active &&
          item.status !== "Delivered" &&
          item.status !== "Cancelled"
      );

      if (
        initiallyCancellableItems.length ===
        orderToCancel.items.filter((item) => item.active).length
      ) {
        setCancelType("full");
      } else {
        setCancelType("items");
      }
      setSelectedItems([]);
    }
  }, [orderToCancel]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const toggleItemSelection = (productid: string) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(productid)
        ? prev.filter((id) => id !== productid)
        : [...prev, productid];

      const allCancellableActiveItemIds =
        orderToCancel?.items
          .filter(
            (item) =>
              item.active &&
              item.status !== "Delivered" &&
              item.status !== "Cancelled"
          )
          .map((item) => item.productid) || [];

      if (
        newSelection.length > 0 &&
        newSelection.length === allCancellableActiveItemIds.length &&
        newSelection.every((id) => allCancellableActiveItemIds.includes(id))
      ) {
        setCancelType("full");
        return [];
      } else {
        setCancelType("items");
        return newSelection;
      }
    });
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) {
      showNotification("Error: No order data found for cancellation.", "error");
      return;
    }

    let finalCancelType = cancelType;
    let itemsToProcess: string[] = [];

    if (cancelType === "items") {
      if (selectedItems.length === 0) {
        showNotification("Please select at least one item to cancel.", "error");
        return;
      }
      const allCancellableActiveItemIds = orderToCancel.items
        .filter(
          (item) =>
            item.active &&
            item.status !== "Delivered" &&
            item.status !== "Cancelled"
        )
        .map((item) => item.productid);

      if (
        selectedItems.length === allCancellableActiveItemIds.length &&
        selectedItems.every((id) => allCancellableActiveItemIds.includes(id))
      ) {
        finalCancelType = "full";
      } else {
        itemsToProcess = selectedItems;
      }
    }

    try {
      if (finalCancelType === "full") {
        await cancelWhole({ orderid: orderToCancel.orderid });
        showNotification(
          `Order #${orderToCancel.orderid} has been successfully canceled.`,
          "success"
        );
      } else {
        await cancelSelected({
          orderid: orderToCancel.orderid,
          productids: itemsToProcess,
        });
        showNotification(
          `Selected items from order #${orderToCancel.orderid} have been successfully canceled.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Cancellation failed:", error);
      const errorMessage =
        (hasWholeCancelError && wholeCancelError?.message) ||
        (hasSingleCancelError && singleCancelError?.message) ||
        "Failed to cancel order. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setTimeout(() => {
        navigate("/order");
      }, 1000);
    }
  };

  if (!orderToCancel) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 shadow-md">
          <NavBar />
        </div>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <FaInfoCircle className="text-5xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Order not found
            </h2>
            <p className="text-gray-600">
              No order details were provided for cancellation.
            </p>
            <Button
              onClick={() => navigate("/orders")}
              variant="primary"
              className="mt-6"
            >
              Go to Orders
            </Button>
          </div>
        </main>
        <div className="mt-auto shadow-md">
          <Footer />
        </div>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    );
  }

  const isOrderCancellable = orderToCancel.items.every(
    (item) =>
      !item.active ||
      (item.status !== "Delivered" && item.status !== "Cancelled")
  );

  const allActiveItemsCancellableByStatus = orderToCancel.items.every(
    (item) =>
      !item.active ||
      (item.status !== "Delivered" && item.status !== "Cancelled")
  );

  return (
    <div className="flex w-full flex-col min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50 shadow-md">
        <NavBar />
      </div>

      <main className="flex-grow p-4">
        <div className="w-full bg-white p-6 md:p-8 rounded-md border border-gray-200">
          <div className="text-2xl font-bold text-red-700 mb-6 flex justify-start items-center gap-3 border-b pb-4 flex-wrap">
            <FaBan className="text-3xl sm:text-4xl" /> Cancel Order
            <h1 className="text-xl sm:text-2xl font-bold ml-1">
              #{orderToCancel.orderid}
            </h1>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            Are you sure you want to cancel this order? You can cancel the
            entire order or specific items.
          </p>
          <div className="mb-6">
            <label className="font-semibold text-gray-800 block mb-2">
              Cancel Option
            </label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <label
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  cancelType === "full"
                    ? "bg-red-300 text-red-900 font-semibold"
                    : "bg-red-100 text-red-700"
                } ${
                  !isOrderCancellable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  value="full"
                  checked={cancelType === "full"}
                  onChange={() => {
                    if (isOrderCancellable) {
                      setCancelType("full");
                      setSelectedItems([]);
                    }
                  }}
                  disabled={!isOrderCancellable || isPending}
                  className="form-radio h-4 w-4 text-red-600"
                />
                Cancel Entire Order
              </label>

              {orderToCancel.items.some(
                (item) =>
                  item.active &&
                  item.status !== "Delivered" &&
                  item.status !== "Cancelled"
              ) && (
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    cancelType === "items"
                      ? "bg-red-300 text-red-900 font-semibold"
                      : "bg-red-100 text-red-700"
                  } ${
                    !allActiveItemsCancellableByStatus
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    value="items"
                    checked={cancelType === "items"}
                    onChange={() => {
                      if (allActiveItemsCancellableByStatus) {
                        setCancelType("items");
                      } else {
                        showNotification(
                          "No individual items can be cancelled from this order.",
                          "error"
                        );
                      }
                    }}
                    disabled={!allActiveItemsCancellableByStatus || isPending}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  Cancel Specific Items
                </label>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-5 mb-8 bg-red-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Type:</strong> {orderToCancel.type}
              </p>
              <p>
                <strong>Total:</strong> {formatCurrency(orderToCancel.total)}
              </p>
              <p>
                <strong>Payment Method:</strong> {orderToCancel.paymentMethod}
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                {orderToCancel.paymentStatus ? (
                  <span className="text-green-600">Paid</span>
                ) : (
                  <span className="text-red-600">Unpaid</span>
                )}
              </p>
              <p className="sm:col-span-2">
                <strong>Current Status:</strong>{" "}
                <span className="font-semibold text-orange-600">
                  {orderToCancel.status}
                </span>
              </p>
              <p className="sm:col-span-2">
                <strong>Delivery Address:</strong> {orderToCancel.address}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
              {cancelType === "full"
                ? "Items to be Canceled:"
                : "Select Items to Cancel:"}
            </h3>
            <ul className="space-y-2">
              {orderToCancel.items.map((item: OrderItem) => {
                const isItemCancellable =
                  item.active &&
                  item.status !== "Delivered" &&
                  item.status !== "Cancelled";
                const isChecked = selectedItems.includes(item.productid);

                if (!item.active) {
                  return null;
                }

                return (
                  <li
                    key={item.productid}
                    className={`flex justify-between items-center bg-white p-3 rounded border border-gray-200 ${
                      cancelType === "items" && isItemCancellable
                        ? "cursor-pointer hover:bg-gray-100"
                        : "cursor-default opacity-70"
                    }`}
                    onClick={() =>
                      cancelType === "items" &&
                      isItemCancellable &&
                      toggleItemSelection(item.productid)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {cancelType === "items" && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItemSelection(item.productid)}
                          disabled={!isItemCancellable || isPending}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      )}
                      <span
                        className={`font-medium ${
                          isItemCancellable
                            ? "text-gray-900"
                            : "text-gray-500 line-through"
                        }`}
                      >
                        {item.name}
                        {!isItemCancellable && (
                          <span className="text-xs text-red-500 ml-2">
                            (Not Cancellable)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {formatCurrency(item.price)} x {item.quantity}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              Go Back
            </Button>
            <Button
              onClick={handleCancelOrder}
              variant="danger"
              disabled={isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                "Cancelling..."
              ) : (
                <>
                  {" "}
                  <FaCheckCircle /> Confirm Cancellation{" "}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <div className="mt-auto shadow-md">
        <Footer />
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default CancelOrder;
