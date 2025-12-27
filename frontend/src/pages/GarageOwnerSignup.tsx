import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../services/api";

const GarageOwnerSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      await userApi.signup(formData);
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">
      
      {/* Left: Brand / Image */}
      <div className="hidden lg:flex relative">
        <img
          src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf"
          alt="Professional garage workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 p-16 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Monetize Your Garage
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-md">
            List bays. Rent tools. Get paid automatically with Stripe.
          </p>
        </div>
      </div>

      {/* Right: Signup */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-wide bg-orange-600/20 text-orange-500 rounded-full">
            Garage Owners Only
          </span>

          <h2 className="text-3xl font-bold mb-2">
            Create Your Garage Owner Account
          </h2>

          <p className="text-gray-400 mb-8">
            Start accepting bookings and payments in minutes.
          </p>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
              <ul className="text-sm text-red-400">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Owner / Business Name"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Business Email"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed transition py-3 rounded-md font-semibold tracking-wide"
            >
              {isLoading ? "Creating Account..." : "Create Owner Account"}
            </button>
          </form>

          {/* Trust / Stripe */}
          <div className="mt-6 text-sm text-gray-400">
            ✔ Secure payouts via Stripe  
            <br />
            ✔ You control pricing & availability  
            <br />
            ✔ Cancel anytime
          </div>

          <p className="mt-8 text-xs text-gray-500 text-center">
            By signing up, you agree to CoGarage’s Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GarageOwnerSignup;