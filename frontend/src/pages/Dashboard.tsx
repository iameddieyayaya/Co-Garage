import Modal from "../components/Modal"
import React, { useState } from "react";
import { Link } from "react-router-dom";


const Dashboard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [bayDescription, setBayDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token"); 
    console.log({token})
    const res = await fetch("/api/v1/bays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bay: {
          description: bayDescription,
          hourly_rate: hourlyRate,
          available: true,
        },
      }),
    });
  
    if (res.ok) {
      alert("Bay added successfully!");
      setBayDescription("");
      setHourlyRate(0);
      setModalOpen(false);
    } else {
      const err = await res.json();
      console.error(err);
      alert("Failed to add bay");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-500 tracking-widest">CoGarage</h1>
          <nav className="space-x-6">
            <Link to="/" className="hover:text-blue-500 font-semibold transition">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-blue-500 mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome to your garage owner dashboard</p>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Add a New Bay"
          actionText="Save Bay"
          onAction={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bay Description
            </label>
            <input
              type="text"
              placeholder="Bay description"
              value={bayDescription}
              onChange={(e) => setBayDescription(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hourly Rate
            </label>
            <input
              type="number"
              placeholder="Hourly rate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
        </Modal>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-500">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Active Bays</h3>
            <p className="text-3xl font-bold text-blue-500">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-blue-500">$0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition"
              onClick={() => setModalOpen(true)}
            >
              Add New Bay
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition">
              Add New Tool
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-semibold transition">
              View Bookings
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-semibold transition">
              Manage Shop
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

