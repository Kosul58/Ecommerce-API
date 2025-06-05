import React from "react";
import { useNavigate } from "react-router-dom";
import HomeImageSlider from "./imageslider/HomeImageSlider";
import clothes from "../assets/images/clothes.jpg";
import electronics from "../assets/images/electronics.jpg";
import home from "../assets/images/home.jpg";
import shoes from "../assets/images/shoes.jpg";
import furniture from "../assets/images/furniture.jpg";
const HeroPage = () => {
  const navigate = useNavigate();
  const slides = [
    {
      image: clothes,
      link: "/products/category/clothes",
      title: "Trendy Fashion Collection",
      description:
        "Explore the latest trends in fashion and elevate your wardrobe.",
      buttonText: "Shop Clothing",
    },
    {
      image: electronics,
      link: "/products/category/electronics",
      title: "Smart Electronics for Modern Living",
      description: "Find the best gadgets, devices, and smart home essentials.",
      buttonText: "Explore Electronics",
    },
    {
      image: home,
      link: "/products/category/home",
      title: "Home Essentials & Decor",
      description:
        "Upgrade your home with our essentials and stylish decor items.",
      buttonText: "Discover Home Goods",
    },
    {
      image: shoes,
      link: "/products/category/shoes",
      title: "Premium Footwear Collection",
      description:
        "Find your perfect pair from casual sneakers to elegant heels.",
      buttonText: "Browse Shoes",
    },
    {
      image: furniture,
      link: "/products/category/furniture",
      title: "Comfortable & Affordable Furniture",
      description:
        "Create your ideal living space with our wide range of furniture.",
      buttonText: "View Furniture",
    },
  ];

  const themedCategories = [
    {
      title: "Shop for Your Home Essentials",
      description: "Everything you need to make your house a home.",
      image: home,
      link: "/categories/home-essentials",
    },
    {
      title: "Get Your Game On!",
      description: "The latest consoles, games, and accessories.",
      image: electronics,
      link: "/categories/gaming",
    },
    {
      title: "Fashion for Less",
      description: "Stay stylish without breaking the bank.",
      image: clothes,
      link: "/categories/fashion",
    },
    {
      title: "Top Categories in Kitchen Appliances",
      description: "Cook and create with our premium kitchen gear.",
      image: electronics,
      link: "/categories/kitchen-appliances",
    },
    {
      title: "Smart Devices & Wearables",
      description: "Stay connected and track your fitness.",
      image: electronics,
      link: "/categories/smart-devices",
    },
    {
      title: "Outdoor & Camping Gear",
      description: "Adventure awaits with our durable outdoor equipment.",
      image: shoes,
      link: "/categories/outdoor",
    },
    {
      title: "Books & Media",
      description: "Dive into new worlds with our extensive collection.",
      image: furniture,
      link: "/categories/books-media",
    },
  ];

  const dealsOfTheDay = [
    {
      id: 1,
      name: "Wireless Headphones",
      image: electronics,
      originalPrice: "$99.99",
      discountedPrice: "$59.99",
      link: "/products/deal/1",
    },
    {
      id: 2,
      name: "Smartwatch Pro",
      image: electronics,
      originalPrice: "$149.99",
      discountedPrice: "$109.99",
      link: "/products/deal/2",
    },
    {
      id: 3,
      name: "Ergonomic Office Chair",
      image: electronics,
      originalPrice: "$299.99",
      discountedPrice: "$199.99",
      link: "/products/deal/3",
    },
  ];

  const newArrivals = [
    {
      id: 4,
      name: "Boho Chic Dress",
      image: clothes,
      price: "$45.00",
      link: "/products/new/4",
    },
    {
      id: 5,
      name: "Portable Bluetooth Speaker",
      image: electronics,
      price: "$75.00",
      link: "/products/new/5",
    },
    {
      id: 6,
      name: "Cozy Throw Blanket",
      image: home,
      price: "$28.00",
      link: "/products/new/6",
    },
    {
      id: 7,
      name: "Running Shoes X",
      image: shoes,
      price: "$89.00",
      link: "/products/new/7",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Jane Doe",
      avatar: electronics,
      review:
        "Absolutely love the quality and quick delivery! This is my go-to store for everything.",
      rating: 5,
    },
    {
      id: 2,
      name: "John Smith",
      avatar: electronics,
      review:
        "Great selection and even better prices. The customer service is exceptional!",
      rating: 4,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <section className="w-full bg-gray-50 pb-16">
      <div className="relative w-full overflow-hidden">
        <HomeImageSlider slides={slides} interval={4000} />
      </div>
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
          Explore Our Diverse Categories
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {themedCategories.map((category, index) => (
            <div
              key={index}
              className="group relative h-72 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer
                         w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)]"
              onClick={() => handleNavigate(category.link)}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-xl font-bold text-white mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-200 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {category.description}
                </p>
                <button className="self-start text-white text-sm font-semibold border border-white px-4 py-2 rounded-full hover:bg-white hover:text-gray-900 transition-colors duration-300">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl overflow-hidden relative">
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0 relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
              Flash Sale Alert!
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-4">
              Get an incredible **30% OFF** on selected items for a limited
              time!
            </p>
            <p className="text-sm opacity-80">
              *Sale ends: Friday, May 31, 2025*
            </p>{" "}
          </div>
          <button
            onClick={() => handleNavigate("/products?sale=true")}
            className="bg-white text-purple-700 hover:bg-gray-200 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 relative z-10 text-lg"
          >
            Shop Sale Items
          </button>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 text-center mb-12">
          🔥 Deals of the Day 🔥
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dealsOfTheDay.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => handleNavigate(deal.link)}
            >
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SALE!
                </span>
              </div>
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {deal.name}
                  </h4>
                  <p className="text-gray-500 text-sm line-through">
                    {deal.originalPrice}
                  </p>
                  <p className="text-2xl font-extrabold text-purple-600 mb-4">
                    {deal.discountedPrice}
                  </p>
                </div>
                <button className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold">
                  Grab Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
          ✨ New Arrivals ✨
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => handleNavigate(product.link)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  {product.name}
                </h3>
                <p className="text-purple-600 font-bold text-xl mb-3">
                  {product.price}
                </p>
                <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition-colors duration-300">
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => handleNavigate("/products/new-arrivals")}
            className="px-8 py-3 bg-gray-800 text-white rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors duration-300 shadow-lg"
          >
            View All New Arrivals
          </button>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 max-w-7xl mx-auto rounded-lg shadow-inner">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
          Why Shop With Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center border-b-4 border-purple-500">
            <span className="text-5xl text-purple-600 mb-4 animate-bounce-y">
              ⭐
            </span>
            <h3 className="font-semibold text-xl mb-2 text-gray-800">
              Premium Quality
            </h3>
            <p className="text-gray-600 text-sm">
              Only the best products hand-picked for you.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center border-b-4 border-blue-500">
            <span className="text-5xl text-blue-600 mb-4 animate-bounce-y animation-delay-100">
              🚚
            </span>
            <h3 className="font-semibold text-xl mb-2 text-gray-800">
              Fast & Reliable Delivery
            </h3>
            <p className="text-gray-600 text-sm">
              Your order, delivered quickly and safely.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center border-b-4 border-green-500">
            <span className="text-5xl text-green-600 mb-4 animate-bounce-y animation-delay-200">
              🔒
            </span>
            <h3 className="font-semibold text-xl mb-2 text-gray-800">
              Secure Payments
            </h3>
            <p className="text-gray-600 text-sm">
              Shop with confidence, your data is safe.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center border-b-4 border-yellow-500">
            <span className="text-5xl text-yellow-600 mb-4 animate-bounce-y animation-delay-300">
              📞
            </span>
            <h3 className="font-semibold text-xl mb-2 text-gray-800">
              24/7 Customer Support
            </h3>
            <p className="text-gray-600 text-sm">
              Always here to assist you, day or night.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white max-w-7xl mx-auto mt-16 rounded-lg shadow">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 p-6 rounded-lg shadow-md border-t-4 border-purple-500 flex flex-col items-center text-center"
            >
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-20 h-20 rounded-full object-cover mb-4 ring-2 ring-purple-300"
              />
              <p className="text-gray-700 italic text-lg mb-4">
                "{testimonial.review}"
              </p>
              <div className="flex text-yellow-400 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      i < testimonial.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="font-semibold text-purple-700">
                - {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default HeroPage;
