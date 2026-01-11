import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import GarageOwnerSignup from "./pages/GarageOwnerSignup";
import Dashboard from "./pages/Dashboard";
import ShopOnboarding from "./pages/ShopOnboarding";
import Booking from "./pages/Booking";
import RequireAuth from "./components/RequireAuth";
import { ToastProvider } from "./components/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book" element={<Booking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/owners/signup" element={<GarageOwnerSignup />} />
              <Route
                path="/onboarding/shop"
                element={
                  <RequireAuth>
                    <ShopOnboarding />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
