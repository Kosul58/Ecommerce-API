import { useState } from "react";
import Sidebar from "../components/sidebar/AdminSidebar";
import SideOverlay from "../components/sidebar/AdminSideOverlay";
import Orders from "../components/seller/Orders";
import { FaBars } from "react-icons/fa";
import { useAdminData } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export type Section =
  | "dashboard"
  | "products"
  | "logout"
  | "sellers"
  | "Orders"
  | "categories"
  | "discounts"
  | "support"
  | "message"
  | "setting";

const Dashboard = () => (
  <div className="p-4 text-gray-800 text-xl">Dashboard Details View</div>
);

const AdminDashboard = () => {
  const {
    data: adminData,
    isFetching: adminDataFetching,
    isError: adminDataError,
  } = useAdminData();
  console.log(adminData);
  const [selectedSection, setSelectedSection] = useState<Section>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  if (adminDataError) {
    alert("Error fetching Admin data");
    console.error("Error fetching admin data from the server:", adminDataError);
    navigate("/");
  }

  if (adminDataFetching) {
    return <p className="text-lg text-gray-700 p-4">Loading admin data...</p>;
  }

  if (!adminData || Object.keys(adminData).length === 0) {
    return (
      <p className="text-red-400 p-4">No Admin Found. Please log in again.</p>
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
          admin={adminData}
        />
      </div>

      <SideOverlay
        isOpen={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        activeKey={selectedSection}
        onSelect={handleSectionSelect}
        admin={adminData}
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
          {selectedSection === "products" && <div>Product details</div>}
          {selectedSection === "sellers" && <div>Seller details</div>}
          {selectedSection === "Orders" && <Orders seller={adminData} />}
          {selectedSection === "support" && <div>Support Content</div>}
          {selectedSection === "message" && <div>Message Content</div>}
          {selectedSection === "setting" && <div>Setting Content</div>}
        </div>
      </main>
    </section>
  );
};

export default AdminDashboard;
