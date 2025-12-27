import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GarageOwnerSignup from "./pages/GarageOwnerSignup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/owners/signup" element={<GarageOwnerSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}