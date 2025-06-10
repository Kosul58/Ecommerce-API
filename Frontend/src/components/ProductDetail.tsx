import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllProducts, useAddCart } from "../hooks/useAuth";
import type { Product } from "../hooks/useAuth";
import { IoIosAddCircleOutline } from "react-icons/io";
import ImageSlider from "./imageslider/ImageSlider";
import NavBar from "./navbar/Navbar";
import Button from "./buttons/Buttons";

const ProductDetail = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useAllProducts();
  const {
    mutate: addToCart,
    isPending,
    isSuccess,
    isError: isAddError,
  } = useAddCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Loading product details...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-600 mt-10 text-lg font-medium">
        Failed to load product. Please try again later.
      </div>
    );
  }

  const product = products.find((p: Product) => p.id === pid);

  if (!product) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p className="text-2xl font-semibold mb-4">Product not found.</p>
        <Button onClick={() => navigate(-1)} variant="primary" size="medium">
          ← Go Back
        </Button>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ["https://via.placeholder.com/400x300?text=No+Image"];

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(
      1,
      Math.min(product.inventory, Number(e.target.value))
    );
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (product && product.id && quantity > 0) {
      addToCart({ productid: product.id, quantity });
    }
  };

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : null;

  return (
    <>
      <div className="sticky top-0 z-50">
        <NavBar />
      </div>

      <div className="w-full min-h-screen">
        <section className="p-8 bg-white overflow-hidden flex flex-col lg:flex-row gap-8 border-b border-gray-200 min-h-[80vh] justify-between">
          <div className="lg:w-3/5 relative rounded-lg overflow-hidden z-30 flex items-center justify-center bg-gray-100">
            <ImageSlider images={images} />
          </div>
          <div className="lg:w-2/5 flex flex-col justify-between py-4">
            <div>
              <h1 className="text-3xl max-md:text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-gray-700 text-lg max-sm:text-md leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>

              <div className="flex items-baseline gap-3 mb-6">
                {discountedPrice !== null ? (
                  <>
                    <span className="text-gray-500 line-through text-2xl font-semibold">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-gray-700 font-extrabold text-3xl">
                      Rs. {discountedPrice.toLocaleString()}
                    </span>
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-gray-700 font-extrabold text-3xl max-sm:text-xl">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label
                  htmlFor="quantity"
                  className="font-medium text-gray-700 text-lg"
                >
                  Quantity:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.inventory}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={product.inventory <= 0}
                />
              </div>

              {isSuccess && (
                <p className="text-green-600 font-medium mb-4 p-2 bg-green-100 rounded-md">
                  Added to cart successfully!
                </p>
              )}
              {isAddError && (
                <p className="text-red-500 font-medium mb-4 p-2 bg-red-100 rounded-md">
                  Failed to add to cart. Try again.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-5 items-center mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => navigate(-1)}
                variant="secondary"
                size="medium"
                className="flex items-center gap-2"
              >
                ← Back to Products
              </Button>

              <Button
                onClick={handleAddToCart}
                disabled={product.inventory <= 0 || isPending}
                variant="primary"
                size="medium"
                className="flex items-center gap-2"
              >
                {isPending ? "Adding..." : "Add to Cart"}
                {!isPending && <IoIosAddCircleOutline size={20} />}
              </Button>
            </div>
          </div>
        </section>
        <section className="p-6 w-full mx-auto bg-white border-b border-gray-300 mt-8">
          <h2 className="text-3xl w-full border-b border-gray-300 font-bold text-gray-900 mb-6 py-4">
            Customer Reviews
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-gray-800">John Doe</p>
                <span className="ml-3 text-yellow-500">★★★★★</span>
              </div>
              <p className="text-gray-700">
                "Absolutely love this product! It exceeded my expectations.
                Highly recommend it to everyone."
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reviewed on May 28, 2025
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-gray-800">Jane Smith</p>
                <span className="ml-3 text-yellow-500">★★★★☆</span>
              </div>
              <p className="text-gray-700">
                "Good product for the price. The quality is decent, but there's
                room for improvement in delivery time."
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reviewed on May 20, 2025
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <p className="font-semibold text-gray-800">Mike Johnson</p>
                <span className="ml-3 text-yellow-500">★★★☆☆</span>
              </div>
              <p className="text-gray-700">
                "It's alright. Does what it's supposed to do, nothing
                spectacular. Packaging could be better."
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reviewed on May 15, 2025
              </p>
            </div>
          </div>
          <Button className="mt-8" variant="primary" size="medium">
            Write a Review
          </Button>
        </section>
        <section className="p-6 w-full mx-auto bg-white rounded-xl shadow-lg mt-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 py-4 border-b border-gray-300">
            Message Seller
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="messageSubject"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <input
                type="text"
                id="messageSubject"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Inquiry about product features"
              />
            </div>
            <div>
              <label
                htmlFor="messageContent"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Your Message
              </label>
              <textarea
                id="messageContent"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <Button type="submit" variant="primary" size="medium">
              Send Message
            </Button>
          </form>
        </section>
      </div>
    </>
  );
};

export default ProductDetail;
