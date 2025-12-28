import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

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
            Welcome Back
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-md">
            Access your garage dashboard and manage your bookings.
          </p>
        </div>
      </div>

      {/* Right: Login */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold mb-2">
            Login to Your Account
          </h2>

          <p className="text-gray-400 mb-8">
            Enter your credentials to access your dashboard.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed transition py-3 rounded-md font-semibold tracking-wide"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-500 text-center">
            By logging in, you agree to CoGarage's Terms & Privacy Policy.
          </p>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to="/owners/signup" className="text-orange-500 hover:text-orange-400 underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

