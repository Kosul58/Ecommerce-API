import { useState } from "react";
import SellerProducts from "../components/seller/SellerProducts";
import AddProduct from "../components/seller/AddProduct";
import { useNavigate } from "react-router-dom";
import { useSellerData } from "../api/seller";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";

type Section =
  | "sales"
  | "productdetails"
  | "viewproducts"
  | "addProduct"
  | "logout"
  | "seller"
  | "Orders";

const menuItems: { key: Section; label: string }[] = [
  { key: "sales", label: "Sales Details" },
  { key: "productdetails", label: "Product Details" },
  { key: "seller", label: "My Details" },
  { key: "viewproducts", label: "My Products" },
  { key: "Orders", label: "Orders" },
  { key: "addProduct", label: "Add Product" },
];

const SalesDetails = () => (
  <div className="text-white text-xl">Sales Details View</div>
);

const Orders = () => (
  <div className="text-white text-xl">Orders Details View</div>
);
const SellerDashboard = () => {
  const navigate = useNavigate();
  const [hideHamburger, setHideHamburger] = useState(true); // true means hidden
  const [selectedSection, setSelectedSection] = useState<
    | "sales"
    | "productdetails"
    | "viewproducts"
    | "addProduct"
    | "logout"
    | "seller"
    | "Orders"
  >("sales");

  const { data: sellerData, isError, isLoading } = useSellerData();
  const logOut = () => {
    sessionStorage.removeItem("sellerdata");
    sessionStorage.removeItem("productdata");
    navigate("/");
  };
  if (!sellerData || isLoading) return <p>Loading...</p>;
  if (Object.keys(sellerData).length === 0 || isError)
    return <p className="text-red-400">No Seller Found.</p>;

  return (
    <section className="w-full h-screen absolute bg-indigo-300 opacity-90 flex justify-center items-center">
      <aside className="absolute top-0 left-0 w-[10%] min-w-[200px] h-full flex items-center flex-col gap-10 p-2 rounded-r-3xl bg-blue-500 overflow-auto max-md:hidden z-10">
        <h1 className="mt-5 text-white text-2xl">{sellerData.username}</h1>
        <ul className="flex flex-col gap-3 w-full">
          {menuItems.map(({ key, label }) => (
            <li
              key={key}
              onClick={() => {
                setSelectedSection(key);
                setHideHamburger(true);
              }}
              className={`w-full px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 hover:text-white hover:scale-105 ${
                selectedSection === key ? "bg-sky-300 text-white" : "bg-inherit"
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
        <button
          onClick={() => logOut()}
          className="w-full px-4 py-2 rounded shadow bg-red-200 cursor-pointer hover:bg-red-500"
        >
          Log Out
        </button>
      </aside>

      <GiHamburgerMenu
        className="absolute top-4 left-4 text-3xl cursor-pointer max-md:block hidden z-50"
        onClick={() => setHideHamburger(false)}
      />

      {!hideHamburger && (
        <aside className="fixed top-0 left-0 w-[70%] max-w-xs h-full bg-indigo-400 p-4 flex flex-col gap-6 z-50 overflow-auto min-md:hidden">
          <div className="flex justify-end">
            <AiOutlineClose
              className="text-white text-2xl cursor-pointer"
              onClick={() => setHideHamburger(true)}
            />
          </div>
          <h1 className="text-white text-2xl">{sellerData.username}</h1>
          <ul className="flex flex-col gap-3 w-full">
            {menuItems.map(({ key, label }) => (
              <li
                key={key}
                onClick={() => {
                  setSelectedSection(key);
                  setHideHamburger(true);
                }}
                className={`w-full px-4 py-2 rounded cursor-pointer hover:bg-indigo-500 hover:text-white hover:scale-105 ${
                  selectedSection === key
                    ? "bg-sky-300 text-black"
                    : "bg-inherit"
                }`}
              >
                {label}
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              logOut();
              setHideHamburger(true);
            }}
            className="w-full px-4 py-2 rounded shadow bg-red-400 cursor-pointer hover:bg-red-500 "
          >
            Log Out
          </button>
        </aside>
      )}

      <main className="w-[90%] h-full rounded-r-xl flex justify-center items-center relative">
        {selectedSection === "sales" && <SalesDetails />}
        {selectedSection === "productdetails" && <div>Product details</div>}
        {selectedSection === "seller" && <div>Seller details</div>}
        {selectedSection === "viewproducts" && (
          <SellerProducts seller={sellerData} />
        )}
        {selectedSection === "addProduct" && <AddProduct />}
        {selectedSection === "Orders" && <Orders />}
      </main>
    </section>
  );
};

export default SellerDashboard;
