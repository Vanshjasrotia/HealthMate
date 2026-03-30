import { Link, useLocation, useNavigate } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/disease-prediction', label: 'Disease Prediction' },
  { path: '/chatbot', label: 'Medical Chatbot' },
  { path: '/report-analyzer', label: 'Report Analyzer' },
  { path: '/medication-reminder', label: 'Medication Reminder' },
  { path: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem('token') || localStorage.getItem('access_token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('auth_user')
    navigate('/login')
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
          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((link) => (token ? true : link.path !== '/dashboard'))
              .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-medical-100 text-medical-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/login'
                      ? 'bg-medical-100 text-medical-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/signup'
                      ? 'bg-medical-100 text-medical-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden relative group">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="absolute right-0 mt-1 w-48 py-2 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {navLinks
                .filter((link) => (token ? true : link.path !== '/dashboard'))
                .map((link) => (
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
              {token ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block px-4 py-2 text-sm ${
                      location.pathname === '/login' ? 'bg-medical-100 text-medical-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`block px-4 py-2 text-sm ${
                      location.pathname === '/signup' ? 'bg-medical-100 text-medical-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
