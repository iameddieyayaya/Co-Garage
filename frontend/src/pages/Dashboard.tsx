import Modal from "../components/Modal"
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { baysAPI, toolsAPI } from "../services/api";
import type { Bay, Tool } from "../types";


const Dashboard: React.FC = () => {
  const [isBayModalOpen, setBayModalOpen] = useState(false);
  const [isToolModalOpen, setToolModalOpen] = useState(false);
  const [bayDescription, setBayDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolDayRate, setToolDayRate] = useState(0);
  const [bays, setBays] = useState<Bay[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  const refreshBays = async () => {
    const data = await baysAPI.list()
    setBays(data)
  }

  const refreshTools = async () => {
    const data = await toolsAPI.list()
    setTools(data)
  }

  useEffect(() => {
    refreshBays().catch(console.error)
    refreshTools().catch(console.error)
  }, []);

  const activeBaysCount = useMemo(() => {
    return bays.filter((b) => b.available === true).length
  }, [bays])

  const activeToolsCount = useMemo(() => {
    return tools.filter((t) => t.available === true).length
  }, [tools])

  const handleCreateBay = async () => {
    try {
      await baysAPI.create({
        description: bayDescription,
        hourly_rate: hourlyRate,
        available: true,
      })
      alert("Bay added successfully!");
      setBayDescription("");
      setHourlyRate(0);
      setBayModalOpen(false);
      await refreshBays()
    } catch (err) {
      console.error(err);
      alert("Failed to add bay");
    }
  };

  const handleCreateTool = async () => {
    try {
      await toolsAPI.create({
        name: toolName,
        description: toolDescription || undefined,
        day_rate: toolDayRate,
        available: true,
      })
      alert("Tool added successfully!");
      setToolName("");
      setToolDescription("");
      setToolDayRate(0);
      setToolModalOpen(false);
      await refreshTools()
    } catch (err) {
      console.error(err);
      alert("Failed to add tool");
    }
  }

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
          isOpen={isBayModalOpen}
          onClose={() => setBayModalOpen(false)}
          title="Add a New Bay"
          actionText="Save Bay"
          onAction={handleCreateBay}
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

        <Modal
          isOpen={isToolModalOpen}
          onClose={() => setToolModalOpen(false)}
          title="Add a New Tool"
          actionText="Save Tool"
          onAction={handleCreateTool}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              placeholder="Tool name"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="Short description"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Day Rate
            </label>
            <input
              type="number"
              placeholder="Day rate"
              value={toolDayRate}
              onChange={(e) => setToolDayRate(parseFloat(e.target.value))}
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
            <p className="text-3xl font-bold text-blue-500">{activeBaysCount}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Active Tools</h3>
            <p className="text-3xl font-bold text-blue-500">{activeToolsCount}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition"
              onClick={() => setBayModalOpen(true)}
            >
              Add New Bay
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition"
              onClick={() => setToolModalOpen(true)}
            >
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
