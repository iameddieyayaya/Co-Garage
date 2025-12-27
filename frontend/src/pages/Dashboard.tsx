import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
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
            <button className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition">
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

