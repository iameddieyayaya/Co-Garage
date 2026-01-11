import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastProvider'
import {
  bookingsAPI,
  publicBaysAPI,
  publicShopsAPI,
  publicToolsAPI,
  type BookingDuration,
  type BookingSlot,
} from '../services/api'
import type { PublicBay, PublicShop, PublicTool } from '../types'

type ToolSelection = Record<number, number>

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function Booking() {
  const [shops, setShops] = useState<PublicShop[]>([])
  const [loadingShops, setLoadingShops] = useState(true)
  const [shopsError, setShopsError] = useState<string | null>(null)

  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<PublicShop | null>(null)
  const [shopBays, setShopBays] = useState<PublicBay[]>([])
  const [shopTools, setShopTools] = useState<PublicTool[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [selectedBayId, setSelectedBayId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [duration, setDuration] = useState<BookingDuration>('half')
  const [slot, setSlot] = useState<BookingSlot>('morning')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [selectedTools, setSelectedTools] = useState<ToolSelection>({})
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const toast = useToast()

  const selectedBay = useMemo(() => shopBays.find((b) => b.id === selectedBayId) ?? null, [shopBays, selectedBayId])
  const toolsById = useMemo(() => new Map(shopTools.map((t) => [t.id, t])), [shopTools])

  useEffect(() => {
    setLoadingShops(true)
    setShopsError(null)

    publicShopsAPI
      .list()
      .then(setShops)
      .catch(() => setShopsError('Unable to load shops. Please try again.'))
      .finally(() => setLoadingShops(false))
  }, [])

  const openForShop = async (shop: PublicShop) => {
    setSelectedShop(shop)
    setModalOpen(true)
    setModalError(null)
    setSelectedTools({})
    setSelectedBayId(null)
    setSelectedDate('')
    setDuration('half')
    setSlot('morning')

    setLoadingDetails(true)
    try {
      const [bays, tools] = await Promise.all([publicBaysAPI.list(shop.id), publicToolsAPI.list(shop.id)])
      setShopBays(bays)
      setShopTools(tools)
    } catch {
      setModalError('Unable to load bays/tools for this shop. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedShop(null)
    setShopBays([])
    setShopTools([])
    setModalError(null)
  }

  const hours = duration === 'full' ? 8 : 4
  const dayFactor = duration === 'full' ? 1 : 0.5

  const bayCost = useMemo(() => {
    if (!selectedBay) return 0
    return toNumber(selectedBay.hourly_rate) * hours
  }, [selectedBay, hours])

  const toolsCost = useMemo(() => {
    let total = 0
    for (const [toolId, quantity] of Object.entries(selectedTools)) {
      if (!quantity || quantity <= 0) continue
      const tool = toolsById.get(Number(toolId))
      if (!tool) continue
      total += toNumber(tool.day_rate) * dayFactor * quantity
    }
    return total
  }, [selectedTools, toolsById, dayFactor])

  const totalCost = bayCost + toolsCost

  const toggleTool = (toolId: number) => {
    setSelectedTools((prev) => {
      const next = { ...prev }
      if (next[toolId]) {
        delete next[toolId]
      } else {
        next[toolId] = 1
      }
      return next
    })
  }

  const setToolQuantity = (toolId: number, quantity: number) => {
    setSelectedTools((prev) => {
      const next = { ...prev }
      if (quantity <= 0) {
        delete next[toolId]
      } else {
        next[toolId] = quantity
      }
      return next
    })
  }

  const submit = async () => {
    setModalError(null)

    if (!selectedShop) return setModalError('Please select a shop.')
    if (!selectedBayId) return setModalError('Please select a bay.')
    if (!selectedDate) return setModalError('Please choose a date.')
    if (!guestName.trim()) return setModalError('Please enter your name.')
    if (!guestEmail.trim()) return setModalError('Please enter your email.')

    const toolsPayload = Object.entries(selectedTools).map(([toolId, quantity]) => ({
      tool_id: Number(toolId),
      quantity,
    }))

    setSubmitting(true)
    try {
      const res = await bookingsAPI.createGuest({
        bay_id: selectedBayId,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        rental_date: selectedDate,
        duration,
        slot: duration === 'half' ? slot : undefined,
        tools: toolsPayload.length ? toolsPayload : undefined,
      })

      toast.success(`Request submitted${res?.id ? ` (ID #${res.id})` : ''}.`, 'Booking requested')
      closeModal()
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.errors?.[0] || 'Booking request failed.'
      setModalError(message)
      toast.error(message, 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500'

  const selectClass =
    'w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-60'

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Book a Shop</h1>
            <p className="text-gray-400 mt-2">
              Choose a shop, then request a bay for a half day (4 hrs) or full day (8 hrs). Add tools if you need them.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Guest booking</p>
            <p className="text-sm text-gray-300 mt-1">No account needed</p>
          </div>
        </div>

        {shopsError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200">{shopsError}</div>
        )}

        {loadingShops ? (
          <div className="text-gray-400">Loading shops…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shops.map((shop) => {
              const canBook = shop.available_bays_count > 0
              const startingRate = toNumber(shop.starting_hourly_rate)
              return (
                <div key={shop.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">{shop.name}</h2>
                        <p className="text-sm text-gray-400 mt-1">{shop.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400">From</p>
                        <p className="text-lg font-bold text-blue-400">
                          {shop.starting_hourly_rate ? `$${startingRate.toFixed(0)}/hr` : '—'}
                        </p>
                      </div>
                    </div>

                    {shop.description && <p className="text-sm text-gray-300 mt-4 line-clamp-3">{shop.description}</p>}

                    <div className="mt-5 flex gap-3 text-sm text-gray-300">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                        <span className="font-semibold">{shop.available_bays_count}</span> bays
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                        <span className="font-semibold">{shop.available_tools_count}</span> tools
                      </div>
                    </div>
                  </div>

	                  <button
	                    type="button"
	                    disabled={!canBook}
	                    onClick={() => openForShop(shop)}
	                    className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition shadow-sm"
	                  >
	                    {canBook ? 'Request booking' : 'No bays available'}
	                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedShop ? `Request booking — ${selectedShop.name}` : 'Request booking'}
        actionText={submitting ? 'Submitting…' : 'Submit request'}
        onAction={submit}
        actionDisabled={submitting || loadingDetails}
        panelClassName="sm:max-w-5xl"
      >
        <div className="text-sm text-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="min-w-0 lg:col-span-2">
              {modalError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-200">{modalError}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">Bay</label>
                  <select
                    value={selectedBayId ?? ''}
                    onChange={(e) => setSelectedBayId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingDetails}
                    className={selectClass}
                  >
                    <option value="">{loadingDetails ? 'Loading…' : 'Select a bay'}</option>
                    {shopBays.map((bay) => (
                      <option key={bay.id} value={bay.id}>
                        {bay.description} (${toNumber(bay.hourly_rate)}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`${inputClass} dark:[color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white">Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDuration('half')}
                        className={`rounded-xl border px-3 py-2 font-semibold transition ${
                          duration === 'half'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                      >
                        Half day
                        <div className="text-xs font-normal opacity-80">4 hours</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDuration('full')}
                        className={`rounded-xl border px-3 py-2 font-semibold transition ${
                          duration === 'full'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                      >
                        Full day
                        <div className="text-xs font-normal opacity-80">8 hours</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-white">Time</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSlot('morning')}
                      disabled={duration === 'full'}
                      className={`rounded-xl border px-3 py-2 font-semibold transition ${
                        duration === 'full'
                          ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed'
                          : slot === 'morning'
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      Morning
                      <div className="text-xs font-normal opacity-80">9am–1pm</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlot('afternoon')}
                      disabled={duration === 'full'}
                      className={`rounded-xl border px-3 py-2 font-semibold transition ${
                        duration === 'full'
                          ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed'
                          : slot === 'afternoon'
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      Afternoon
                      <div className="text-xs font-normal opacity-80">1pm–5pm</div>
                    </button>
                  </div>
                  {duration === 'full' && <p className="text-xs text-gray-500 mt-2">Full-day bookings run 9am–5pm.</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white">Your name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Jane Doe"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white">Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white">Estimated total</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">${totalCost.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Bay: ${bayCost.toFixed(2)} • Tools: ${toolsCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Tools</h3>
                <p className="text-xs text-gray-300">{duration === 'full' ? 'Full day pricing' : 'Half day pricing'}</p>
              </div>

              {loadingDetails && (
                <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  Loading tools…
                </div>
              )}

              {!loadingDetails && shopTools.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  No tools listed for this shop.
                </div>
              )}

              {!loadingDetails && shopTools.length > 0 && (
                <div className="space-y-3">
                  {shopTools.map((tool) => {
                    const checked = selectedTools[tool.id] !== undefined
                    const quantity = selectedTools[tool.id] ?? 1
                    return (
                      <div
                        key={tool.id}
                        className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-3 cursor-pointer min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTool(tool.id)}
                              className="mt-1 h-4 w-4 accent-blue-500"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white">{tool.name}</div>
                              {tool.description && <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{tool.description}</div>}
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                ${toNumber(tool.day_rate).toFixed(2)}/day • billed {duration === 'full' ? 'full' : 'half'} day
                              </div>
                            </div>
                          </label>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={!checked || quantity <= 1}
                              onClick={() => setToolQuantity(tool.id, Math.max(1, quantity - 1))}
                              className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 disabled:opacity-40"
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantity}
                              disabled={!checked}
                              onChange={(e) => setToolQuantity(tool.id, Math.max(1, parseInt(e.target.value || '1', 10)))}
                              className="w-12 text-center rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 py-2 text-gray-900 dark:text-white disabled:opacity-40"
                            />
                            <button
                              type="button"
                              disabled={!checked}
                              onClick={() => setToolQuantity(tool.id, quantity + 1)}
                              className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                This submits a request. The shop will confirm availability and payment next.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
