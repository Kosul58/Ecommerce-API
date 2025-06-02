import { useState } from "react";
import SellerProducts from "../components/seller/SellerProducts";
import AddProduct from "../components/seller/AddProduct";
import { useNavigate } from "react-router-dom";
import { useSellerData } from "../api/seller";
import Sidebar from "../components/seller/SellerSidebar";
import type { Datum, Seller } from "../types/sellertypes";
import EditProduct from "../components/seller/EditProduct";
import ManageProduct from "../components/seller/ManageProduct";

export type Section =
  | "dashboard"
  | "productdetails"
  | "viewproducts"
  | "addProduct"
  | "logout"
  | "seller"
  | "Orders"
  | "editProduct"
  | "manageProduct"
  | "manageOrders"
  | "trackOrder"
  | "support"
  | "message"
  | "setting";

const Dashboard = () => (
  <div className="text-white text-xl">Dashboard Details View</div>
);

const Orders = () => (
  <div className="text-white text-xl">Orders Details View</div>
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<Section>("dashboard");
  const [productData, setProductData] = useState<Datum | null>(null);
  const {
    data: sellerData,
    isLoading: isSellerLoading,
    isError: isSellerError,
  } = useSellerData();
  console.log(sellerData);

  const logOut = () => {
    sessionStorage.removeItem("sellerdata");
    sessionStorage.removeItem("productdata");
    navigate("/");
  };
  if (isSellerError) {
    alert("Error fetching seller data from the server. Please try again.");
    navigate("/");
    return null;
  }

  if (isSellerLoading || !sellerData) {
    return <p className="text-lg text-gray-700 p-4">Loading seller data...</p>;
  }

  if (Object.keys(sellerData).length === 0) {
    return (
      <p className="text-red-400 p-4">No Seller Found. Please log in again.</p>
    );
  }

  return (
    <section className="w-full h-screen absolute bg-slate-100 opacity-90 flex">
      <Sidebar
        activeKey={selectedSection}
        onSelect={setSelectedSection}
        onLogout={logOut}
        seller={sellerData}
      />
      <main className="w-full h-full flex justify-center items-center relative overflow-auto">
        {selectedSection === "dashboard" && <Dashboard />}
        {selectedSection === "productdetails" && <div>Product details</div>}
        {selectedSection === "seller" && <div>Seller details</div>}
        {selectedSection === "viewproducts" && (
          <SellerProducts
            seller={sellerData as Seller}
            setProductData={setProductData}
            onEdit={setSelectedSection}
          />
        )}
        {selectedSection === "addProduct" && <AddProduct />}
        {selectedSection === "Orders" && <Orders />}
        {selectedSection === "editProduct" && !productData && (
          <div>No Product Selected for Editing</div>
        )}
        {selectedSection === "editProduct" && productData && (
          <EditProduct
            product={productData as Datum}
            onCancel={() => setProductData(null)}
          />
        )}
        {selectedSection === "manageProduct" && (
          <ManageProduct sellerId={sellerData.id} />
        )}
        {selectedSection === "manageOrders" && <div>Manage Orders Content</div>}
        {selectedSection === "trackOrder" && <div>Track Order Content</div>}
        {selectedSection === "support" && <div>Support Content</div>}
        {selectedSection === "message" && <div>Message Content</div>}
        {selectedSection === "setting" && <div>Setting Content</div>}
      </main>
    </section>
  );
};

export default SellerDashboard;
