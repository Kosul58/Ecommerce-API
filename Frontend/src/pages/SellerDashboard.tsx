import { useState } from "react";
import SellerProducts from "../components/seller/SellerProducts";
import AddProduct from "../components/seller/AddProduct";
import { useSellerData } from "../api/seller";
import Sidebar from "../components/sidebar/SellerSidebar";
import SellerSideOverlay from "../components/sidebar/SellerSideOverlay";
import type { Datum, Seller } from "../types/sellertypes";
import ManageProduct from "../components/seller/ManageProduct";
import Orders from "../components/seller/Orders";
import { FaBars } from "react-icons/fa";

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
  | "profile"
  | "setting";

const Dashboard = () => (
  <div className="p-4 text-gray-800 text-xl">Dashboard Details View</div>
);

const SellerDashboard = () => {
  const [selectedSection, setSelectedSection] = useState<Section>("dashboard");
  const [productData, setProductData] = useState<Datum | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    data: sellerData,
    isLoading: isSellerLoading,
    isError: isSellerError,
  } = useSellerData();
  console.log(sellerData);

  if (isSellerError) {
    console.error("Error fetching seller data from the server:", isSellerError);
    return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-700 p-4">
        <p>Error loading seller data. Please try again later.</p>
      </div>
    );
  }

  if (isSellerLoading) {
    return <p className="text-lg text-gray-700 p-4">Loading seller data...</p>;
  }

  if (!sellerData || Object.keys(sellerData).length === 0) {
    return (
      <p className="text-red-400 p-4">No Seller Found. Please log in again.</p>
    );
  }

  const openMobileSidebar = () => setMobileSidebarOpen(true);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    closeMobileSidebar();
  };

  return (
    <section className="w-full h-screen absolute bg-slate-100 flex overflow-hidden">
      <div className="max-[500px]:hidden">
        <Sidebar
          activeKey={selectedSection}
          onSelect={handleSectionSelect}
          seller={sellerData}
        />
      </div>

      <SellerSideOverlay
        isOpen={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        activeKey={selectedSection}
        onSelect={handleSectionSelect}
        seller={sellerData}
      />

      <main className="w-full max-h-full flex flex-col relative overflow-auto">
        <div className="min-[500px]:hidden bg-white p-4 shadow flex justify-between items-center">
          <button
            onClick={openMobileSidebar}
            className="text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open menu"
          >
            <FaBars className="text-2xl" />{" "}
          </button>
          <span className="text-gray-700 font-medium">Seller Dashboard</span>
        </div>

        <div className="flex-grow">
          {selectedSection === "dashboard" && <Dashboard />}
          {selectedSection === "productdetails" && <div>Product details</div>}
          {selectedSection === "seller" && <div>Seller details</div>}
          {selectedSection === "viewproducts" && (
            <SellerProducts
              seller={sellerData as Seller}
              setProductData={setProductData}
            />
          )}
          {selectedSection === "addProduct" && <AddProduct />}
          {selectedSection === "Orders" && <Orders seller={sellerData} />}
          {selectedSection === "editProduct" && !productData && (
            <div>No Product Selected for Editing</div>
          )}

          {selectedSection === "manageProduct" && (
            <ManageProduct sellerId={sellerData.id} />
          )}
          {selectedSection === "manageOrders" && (
            <div>Manage Orders Content</div>
          )}
          {selectedSection === "trackOrder" && <div>Track Order Content</div>}
          {selectedSection === "support" && <div>Support Content</div>}
          {selectedSection === "message" && <div>Message Content</div>}
          {selectedSection === "setting" && <div>Setting Content</div>}
        </div>
      </main>
    </section>
  );
};

export default SellerDashboard;
