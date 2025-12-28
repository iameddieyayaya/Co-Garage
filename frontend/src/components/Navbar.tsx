import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-slate-900 fixed w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-blue-500 tracking-widest">
          CoGarage
        </Link>
        <nav className="space-x-6 flex items-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-500 font-semibold transition text-gray-100">
                Dashboard
              </Link>
              <span className="text-gray-100">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-full font-bold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="hover:text-blue-500 font-semibold transition text-gray-100">Features</a>
              <a href="#how-it-works" className="hover:text-blue-500 font-semibold transition text-gray-100">How It Works</a>
              <Link to="/owners/signup" className="bg-blue-500 text-gray-900 px-5 py-2 rounded-full font-bold hover:bg-blue-600 transition">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar

