import Modal from "../components/Modal"
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { baysAPI, bookingsAPI, stripeConnectAPI, toolsAPI } from "../services/api";
import type { Bay, Booking, Tool } from "../types";


const Dashboard: React.FC = () => {
  const [isBayModalOpen, setBayModalOpen] = useState(false);
  const [isToolModalOpen, setToolModalOpen] = useState(false);
  const [isBookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [bayDescription, setBayDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolDayRate, setToolDayRate] = useState(0);
  const [bays, setBays] = useState<Bay[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsFilter, setBookingsFilter] = useState<Booking["status"] | "all">("all");
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [checkoutBookingId, setCheckoutBookingId] = useState<number | null>(null);
  const [checkoutEmailSent, setCheckoutEmailSent] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<null | Awaited<ReturnType<typeof stripeConnectAPI.status>>>(null)

  const refreshStripeStatus = async () => {
    const status = await stripeConnectAPI.status()
    setStripeStatus(status)
  }

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
    refreshStripeStatus().catch(() => setStripeStatus(null))
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("stripe") === "return" || params.get("stripe") === "refresh") {
      refreshStripeStatus().catch(() => setStripeStatus(null))
    }

    const onFocus = () => refreshStripeStatus().catch(() => setStripeStatus(null))
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const activeBaysCount = useMemo(() => {
    return bays.filter((b) => b.available === true).length
  }, [bays])

  const activeToolsCount = useMemo(() => {
    return tools.filter((t) => t.available === true).length
  }, [tools])

  const totalBookingsCount = bookings.length
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "pending"), [bookings])
  const filteredBookings = useMemo(() => {
    if (bookingsFilter === "all") return bookings
    return bookings.filter((b) => b.status === bookingsFilter)
  }, [bookings, bookingsFilter])

  const formatMoney = (value: number | string | null | undefined) => {
    const n = typeof value === "number" ? value : parseFloat(String(value ?? 0))
    return Number.isFinite(n) ? n.toFixed(2) : "0.00"
  }

  const statusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
      case "accepted":
        return "bg-blue-500/20 text-blue-200 border-blue-500/30"
      case "paid":
        return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
      case "declined":
        return "bg-gray-500/20 text-gray-200 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/30"
    }
  }

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
      setCheckoutEmailSent(res.email_sent)
      setCheckoutModalOpen(true)
      await refreshBookings()
    } catch (err) {
      console.error(err)
      const message = (err as any)?.response?.data?.error || "Failed to accept booking"
      alert(message)
    }
  }

  const handleConnectStripe = async () => {
    try {
      await stripeConnectAPI.createAccount()
      const { url } = await stripeConnectAPI.onboardingLink()
      window.open(url, "_blank", "noopener,noreferrer")
      await refreshStripeStatus()
    } catch (err) {
      console.error(err)
      const message = (err as any)?.response?.data?.error || "Failed to start Stripe onboarding"
      alert(message)
    }
  }

  const handleStripeDashboard = async () => {
    try {
      const { url } = await stripeConnectAPI.loginLink()
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      console.error(err)
      const message = (err as any)?.response?.data?.error || "Failed to open Stripe dashboard"
      alert(message)
    }
  }

  const handleResendInvoice = async (bookingId: number) => {
    try {
      const res = await bookingsAPI.resendInvoice(bookingId)
      alert(res.email_sent ? "Invoice email sent!" : "Unable to send invoice email.")
      await refreshBookings()
    } catch (err) {
      console.error(err)
      alert("Failed to resend invoice")
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const ok = confirm("Cancel this booking? If it was paid, it will be refunded.")
    if (!ok) return
    try {
      await bookingsAPI.cancel(bookingId)
      await refreshBookings()
    } catch (err) {
      console.error(err)
      alert("Failed to cancel booking")
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
    <div className="owner-dashboard">
      <main className="owner-dashboard__main">
        <header className="owner-dashboard__header">
          <div>
            <p className="owner-dashboard__eyebrow">CoGarage / Shop operations</p>
            <h1>Your garage, <span>in gear.</span></h1>
            <p className="owner-dashboard__intro">Review requests, keep your bays working, and manage your next booking.</p>
          </div>
          <button className="owner-dashboard__button owner-dashboard__button--primary" onClick={() => setBayModalOpen(true)}>
            <span aria-hidden="true">＋</span> Add New Bay
          </button>
        </header>

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
          isOpen={isBookingsModalOpen}
          onClose={() => setBookingsModalOpen(false)}
          title="All Bookings"
          actionText="Close"
          onAction={() => setBookingsModalOpen(false)}
          panelClassName="sm:max-w-4xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {bookings.length} total • {pendingBookings.length} pending
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">Filter</label>
              <select
                value={bookingsFilter}
                onChange={(e) => setBookingsFilter(e.target.value as any)}
                className="
                text-white
                rounded border border-gray-300 p-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="declined">Declined</option>
              </select>
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition"
                onClick={() => refreshBookings().catch(console.error)}
              >
                Refresh
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No bookings found.</p>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div key={b.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-white">
                        <span className="font-bold">#{b.id}</span>
                        <span className={`text-xs border rounded-full px-2 py-1 ${statusBadge(b.status)}`}>{b.status}</span>
                        <span className="text-xs border border-gray-300 dark:border-gray-700 rounded-full px-2 py-1 text-gray-600 dark:text-gray-300">
                          payment: {b.payment_status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {b.guest_name} • {b.guest_email}
                      </p>
                      <p className="font-semibold mt-1 text-white">
                        {b.bay?.description || `Bay #${b.bay_id}`} • ${formatMoney(b.total_price)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                      </p>

                      {b.booking_tools?.length ? (
                        <p className="text-xs text-gray-500 mt-2">
                          Tools:{" "}
                          {b.booking_tools
                            .map((line) => `${line.tool?.name || "Tool"} ×${line.quantity}`)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {b.status === "pending" ? (
                        <button
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-semibold transition shadow-sm"
                          onClick={() => handleAcceptBooking(b.id)}
                        >
                          Accept
                        </button>
                      ) : null}
                      {b.status === "pending" ? (
                        <button
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition"
                          onClick={() => handleDeclineBooking(b.id)}
                        >
                          Decline
                        </button>
                      ) : null}

                      {b.status === "accepted" && b.payment_status !== "paid" && b.payment_status !== "refunded" ? (
                        <button
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition"
                          onClick={() => handleResendInvoice(b.id)}
                        >
                          Resend invoice
                        </button>
                      ) : null}

                      {b.status !== "declined" && b.status !== "canceled" ? (
                        <button
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition"
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          Cancel{b.payment_status === "paid" ? " (refund)" : ""}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isCheckoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title="Payment Link"
          actionText="Close"
          onAction={() => setCheckoutModalOpen(false)}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {checkoutEmailSent
              ? `Payment link emailed to the guest for booking ${checkoutBookingId ? `#${checkoutBookingId}` : ""}.`
              : `Payment link was not emailed. Copy it below and share it with the guest for booking ${checkoutBookingId ? `#${checkoutBookingId}` : ""}.`}
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
	            className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md font-semibold transition shadow-sm"
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

        <section className="owner-dashboard__metrics" aria-label="Garage overview">
          <div>
            <span className="owner-dashboard__metric-label">Booking history</span>
            <p><strong>{totalBookingsCount}</strong><span>total bookings</span></p>
          </div>
          <div>
            <span className="owner-dashboard__metric-label">Bay availability</span>
            <p><strong>{activeBaysCount}<small> / {bays.length}</small></strong><span>active bays</span></p>
          </div>
          <div>
            <span className="owner-dashboard__metric-label">Tool availability</span>
            <p><strong>{activeToolsCount}<small> / {tools.length}</small></strong><span>active tools</span></p>
          </div>
          <div className="owner-dashboard__pending-metric">
            <span className="owner-dashboard__metric-label">Needs your review</span>
            <p><strong>{pendingBookings.length}</strong><span>pending requests</span></p>
          </div>
        </section>

        <div className="owner-dashboard__workspace">
          <section className="owner-dashboard__panel owner-dashboard__requests" aria-labelledby="requests-title">
            <div className="owner-dashboard__section-heading">
              <div>
                <p className="owner-dashboard__eyebrow">Booking desk</p>
                <h2 id="requests-title">Booking requests <span className="owner-dashboard__count">{pendingBookings.length}</span></h2>
              </div>
              <button className="owner-dashboard__text-button" onClick={() => setBookingsModalOpen(true)}>View Bookings <span aria-hidden="true">↗</span></button>
            </div>
            <p className="owner-dashboard__section-description">Accept a request to create a payment link for your guest.</p>

            {pendingBookings.length === 0 ? (
              <div className="owner-dashboard__empty">
                <span className="owner-dashboard__empty-icon" aria-hidden="true">✓</span>
                <h3>You’re all caught up.</h3>
                <p>No pending booking requests. New requests will appear here for review.</p>
                <Link to="/book" className="owner-dashboard__text-button">Browse shop listings <span aria-hidden="true">↗</span></Link>
              </div>
            ) : (
              <div className="owner-dashboard__queue">
                {pendingBookings.map((b) => (
                  <article key={b.id} className="owner-dashboard__ticket">
                    <div className="owner-dashboard__ticket-date">
                      <span>{new Date(b.start_time).toLocaleDateString(undefined, { month: "short" })}</span>
                      <strong>{new Date(b.start_time).getDate()}</strong>
                      <span>{new Date(b.start_time).toLocaleDateString(undefined, { weekday: "short" })}</span>
                    </div>
                    <div className="owner-dashboard__ticket-content">
                      <div className="owner-dashboard__ticket-topline">
                        <span className="owner-dashboard__request-id">Request #{b.id}</span>
                        <span className="owner-dashboard__status">Pending review</span>
                      </div>
                      <h3>{b.bay?.description || `Bay #${b.bay_id}`}</h3>
                      <p className="owner-dashboard__guest">{b.guest_name} <span>· {b.guest_email}</span></p>
                      <p className="owner-dashboard__time">
                        {new Date(b.start_time).toLocaleString()} — {new Date(b.end_time).toLocaleString()}
                      </p>
                      <div className="owner-dashboard__ticket-footer">
                        <div className="owner-dashboard__price"><strong>${formatMoney(b.total_price)}</strong><span>Booking total</span></div>
                        <div className="owner-dashboard__ticket-actions">
                          <button className="owner-dashboard__button owner-dashboard__button--quiet" onClick={() => handleDeclineBooking(b.id)}>Decline</button>
                          <button className="owner-dashboard__button owner-dashboard__button--primary" onClick={() => handleAcceptBooking(b.id)}>Accept &amp; Get Payment Link</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="owner-dashboard__sidebar">
            <section className="owner-dashboard__panel owner-dashboard__payouts" aria-labelledby="payouts-title">
              <p className="owner-dashboard__eyebrow">Payments & deposits</p>
              <div className="owner-dashboard__section-heading">
                <h2 id="payouts-title">Payouts</h2>
                <span className={`owner-dashboard__connection ${stripeStatus?.ready_for_payouts ? "owner-dashboard__connection--ready" : ""}`}>
                  <span aria-hidden="true">●</span> {stripeStatus?.ready_for_payouts ? "Enabled" : stripeStatus?.stripe_account_id ? "Setup incomplete" : "Not connected"}
                </span>
              </div>
              <p className="owner-dashboard__section-description">
                {stripeStatus?.ready_for_payouts
                  ? "Earnings are paid out to your connected Stripe account."
                  : "Complete Stripe onboarding to receive payments and automatic bank deposits."}
              </p>
              <div className="owner-dashboard__fee"><span>Platform fee</span><strong>{stripeStatus?.platform_fee_percent ?? "10"}<small>%</small></strong></div>
              {stripeStatus?.stripe_account_id ? (
                <div className="owner-dashboard__payout-actions">
                  <button className="owner-dashboard__button owner-dashboard__button--primary" onClick={handleStripeDashboard}>Stripe Dashboard <span aria-hidden="true">↗</span></button>
                  <button className="owner-dashboard__text-button" onClick={handleConnectStripe}>Manage Stripe</button>
                </div>
              ) : (
                <button className="owner-dashboard__button owner-dashboard__button--primary" onClick={handleConnectStripe}>Connect Stripe <span aria-hidden="true">↗</span></button>
              )}
              {stripeStatus?.stripe_account_id && !stripeStatus?.ready_for_payouts && (
                <p className="owner-dashboard__footnote">Just finished setup? Return to this tab to refresh your payout status.</p>
              )}
            </section>

            <section className="owner-dashboard__panel owner-dashboard__inventory" aria-labelledby="inventory-title">
              <p className="owner-dashboard__eyebrow">Make room for more</p>
              <h2 id="inventory-title">Your shop</h2>
              <p className="owner-dashboard__section-description">Keep your space and equipment ready to book.</p>
              <button className="owner-dashboard__inventory-action" onClick={() => setToolModalOpen(true)}>
                <span><strong>Add New Tool</strong><small>List equipment for your guests</small></span><span aria-hidden="true">＋</span>
              </button>
              <Link to="/book" className="owner-dashboard__inventory-action">
                <span><strong>Browse shop listings</strong><small>Explore the guest booking experience</small></span><span aria-hidden="true">↗</span>
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
