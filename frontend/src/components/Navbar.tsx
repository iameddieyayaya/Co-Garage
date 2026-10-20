import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-slate-900 fixed w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center gap-3">
        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-blue-500 tracking-widest shrink-0">
          CoGarage
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-base">
          <Link to="/book" className="hover:text-blue-500 font-semibold transition text-gray-100">
            Book
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-500 font-semibold transition text-gray-100">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-full font-bold hover:bg-blue-500 transition shadow-sm whitespace-nowrap"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/#features" className="hover:text-blue-500 font-semibold transition text-gray-100">Features</Link>
              <Link to="/#how-it-works" className="hover:text-blue-500 font-semibold transition text-gray-100">How It Works</Link>
              <Link to="/owners/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-500 transition shadow-sm">
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
