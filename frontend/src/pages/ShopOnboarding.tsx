import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { shopsAPI } from '../services/api'

const ShopOnboarding = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }

    shopsAPI
      .current()
      .then(() => navigate('/dashboard'))
      .catch((err: any) => {
        if (err?.response?.status === 404) {
          setChecking(false)
        } else {
          setError('Unable to verify your shop status. Please try again.')
          setChecking(false)
        }
      })
  }, [loading, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await shopsAPI.create({
        name: formData.name,
        location: formData.location,
        description: formData.description || undefined,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Shop creation failed')
    } finally {
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400">Preparing your onboarding...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">
      <div className="hidden lg:flex relative">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          alt="Garage interior"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 p-16 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Set Up Your Shop
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-md">
            Add your shop details to start listing bays and tools.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-wide bg-orange-600/20 text-orange-500 rounded-full">
            Onboarding
          </span>

          <h2 className="text-3xl font-bold mb-2">
            Create Your Shop
          </h2>

          <p className="text-gray-400 mb-8">
            This information appears on your public listing.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Shop Name"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description (optional)"
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed transition py-3 rounded-md font-semibold tracking-wide"
            >
              {saving ? 'Creating Shop...' : 'Create Shop'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ShopOnboarding
