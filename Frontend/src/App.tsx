import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import SellerDashboard from "./pages/SellerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
const App = () => {
  const [sellerSigned, setSellerSigned] = useState(true);
  return (
    <>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </>
  );
};

export default App;
