import React, { useState, useEffect, useRef } from "react";
import { useCartData, useRemoveCart, useCartUpdate } from "../hooks/useAuth";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import NavBar from "../components/navbar/Navbar";

const Cart = () => {
  const { data: cart, isLoading, isError } = useCartData();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { mutateAsync: removeFromCart, isPending: isRemoving } =
    useRemoveCart();
  const { mutateAsync: updateCartQuantity } = useCartUpdate();

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600 text-lg">
        Loading cart...
      </div>
    );
  }

  if (isError || !cart) {
    return (
      <div className="p-6 text-center text-red-500 text-lg font-semibold">
        Error loading cart
      </div>
    );
  }
  const handleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts((prev) =>
      prev.length === cart?.products.length
        ? []
        : cart.products.map((p) => p.productid)
    );
  };

  const handleQuantityChange = (id: string, value: number) => {
    const newQuantity = Math.max(1, value);
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));

    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(() => {
      updateCartQuantity({ productid: id, quantity: newQuantity });
    }, 1000);
  };

  const handleRemove = async (id: string) => {
    await removeFromCart({ products: [id] });
    setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
  };

  const handleBulkRemove = async () => {
    if (selectedProducts.length === 0) return;
    await removeFromCart({ products: selectedProducts });
    setSelectedProducts([]);
  };

  const handleCheckout = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to proceed.");
      return;
    }
    const items = cart.products.filter((p) =>
      selectedProducts.includes(p.productid)
    );
    console.log("Proceeding to checkout with:", items);
    alert("Checkout functionality coming soon!");
  };

  return (
    <>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === cart.products.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-purple-500 focus:ring-2 transition"
                />
                <span className="text-gray-800 font-semibold text-lg select-none">
                  Select All
                </span>
              </label>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={handleBulkRemove}
                  disabled={selectedProducts.length === 0 || isRemoving}
                  className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
                >
                  <FaTrash className="text-lg" />
                  Remove Selected
                </button>
              </div>
            </div>

            <div className="grid gap-5">
              {cart.products.map((item) => (
                <div
                  key={item.productid}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-5 bg-white shadow hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(item.productid)}
                      onChange={() => handleSelect(item.productid)}
                      className="w-5 h-5 rounded border-gray-300 focus:ring-purple-500 focus:ring-2 transition"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <label
                          htmlFor={`qty-${item.productid}`}
                          className="text-sm text-gray-600 font-medium"
                        >
                          Qty:
                        </label>
                        <input
                          id={`qty-${item.productid}`}
                          type="number"
                          min={1}
                          value={quantities[item.productid] ?? item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productid,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 sm:w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productid)}
                    className="mt-4 sm:mt-0 text-red-600 hover:text-red-800 transition"
                    title="Remove item"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <FaTrash className="text-2xl" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCheckout}
                disabled={selectedProducts.length === 0}
                className="flex items-center gap-3 bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                <FaShoppingCart className="text-lg" />
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
