import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import SellerDashboard from "./components/seller/SellerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";

const App = () => {
  const [sellerSigned, setSellerSigned] = useState(false);
  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <main className="w-full h-screen flex flex-col min-h-fit bg-black gap-4 justify-center items-center">
                  <NavBar setSellerSigned={setSellerSigned} />
                </main>
              </>
            }
          ></Route>
          <Route
            path="/sellerdashboard"
            element={
              <ProtectedRoute isAuthenticated={sellerSigned}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
