import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerDashboard from "./pages/SellerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VerifySeller from "./components/verify/VerifySeller";
import VerifyUser from "./components/verify/VerifyUser";
const queryClient = new QueryClient();
import Seller from "./pages/Seller";
import User from "./pages/User";
import LandingPage from "./pages/LandingPage";
import Products from "./pages/Products";
import ProductDetail from "./components/ProductDetail";
const App = () => {
  const [sellerSigned, setSellerSigned] = useState(true);
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route
              path="/sellerdashboard"
              element={
                <ProtectedRoute isAuthenticated={sellerSigned}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            ></Route>
            <Route path="/landingpage" element={<LandingPage />}></Route>
            <Route path="/seller" element={<Seller />} />
            <Route path="/seller/verify" element={<VerifySeller />} />
            <Route path="/user" element={<User />} />
            <Route path="/user/verify" element={<VerifyUser />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:pid" element={<ProductDetail />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  );
};

export default App;
