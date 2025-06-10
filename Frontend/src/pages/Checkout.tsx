import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { EnrichedCartProduct } from "../hooks/useAuth";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import Notification from "../components/notifications/Notification";
import { useUserData } from "../hooks/useAuth";
import { useUserUpdate } from "../hooks/useAuth";
import { useCreateOrders } from "../hooks/orders";
import type { AxiosError } from "axios";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";

const Checkout = () => {
  const location = useLocation();
  const selectedProducts: EnrichedCartProduct[] =
    location.state?.selectedProductsData || [];
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUserData();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUserUpdate();

  const { mutateAsync: createOrders, isPending: isOrdering } =
    useCreateOrders();

  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
  const [paymentStatus, setPaymentStatus] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (user?.address && !address && !isEditingAddress) {
      setAddress(user.address);
    }
  }, [user, address, isEditingAddress]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const getDiscountedPrice = (product: EnrichedCartProduct) => {
    if (product.discount && product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const shippingFee = 150 * selectedProducts.length;
  const subtotal = selectedProducts.reduce(
    (acc, p) => acc + getDiscountedPrice(p) * p.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const totalAmount = subtotal + tax + shippingFee;

  const placeOrder = async () => {
    if (!user) {
      showNotification("You must be logged in to place an order.", "error");
      return;
    }
    const products = selectedProducts.map((p) => p.productid);
    const payload = {
      address: address,
      products: products,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
    };
    try {
      await createOrders(payload);
      showNotification(
        `Order placed successfully by ${
          user.username || "user"
        } with Cash on Delivery!`,
        "success"
      );
      navigate("/order");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          const message = (data as { message: string }).message;
          if (status === 400 || status === 404) {
            showNotification(message, "error");
          } else if (status === 500) {
            showNotification("Server error. Please try again later.", "error");
          }
        } else {
          showNotification("Unexpected error format.", "error");
        }
      } else {
        showNotification("Network error or server is unreachable.", "error");
      }
    }
  };

  const makeEsewaPayment = () => {
    showNotification("Redirecting to eSewa payment gateway...", "success");
  };

  const handleCheckout = async () => {
    if (!address.trim() || address.trim().length < 5) {
      showNotification("Please enter a valid delivery address.", "error");
      return;
    }
    if (!user) {
      showNotification("Please login to continue.", "error");
      return;
    }
    if (paymentMethod === "Cash On Delivery") {
      setPaymentStatus(false);
      showNotification("Placing order for the user", "success");
      await placeOrder();
    } else {
      makeEsewaPayment();
    }
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      showNotification("Address cannot be empty.", "error");
      return;
    }

    if (address === user?.address) {
      showNotification(
        "The selected address matches your saved address.",
        "success"
      );
      return;
    }

    showNotification("Updating user address", "success");

    const formdata = new FormData();
    formdata.append("address", address);
    try {
      await updateUser(formdata);
      showNotification("Address updated successfully.", "success");
      setIsEditingAddress(false);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          const message = (data as { message: string }).message;
          if (status === 400 || status === 404) {
            showNotification(message, "error");
          } else if (status === 500) {
            showNotification("Server error. Please try again later.", "error");
          }
        } else {
          showNotification("Unexpected error format.", "error");
        }
      } else {
        showNotification("Network error or server is unreachable.", "error");
      }
    }
  };

  if (isLoading) return <div>Loading user data...</div>;
  if (error) return <div>Error loading user data.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 shadow-md">
        <NavBar />
      </div>

      <main className=" w-full">
        <h1 className="w-full px-4 py-2 flex justify-start items-center gap-1 text-2xl font-bold  text-center text-gray-800 border-b border-gray-300">
          <MdOutlineShoppingCartCheckout />
          Checkout
        </h1>

        {selectedProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products selected.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50">
            <div className="space-y-6 p-4 border border-gray-300  bg-white rounded-md shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700">
                Selected Products
              </h2>

              {selectedProducts.map((product, index) => {
                const discountedPrice = getDiscountedPrice(product);
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex gap-4 items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity}
                        </p>
                        {product.discount ? (
                          <p className="text-sm text-green-600 font-medium">
                            {product.discount}% off
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      {product.discount ? (
                        <>
                          <p className="text-sm text-gray-500 line-through">
                            Rs.{product.price.toFixed(2)}
                          </p>
                          <p className="text-gray-800 font-bold">
                            Rs.{discountedPrice.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-700">
                          Rs.{product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6 p-4 border rounded-md shadow-md border-gray-300 bg-white">
              <div>
                <label className="block text-lg font-medium text-gray-800 mb-2">
                  Delivery Address
                </label>

                {isEditingAddress ? (
                  <>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter delivery address..."
                    />
                    <button
                      onClick={handleSaveAddress}
                      disabled={isUpdating}
                      className={`mt-2 px-4 py-2 rounded-md text-white ${
                        isUpdating
                          ? "bg-purple-300 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 transition"
                      }`}
                    >
                      {isUpdating ? "Saving..." : "Save Address"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50 min-h-[72px] whitespace-pre-wrap">
                      {address || "No address provided"}
                    </div>
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="mt-2 px-4 py-2 bg-purple-400 text-white rounded-md hover:bg-purple-600 transition cursor-pointer"
                    >
                      Edit Address
                    </button>
                  </>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash On Delivery">Cash on Delivery</option>
                  <option value="eSewa">eSewa</option>
                </select>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h2 className="flex justify-between text-xl font-bold text-gray-600">
                  <span>SubTotal:</span>
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </h2>
                <h2 className="flex justify-between text-xl font-bold text-gray-600">
                  <span>Tax:</span>
                  <span>Rs.{tax.toFixed(2)}</span>
                </h2>
                <h2 className="flex justify-between text-xl font-bold text-gray-600">
                  <span>DeliveryCharge:</span>
                  <span>Rs.{shippingFee}</span>
                </h2>
                <h2 className="flex justify-between text-xl font-bold text-gray-600">
                  <span>Total:</span>
                  <span>Rs.{Math.round(totalAmount)}</span>
                </h2>

                <button
                  onClick={handleCheckout}
                  disabled={isOrdering}
                  className={`w-full bg-purple-400 text-white py-3 rounded-md font-semibold hover:bg-purple-600 transition ${
                    isOrdering
                      ? "cursor-not-allowed bg-purple-300"
                      : "cursor-pointer"
                  }`}
                >
                  {paymentMethod === "eSewa"
                    ? "Pay with eSewa"
                    : isOrdering
                    ? "Placing Order..."
                    : "Place Order"}
                </button>
                <button
                  className="w-full bg-red-400 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition cursor-pointer"
                  onClick={() => navigate("/cart")}
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-white shadow">
        <Footer />
      </footer>

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

export default Checkout;
