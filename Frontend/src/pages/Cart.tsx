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

  if (isLoading) return <div className="p-6 text-center">Loading cart...</div>;

  if (isError || !cart)
    return (
      <div className="text-center text-red-500 text-lg">Error loading cart</div>
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
        showNotification("Product quantity updated successfully.", "success");
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
      alert("Please select at least one product to proceed.");
      return;
    }
    const selectedProductsData = cart.products.filter((p) =>
      selectedProducts.includes(p.productid)
    );

    console.log(selectedProductsData);

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
    <div className="w-full min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 shadow-md">
        <NavBar />
      </div>

      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        {cart.products.length === 0 ? (
          <p className="text-center text-gray-600 text-lg mt-12">
            Your cart is empty.
          </p>
        ) : (
          <>
            {/* <h1 className="pb-6 text-4xl text-bold">Cart:</h1> */}
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === cart.products.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 accent-purple-500"
                />
                <span className="font-semibold text-lg">Select All</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={handleBulkRemove}
                  disabled={selectedProducts.length === 0 || isRemoving}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
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
                  className="mb-8 border rounded-lg p-5 bg-white shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sellerData.products.every((p) =>
                          selectedProducts.includes(p.productid)
                        )}
                        onChange={() => handleSelectAllBySeller(sellerId)}
                        className="w-5 h-5 rounded border-gray-300 accent-purple-500"
                      />
                      <h2 className="font-bold text-xl">
                        {sellerData.shopname}
                      </h2>
                    </label>
                  </div>
                  <div className="grid gap-5">
                    {sellerData.products.map((item) => {
                      const discounted = item.price * (1 - item.discount / 100);
                      return (
                        <div
                          key={item.productid}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-5 bg-white shadow hover:shadow-md transition relative"
                        >
                          <div className="flex items-center gap-4 w-full max-sm:max-w-[80%] sm:w-auto">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(
                                item.productid
                              )}
                              onChange={() => handleSelect(item.productid)}
                              className="w-5 h-5 min-w-5 min-h-5  accent-purple-500"
                            />

                            <div className="w-full">
                              <p className="font-semibold text-lg break-words max-w-[90%]">
                                {item.name}
                              </p>

                              <p className="text-sm">
                                {item.discount > 0 ? (
                                  <>
                                    <span className="line-through text-red-400">
                                      Rs.{item.price.toFixed(2)}
                                    </span>{" "}
                                    <span className="text-green-600">
                                      Rs.{discounted.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>Rs.{item.price.toFixed(2)}</span>
                                )}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productid,
                                      (quantities[item.productid] ?? 1) - 1
                                    )
                                  }
                                  className="p-1 border rounded hover:bg-gray-100"
                                >
                                  <FaMinus />
                                </button>

                                <input
                                  type="text"
                                  readOnly
                                  value={
                                    quantities[item.productid] ?? item.quantity
                                  }
                                  onClick={() => {
                                    setModalProductId(item.productid);
                                    setModalQuantity(
                                      quantities[item.productid] ??
                                        item.quantity
                                    );
                                  }}
                                  className="w-16 text-center border rounded px-2 py-1 cursor-pointer"
                                />

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productid,
                                      (quantities[item.productid] ?? 1) + 1
                                    )
                                  }
                                  className="p-1 border rounded hover:bg-gray-100"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(item.productid)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="text-2xl" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            <div className="mt-8 p-4 border rounded bg-gray-50 text-right">
              {selectedProducts.length === 0 ? (
                <p className="text-gray-600">Select products to see totals</p>
              ) : (
                <>
                  <p className="text-lg font-semibold">
                    Subtotal: Rs.{subtotal.toFixed(2)}
                  </p>
                  <p className="text-lg font-semibold">
                    Tax: Rs.{tax.toFixed(2)}
                  </p>
                  <p className="text-lg font-semibold">
                    Shipping Fee: Rs.{shippingfee.toFixed(2)}
                  </p>
                  <p className="text-xl font-bold">
                    Total: Rs.{Math.round(subtotal + tax + shippingfee)}
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCheckout}
                disabled={selectedProducts.length === 0}
                className="flex items-center gap-3 bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold shadow hover:bg-purple-700 disabled:opacity-50"
              >
                <FaShoppingCart />
                Proceed to Checkout
              </button>
            </div>
          </>
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">Update Quantity</h2>
            <input
              type="number"
              min={1}
              value={modalQuantity}
              onChange={(e) => setModalQuantity(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalProductId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
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
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="shadow-md">
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
