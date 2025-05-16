import React, { useEffect, useState } from "react";
import SellerProducts from "./SellerProducts";
import AddProduct from "./AddProduct";
import { useNavigate } from "react-router-dom";

const SalesDetails = () => (
  <div className="text-white text-xl">Sales Details View</div>
);

export interface Seller {
  id: string;
  username: string;
  email: string;
  phone: number;
  address: string;
  image: string;
}

export interface SellerResponse {
  result: Seller;
  token: string;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState<SellerResponse | null>(null);
  const [selectedSection, setSelectedSection] = useState<
    "sales" | "products" | "addProduct" | "logout"
  >("sales");

  useEffect(() => {
    const data = sessionStorage.getItem("sellerdata");
    if (data) {
      setSellerData(JSON.parse(data));
    } else {
      console.log("no data");
    }
  }, []);

  const logOut = () => {
    sessionStorage.removeItem("sellerdata");
    sessionStorage.removeItem("productdata");
    navigate("/");
  };
  return (
    <>
      {sellerData === null ? (
        <p>Loading...</p>
      ) : Object.keys(sellerData.result).length === 0 ? (
        <p>No Products Found.</p>
      ) : (
        <section className="w-full h-screen absolute p-2 bg-white opacity-90 flex justify-center items-center">
          <aside className="w-[20%] h-[95%] bg-sky-300 rounded-l-xl flex justify-center-safe items-center flex-col gap-3 p-2">
            <img
              src={sellerData.result.image}
              alt="Seller"
              className="size-20 rounded-full object-cover shadow-md"
            />
            <h1>Shop Name: {sellerData.result.username}</h1>

            <button
              onClick={() => setSelectedSection("sales")}
              className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                selectedSection === "sales"
                  ? "bg-green-500 text-white"
                  : "bg-white"
              }`}
            >
              Sales Details
            </button>
            <button
              onClick={() => setSelectedSection("products")}
              className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                selectedSection === "products"
                  ? "bg-green-500 text-white"
                  : "bg-white"
              }`}
            >
              Seller Products
            </button>
            <button
              onClick={() => setSelectedSection("addProduct")}
              className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                selectedSection === "addProduct"
                  ? "bg-green-500 text-white"
                  : "bg-white"
              }`}
            >
              Add Product
            </button>

            <button
              onClick={() => logOut()}
              className={`w-full px-4 py-2 rounded shadow bg-red-400 cursor-pointer  hover:bg-red-500`}
            >
              Log Out
            </button>
          </aside>
          <main className="w-[77%] h-[95%] bg-indigo-300 rounded-r-xl flex justify-center items-center">
            {selectedSection === "sales" && <SalesDetails />}
            {selectedSection === "products" && (
              <SellerProducts seller={sellerData.result} />
            )}
            {selectedSection === "addProduct" && <AddProduct />}
          </main>
        </section>
      )}
    </>
  );
};

export default SellerDashboard;
