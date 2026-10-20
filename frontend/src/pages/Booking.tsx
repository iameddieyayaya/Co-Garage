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
  const [searchQuery, setSearchQuery] = useState('')
  const [maximumRate, setMaximumRate] = useState('')
  const [availableBaysOnly, setAvailableBaysOnly] = useState(false)

  const visibleShops = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const maximum = Number(maximumRate)
    const hasMaximum = maximumRate.trim() !== '' && Number.isFinite(maximum) && maximum >= 0

    return shops.filter((shop) => {
      if (query && !shop.name.toLowerCase().includes(query) && !shop.location.toLowerCase().includes(query)) return false
      if (availableBaysOnly && shop.available_bays_count <= 0) return false
      if (hasMaximum) {
        const value = shop.starting_hourly_rate
        const rate = value === null || (typeof value === 'string' && value.trim() === '') ? NaN : Number(value)
        if (!Number.isFinite(rate) || rate > maximum) return false
      }
      return true
    })
  }, [shops, searchQuery, maximumRate, availableBaysOnly])

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

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <label className="text-sm text-gray-300">
            Search shops
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Shop name or location"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-gray-300">
            Maximum starting rate ($/hr)
            <input
              type="number"
              min="0"
              step="any"
              value={maximumRate}
              onChange={(event) => setMaximumRate(event.target.value)}
              placeholder="No maximum"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={availableBaysOnly}
              onChange={(event) => setAvailableBaysOnly(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Available bays only
          </label>
        </div>

        {shopsError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200">{shopsError}</div>
        )}

        {loadingShops ? (
          <div className="text-gray-400">Loading shops…</div>
        ) : shops.length > 0 && visibleShops.length === 0 ? (
          <div className="text-center bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <p className="text-gray-300" role="status">No shops match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setMaximumRate('')
                setAvailableBaysOnly(false)
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleShops.map((shop) => {
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
        panelClassName="booking-dialog sm:max-w-4xl"
      >
        <button type="button" className="booking-close" onClick={closeModal} aria-label="Close booking form">×</button>
        <div className="booking-intro">
          <span>{selectedShop?.location}</span>
          <span className="booking-guest">Guest booking · No account needed</span>
        </div>
        {modalError && <div className="booking-error" role="alert">{modalError}</div>}
        <div className="booking-layout">
          <div className="booking-details">
            <section className="booking-section" aria-labelledby="booking-visit-heading">
              <div className="booking-section-heading">
                <h4 id="booking-visit-heading">Your time in the garage</h4>
                <p>Choose a bay and make room for your next project.</p>
              </div>
              <label className="booking-field" htmlFor="booking-bay">Bay
                <select id="booking-bay" value={selectedBayId ?? ''} onChange={(e) => setSelectedBayId(e.target.value ? Number(e.target.value) : null)} disabled={loadingDetails}>
                  <option value="">{loadingDetails ? 'Loading bays…' : 'Select a bay'}</option>
                  {shopBays.map((bay) => <option key={bay.id} value={bay.id}>{bay.description} (${toNumber(bay.hourly_rate)}/hr)</option>)}
                </select>
              </label>
              <label className="booking-field" htmlFor="booking-date">Date
                <input id="booking-date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </label>
              <fieldset className="booking-options">
                <legend>Duration</legend>
                <div className="booking-choice-row">
                  {(['half', 'full'] as const).map((value) => (
                    <button key={value} type="button" aria-pressed={duration === value} onClick={() => setDuration(value)} className="booking-choice">
                      <span>{value === 'half' ? 'Half day' : 'Full day'}</span>
                      <small>{value === 'half' ? '4 hours' : '8 hours'}</small>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="booking-options">
                <legend>Time at the shop</legend>
                {duration === 'full' ? <div className="booking-full-day"><span>Full day</span><strong>9am–5pm</strong></div> : (
                  <div className="booking-choice-row">
                    {(['morning', 'afternoon'] as const).map((value) => (
                      <button key={value} type="button" aria-pressed={slot === value} onClick={() => setSlot(value)} className="booking-choice">
                        <span>{value === 'morning' ? 'Morning' : 'Afternoon'}</span>
                        <small>{value === 'morning' ? '9am–1pm' : '1pm–5pm'}</small>
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>
            </section>
            <section className="booking-section booking-contact" aria-labelledby="booking-contact-heading">
              <div className="booking-section-heading">
                <h4 id="booking-contact-heading">Where can we reach you?</h4>
                <p>The shop will send your confirmation and payment link here.</p>
              </div>
              <div className="booking-contact-grid">
                <label className="booking-field" htmlFor="booking-name">Your name
                  <input id="booking-name" type="text" autoComplete="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jane Doe" />
                </label>
                <label className="booking-field" htmlFor="booking-email">Email address
                  <input id="booking-email" type="email" autoComplete="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="jane@example.com" />
                </label>
              </div>
            </section>
          </div>
          <aside className="booking-sidebar">
            <section aria-labelledby="booking-tools-heading">
              <div className="booking-tools-heading"><h4 id="booking-tools-heading">Equip your bay</h4><span>Optional</span></div>
              <p className="booking-tools-caption">Add the tools you need. Prices are for your {duration === 'full' ? 'full' : 'half'} day.</p>
              {loadingDetails && <p className="booking-empty" role="status">Loading tools…</p>}
              {!loadingDetails && shopTools.length === 0 && <p className="booking-empty">No tools listed for this shop.</p>}
              <div className="booking-tools">
                {!loadingDetails && shopTools.map((tool) => {
                  const checked = selectedTools[tool.id] !== undefined
                  const quantity = selectedTools[tool.id] ?? 1
                  return (
                    <div key={tool.id} className={`booking-tool ${checked ? 'is-selected' : ''}`}>
                      <label className="booking-tool-label">
                        <input type="checkbox" checked={checked} onChange={() => toggleTool(tool.id)} />
                        <span><strong>{tool.name}</strong>{tool.description && <small>{tool.description}</small>}</span>
                        <span className="booking-tool-price">${(toNumber(tool.day_rate) * dayFactor).toFixed(2)}</span>
                      </label>
                      {checked && <div className="booking-tool-quantity">
                        <span>Quantity</span>
                        <div className="booking-stepper">
                          <button type="button" aria-label={`Decrease ${tool.name} quantity`} disabled={quantity <= 1} onClick={() => setToolQuantity(tool.id, Math.max(1, quantity - 1))}>−</button>
                          <input type="number" aria-label={`${tool.name} quantity`} min={1} value={quantity} onChange={(e) => setToolQuantity(tool.id, Math.max(1, parseInt(e.target.value || '1', 10)))} />
                          <button type="button" aria-label={`Increase ${tool.name} quantity`} onClick={() => setToolQuantity(tool.id, quantity + 1)}>+</button>
                        </div>
                      </div>}
                    </div>
                  )
                })}
              </div>
            </section>
            <section className="booking-receipt" aria-labelledby="booking-estimate-heading">
              <h4 id="booking-estimate-heading">Your estimate</h4>
              <dl>
                <div><dt>Bay rental <span>· {hours} hours</span></dt><dd>${bayCost.toFixed(2)}</dd></div>
                <div><dt>Tool add-ons</dt><dd>${toolsCost.toFixed(2)}</dd></div>
                <div className="booking-total"><dt>Estimated total</dt><dd aria-live="polite">${totalCost.toFixed(2)}</dd></div>
              </dl>
              <p>No payment due now</p>
            </section>
            <p className="booking-next">The shop will review your request and confirm availability before you pay.</p>
          </aside>
        </div>
      </Modal>
    </div>
  )
}
