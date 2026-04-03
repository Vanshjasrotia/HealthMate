import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth } from '../features/auth/authHeaders'
import { useAuthModal } from '../contexts/AuthModalContext'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/disease-prediction', label: 'Disease Prediction' },
  { path: '/chatbot', label: 'Medical Chatbot' },
  { path: '/report-analyzer', label: 'Report Analyzer' },
  { path: '/medication-reminder', label: 'Medication Reminder' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [token, setToken] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  )
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    const sync = () => {
      setToken(typeof window !== 'undefined' ? localStorage.getItem('token') : null)
    }
    window.addEventListener('healthmate-auth-changed', sync)
    return () => window.removeEventListener('healthmate-auth-changed', sync)
  }, [])

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-medical-100 text-medical-800'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  function handleLogout() {
    clearAuth()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-xl font-bold text-medical-700 hover:text-medical-600 transition-colors"
          >
            HealthMate
          </Link>
          <div className="hidden md:flex items-center gap-1 flex-wrap justify-end">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                {link.label}
              </Link>
            ))}
            {token ? (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-medical-600 text-white hover:bg-medical-700"
              >
                Login / Signup
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    location.pathname === '/dashboard'
                      ? 'bg-medical-100 text-medical-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-medical-600 text-white"
              >
                Login / Signup
              </button>
            )}
            <div className="relative group">
              <button
                type="button"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-52 py-2 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-2 text-sm ${
                      location.pathname === link.path ? 'bg-medical-100 text-medical-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
