import React, { useState } from "react";
import SellerProducts from "../components/seller/SellerProducts";
import AddProduct from "../components/seller/AddProduct";
import { useNavigate } from "react-router-dom";
import { useSellerData } from "../api/seller";

const SalesDetails = () => (
  <div className="text-white text-xl">Sales Details View</div>
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<
    | "sales"
    | "productdetails"
    | "viewproducts"
    | "addProduct"
    | "logout"
    | "seller"
  >("sales");

  const { data: sellerData, isError, isLoading } = useSellerData();
  console.log(sellerData);
  const logOut = () => {
    sessionStorage.removeItem("sellerdata");
    sessionStorage.removeItem("productdata");
    navigate("/");
  };
  return (
    <>
      {!sellerData || isLoading ? (
        <p>Loading...</p>
      ) : Object.keys(sellerData).length === 0 || isError ? (
        <p className="text-red-400">No Seller Found.</p>
      ) : (
        <section className="w-full h-screen absolute p-2 bg-white opacity-90 flex justify-center items-center">
          <div className="relative w-[95%] h-[95%] bg-gray-300 rounded-2xl flex flex-row justify-center items-center">
            {/* <div className="absolute top-4 right-4 flex justify-center items-center gap-2 ">
              {sellerData.result.image !== "Seller image" && (
                <img
                  src={sellerData.result.image}
                  alt="Seller"
                  className="size-15 rounded-full object-cover shadow-md"
                />
              )}
              <p className="text-2xl"> {sellerData.result.username}</p>
            </div> */}
            <aside className="w-[20%] h-[95%]  rounded-l-xl flex justify-center-safe items-center flex-col gap-3 p-2">
              <h1>Shop Name: {sellerData.username}</h1>

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
                onClick={() => setSelectedSection("productdetails")}
                className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                  selectedSection === "productdetails"
                    ? "bg-green-500 text-white"
                    : "bg-white"
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setSelectedSection("seller")}
                className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                  selectedSection === "seller"
                    ? "bg-green-500 text-white"
                    : "bg-white"
                }`}
              >
                My Details
              </button>
              <button
                onClick={() => setSelectedSection("viewproducts")}
                className={`w-full px-4 py-2 rounded shadow hover:bg-gray-400 ${
                  selectedSection === "viewproducts"
                    ? "bg-green-500 text-white"
                    : "bg-white"
                }`}
              >
                My Products
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
            <main className="w-[77%] h-[95%] rounded-r-xl flex justify-center items-center">
              {selectedSection === "sales" && <SalesDetails />}
              {selectedSection === "productdetails" && (
                <div>Product details</div>
              )}
              {selectedSection === "seller" && <div>Seller details</div>}
              {selectedSection === "viewproducts" && (
                <SellerProducts seller={sellerData} />
              )}
              {selectedSection === "addProduct" && <AddProduct />}
            </main>
          </div>
        </section>
      )}
    </>
  );
};

export default SellerDashboard;
