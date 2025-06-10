import React, { useState, useEffect, useRef } from "react";
import { useCartData, useRemoveCart, useCartUpdate } from "../hooks/useAuth";
import { FaTrash, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import NavBar from "../components/navbar/Navbar";
import type { AxiosError } from "axios";
import Notification from "../components/notifications/Notification";
import Footer from "../components/footer/Footer";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError } = useCartData();
  console.log(cart);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  const { mutateAsync: removeFromCart, isPending: isRemoving } =
    useRemoveCart();
  const { mutateAsync: updateCartQuantity } = useCartUpdate();

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (cart) {
      const initialQuantities: Record<string, number> = {};
      cart.products.forEach((p) => {
        initialQuantities[p.productid] = p.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [cart]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        Loading cart...
      </div>
    );

  if (isError || !cart)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-600">
        Error loading cart. Please try again.
      </div>
    );

  const handleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts((prev) =>
      prev.length === cart.products.length
        ? []
        : cart.products.map((p) => p.productid)
    );
  };

  const handleSelectAllBySeller = (sellerId: string) => {
    const productsBySeller = cart.products.filter(
      (p) => p.sellerid === sellerId
    );
    const allSelected = productsBySeller.every((p) =>
      selectedProducts.includes(p.productid)
    );

    setSelectedProducts((prev) => {
      let newSelected = [...prev];
      if (allSelected) {
        newSelected = newSelected.filter(
          (id) => !productsBySeller.map((p) => p.productid).includes(id)
        );
      } else {
        productsBySeller.forEach((p) => {
          if (!newSelected.includes(p.productid)) {
            newSelected.push(p.productid);
          }
        });
      }
      return newSelected;
    });
  };

  const updateQuantity = async (id: string, value: number) => {
    const newQuantity = Math.max(1, value);
    const oldQuantity = quantities[id] ?? 1;

    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));

    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        await updateCartQuantity({ productid: id, quantity: newQuantity });
        showNotification("Product quantity updated.", "success");
      } catch (error) {
        setQuantities((prev) => ({ ...prev, [id]: oldQuantity }));
        const err = error as AxiosError;
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;
          if (typeof data === "object" && data !== null && "message" in data) {
            const message = (data as { message: string }).message;
            if (status === 400 || status === 404) {
              showNotification(message, "error");
            } else if (status === 500) {
              showNotification(
                "Server error. Please try again later.",
                "error"
              );
            }
          } else {
            showNotification("Unexpected error format.", "error");
          }
        } else {
          showNotification("Network error or server is unreachable.", "error");
        }
      }
    }, 1000);
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart({ products: [id] });
      setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
      showNotification("Product removed from cart.", "success");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 400 || status === 404) {
          showNotification(err.message, "error");
        } else {
          showNotification(
            "Failed to remove product. Please try again.",
            "error"
          );
        }
      } else {
        showNotification("Network error. Please try again later.", "error");
      }
    }
  };

  const handleBulkRemove = async () => {
    if (selectedProducts.length === 0) return;
    try {
      await removeFromCart({ products: selectedProducts });
      setSelectedProducts([]);
      showNotification("Selected products removed from cart.", "success");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 400 || status === 404) {
          showNotification(err.message, "error");
        } else {
          showNotification(
            "Failed to remove selected products. Try again.",
            "error"
          );
        }
      } else {
        showNotification("Network error. Please try again later.", "error");
      }
    }
  };

  const handleCheckout = () => {
    if (selectedProducts.length === 0) {
      showNotification(
        "Please select at least one product to proceed.",
        "error"
      );
      return;
    }
    const selectedProductsData = cart.products.filter((p) =>
      selectedProducts.includes(p.productid)
    );

    navigate("/checkout", { state: { selectedProductsData } });
  };

  const productsGroupedBySeller = cart.products.reduce((acc, product) => {
    if (!acc[product.sellerid]) {
      acc[product.sellerid] = {
        shopname: product.shopname,
        products: [],
      };
    }
    acc[product.sellerid].products.push(product);
    return acc;
  }, {} as Record<string, { shopname: string; products: (typeof cart.products)[0][] }>);

  const selectedItems = cart.products.filter((p) =>
    selectedProducts.includes(p.productid)
  );

  const subtotal = selectedItems.reduce((acc, item) => {
    const quantity = quantities[item.productid] ?? item.quantity;
    const discountedPrice = item.price * (1 - item.discount / 100);
    return acc + discountedPrice * quantity;
  }, 0);

  const tax = subtotal * 0.1;
  const shippingfee = selectedItems.length > 0 ? 150 * selectedItems.length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 shadow-md">
        <NavBar />
      </div>

      <div className="flex-grow w-full min-h-[80vh] bg-gray-50">
        <h1 className="text-2xl flex font-bold justify-start items-center gap-2 w-full bg-white px-4 py-2 border-b border-gray-200 text-gray-800">
          <FaShoppingCart /> Cart
        </h1>
        {cart.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
            <FaShoppingCart className="text-purple-400 text-6xl mb-4" />
            <p className="text-xl text-gray-600 font-medium">
              Your cart is empty. Start shopping now!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out font-semibold text-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6  p-4 bg-gray-50">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200">
                <label className="flex items-center space-x-3 cursor-pointer select-none mb-3 sm:mb-0">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === cart.products.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 accent-purple-500 transform scale-110"
                  />
                  <span className="font-semibold text-lg text-gray-800">
                    Select All Items
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-600">
                    {selectedProducts.length} items selected
                  </span>
                  <button
                    onClick={handleBulkRemove}
                    disabled={selectedProducts.length === 0 || isRemoving}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold py-2 px-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg max-sm:text-xs cursor-pointer"
                  >
                    <FaTrash />
                    Remove Selected
                  </button>
                </div>
              </div>

              {Object.entries(productsGroupedBySeller).map(
                ([sellerId, sellerData]) => (
                  <div
                    key={sellerId}
                    className="mb-6 border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                      <label className="flex items-center space-x-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sellerData.products.every((p) =>
                            selectedProducts.includes(p.productid)
                          )}
                          onChange={() => handleSelectAllBySeller(sellerId)}
                          className="w-5 h-5 rounded border-gray-300 accent-purple-500 transform scale-110"
                        />
                        <h2 className="font-bold text-xl text-gray-800">
                          {sellerData.shopname}
                        </h2>
                      </label>
                    </div>
                    <div className="grid gap-4">
                      {sellerData.products.map((item) => {
                        const discounted =
                          item.price * (1 - item.discount / 100);
                        return (
                          <div
                            key={item.productid}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition relative"
                          >
                            <div className="flex items-center gap-4 w-full max-sm:max-w-[80%] sm:w-auto">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(
                                  item.productid
                                )}
                                onChange={() => handleSelect(item.productid)}
                                className="w-5 h-5 min-w-5 min-h-5 accent-purple-500 transform scale-110"
                              />

                              <div className="w-full">
                                <p className="font-semibold text-lg text-gray-800 break-words max-w-[90%] mb-1">
                                  {item.name}
                                </p>

                                <p className="text-sm text-gray-600 mb-2">
                                  {item.discount > 0 ? (
                                    <>
                                      <span className="line-through text-red-500 mr-2">
                                        Rs.{item.price.toFixed(2)}
                                      </span>{" "}
                                      <span className="text-green-600 font-bold">
                                        Rs.{discounted.toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold">
                                      Rs.{item.price.toFixed(2)}
                                    </span>
                                  )}
                                </p>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productid,
                                        (quantities[item.productid] ?? 1) - 1
                                      )
                                    }
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200 flex items-center justify-center text-gray-700"
                                  >
                                    <FaMinus className="text-sm" />
                                  </button>

                                  <input
                                    type="text"
                                    readOnly
                                    value={
                                      quantities[item.productid] ??
                                      item.quantity
                                    }
                                    onClick={() => {
                                      setModalProductId(item.productid);
                                      setModalQuantity(
                                        quantities[item.productid] ??
                                          item.quantity
                                      );
                                    }}
                                    className="w-20 text-center border border-gray-300 rounded-md px-2 py-1.5 cursor-pointer font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />

                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productid,
                                        (quantities[item.productid] ?? 1) + 1
                                      )
                                    }
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200 flex items-center justify-center text-gray-700"
                                  >
                                    <FaPlus className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemove(item.productid)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-200 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white rounded-md max-sm:rounded-none shadow-sm p-6 border border-gray-200 ">
                <h2 className="text-xl font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200">
                  Order Summary
                </h2>

                {selectedProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Select items to see your order summary.
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-700 text-lg">Subtotal:</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        Rs.{subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-700 text-lg">Tax (10%):</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        Rs.{tax.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200">
                      <p className="text-gray-700 text-lg">Shipping Fee:</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        Rs.{shippingfee.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-xl font-bold text-gray-900">Total:</p>
                      <p className="text-xl font-bold ">
                        Rs.{Math.round(subtotal + tax + shippingfee).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={selectedProducts.length === 0}
                  className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold shadow-md hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-lg cursor-pointer"
                >
                  <FaShoppingCart className="text-xl" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>

      {modalProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Update Quantity
            </h2>
            <input
              type="number"
              min={1}
              value={modalQuantity}
              onChange={(e) => setModalQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalProductId(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalProductId) {
                    updateQuantity(modalProductId, modalQuantity);
                    setModalProductId(null);
                  }
                }}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-auto shadow-md">
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
