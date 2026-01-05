import Modal from "../components/Modal"
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { baysAPI, bookingsAPI, toolsAPI } from "../services/api";
import type { Bay, Booking, Tool } from "../types";


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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [checkoutBookingId, setCheckoutBookingId] = useState<number | null>(null);

  const refreshBays = async () => {
    const data = await baysAPI.list()
    setBays(data)
  }

  const refreshTools = async () => {
    const data = await toolsAPI.list()
    setTools(data)
  }

  const refreshBookings = async () => {
    const data = await bookingsAPI.listForOwner()
    setBookings(data)
  }

  useEffect(() => {
    refreshBays().catch(console.error)
    refreshTools().catch(console.error)
    refreshBookings().catch(console.error)
  }, []);

  const activeBaysCount = useMemo(() => {
    return bays.filter((b) => b.available === true).length
  }, [bays])

  const activeToolsCount = useMemo(() => {
    return tools.filter((t) => t.available === true).length
  }, [tools])

  const totalBookingsCount = bookings.length
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "pending"), [bookings])

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

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      const res = await bookingsAPI.accept(bookingId)
      setCheckoutUrl(res.checkout_url)
      setCheckoutBookingId(bookingId)
      setCheckoutModalOpen(true)
      await refreshBookings()
    } catch (err) {
      console.error(err)
      alert("Failed to accept booking")
    }
  }

  const handleDeclineBooking = async (bookingId: number) => {
    try {
      await bookingsAPI.decline(bookingId)
      await refreshBookings()
    } catch (err) {
      console.error(err)
      alert("Failed to decline booking")
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

        <Modal
          isOpen={isCheckoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title="Payment Link"
          actionText="Close"
          onAction={() => setCheckoutModalOpen(false)}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Share this Stripe Checkout link with the guest to complete payment for booking {checkoutBookingId ? `#${checkoutBookingId}` : ""}.
          </p>
          <input
            type="text"
            readOnly
            value={checkoutUrl}
            className="w-full rounded border border-gray-300 p-2"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-gray-900 px-6 py-3 rounded-md font-semibold transition"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(checkoutUrl)
                alert("Copied payment link!")
              } catch {
                alert("Copy failed—please copy manually.")
              }
            }}
          >
            Copy link
          </button>
        </Modal>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-500">{totalBookingsCount}</p>
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

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-blue-500">Booking Requests</h3>
            <p className="text-sm text-gray-400">{pendingBookings.length} pending</p>
          </div>

          {pendingBookings.length === 0 ? (
            <p className="text-gray-400">No pending booking requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((b) => (
                <div key={b.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-400">
                        {b.guest_name} • {b.guest_email}
                      </p>
                      <p className="font-semibold">
                        {b.bay?.description || `Bay #${b.bay_id}`} • ${Number(b.total_price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-gray-900 px-4 py-2 rounded-md font-semibold transition"
                        onClick={() => handleAcceptBooking(b.id)}
                      >
                        Accept & Get Payment Link
                      </button>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition"
                        onClick={() => handleDeclineBooking(b.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
