import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { login, persistAuth, refreshDashboardHealthTips, signup } from '../features/auth/authApi'

function validateLogin(values) {
  const errors = {}
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  return errors
}

function validateSignup(values) {
  const errors = {}
  if (!values.name.trim()) {
    errors.name = 'Name is required.'
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }
  const ageNum = Number.parseInt(String(values.age).trim(), 10)
  if (values.age === '' || values.age == null) {
    errors.age = 'Age is required.'
  } else if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Enter a valid age (1–120).'
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500'

/**
 * Dialog: login by default; footer link switches to signup (and back).
 */
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setLoginForm({ email: '', password: '' })
      setSignupForm({
        name: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setApiError('')
      setErrors({})
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setApiError('')
    const v = validateLogin(loginForm)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setLoading(true)
    try {
      const data = await login({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      })
      persistAuth(data)
      try {
        await refreshDashboardHealthTips()
      } catch {
        /* tips optional; dashboard still loads */
      }
      onClose()
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault()
    setApiError('')
    const v = validateSignup(signupForm)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setLoading(true)
    try {
      const data = await signup({
        name: signupForm.name.trim(),
        age: Number.parseInt(String(signupForm.age).trim(), 10),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
      })
      persistAuth(data)
      try {
        await refreshDashboardHealthTips()
      } catch {
        /* tips optional */
      }
      onClose()
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-slate-600">
          {mode === 'login' ? 'Access your HealthMate account.' : 'Sign up to save predictions and reports.'}
        </p>

        {mode === 'login' ? (
          <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit} noValidate autoComplete="off">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="username"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                className={inputClass}
                placeholder="Minimum 8 characters"
              />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
            </div>
            {apiError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : 'Log in'}
            </Button>
            <p className="text-center text-sm text-slate-600 pt-1">
              Not registered yet?{' '}
              <button
                type="button"
                className="font-medium text-medical-700 hover:text-medical-600 hover:underline"
                onClick={() => {
                  setMode('signup')
                  setApiError('')
                  setErrors({})
                }}
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSignupSubmit} noValidate autoComplete="off">
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={signupForm.name}
                onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
                placeholder="Your full name"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-age" className="block text-sm font-medium text-slate-700">
                Age
              </label>
              <input
                id="auth-age"
                type="number"
                min={1}
                max={120}
                inputMode="numeric"
                autoComplete="bday-year"
                value={signupForm.age}
                onChange={(e) => setSignupForm((p) => ({ ...p, age: e.target.value }))}
                className={inputClass}
                placeholder="Your age"
              />
              {errors.age ? <p className="mt-1 text-xs text-red-600">{errors.age}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-signup-email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="auth-signup-email"
                type="email"
                autoComplete="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-signup-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="auth-signup-password"
                type="password"
                autoComplete="new-password"
                value={signupForm.password}
                onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
                className={inputClass}
                placeholder="Minimum 8 characters"
              />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-confirm" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={inputClass}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p> : null}
            </div>
            {apiError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : 'Create account'}
            </Button>
            <p className="text-center text-sm text-slate-600 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-medical-700 hover:text-medical-600 hover:underline"
                onClick={() => {
                  setMode('login')
                  setApiError('')
                  setErrors({})
                }}
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
