import { useCallback, useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuthModal, isLoggedIn } from '../contexts/AuthModalContext'
import { getJsonAuthHeaders } from '../features/auth/authHeaders'
import { API_BASE_URL } from '../config/api'

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'Weekly',
  'As needed',
]

const emptyForm = {
  medicineName: '',
  dosage: '',
  time: '',
  frequency: 'Once daily',
  startDate: '',
  endDate: '',
}

function formatApiDetail(detail) {
  if (detail == null) return 'Request failed.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((x) => (typeof x === 'object' && x?.msg ? String(x.msg) : String(x)))
      .filter(Boolean)
      .join(' ')
  }
  return 'Request failed.'
}

function formatTimeForDisplay(t) {
  if (t == null) return ''
  const s = String(t)
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s
  const h = m[1].padStart(2, '0')
  return `${h}:${m[2]}`
}

function formatDateForDisplay(d) {
  if (!d) return ''
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

export default function MedicationReminder() {
  const { openAuthModal } = useAuthModal()
  const [formData, setFormData] = useState(emptyForm)
  const [reminders, setReminders] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [listError, setListError] = useState('')

  const loggedIn = isLoggedIn()

  const loadReminders = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setReminders([])
      return
    }
    setListLoading(true)
    setListError('')
    try {
      const res = await fetch(`${API_BASE_URL}/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        throw new Error(formatApiDetail(data?.detail) || 'Could not load reminders.')
      }
      setReminders(Array.isArray(data) ? data : [])
    } catch (e) {
      setListError(e.message || 'Could not load reminders.')
      setReminders([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReminders()
    const onAuth = () => loadReminders()
    window.addEventListener('healthmate-auth-changed', onAuth)
    return () => window.removeEventListener('healthmate-auth-changed', onAuth)
  }, [loadReminders])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.medicineName.trim()) {
      setFormError('Medicine name is required.')
      return
    }
    if (!formData.time) {
      setFormError('Please choose a reminder time.')
      return
    }
    if (!formData.startDate || !formData.endDate) {
      setFormError('Start and end dates are required.')
      return
    }
    if (formData.endDate < formData.startDate) {
      setFormError('End date must be on or after start date.')
      return
    }

    if (!isLoggedIn()) {
      openAuthModal('login')
      return
    }

    setSubmitLoading(true)
    try {
      const timeStr = formData.time.length === 5 ? `${formData.time}:00` : formData.time
      const res = await fetch(`${API_BASE_URL}/reminders`, {
        method: 'POST',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          medicine_name: formData.medicineName.trim(),
          dosage: formData.dosage.trim() || null,
          time: timeStr,
          frequency: formData.frequency,
          start_date: formData.startDate,
          end_date: formData.endDate,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(formatApiDetail(body?.detail) || 'Could not save reminder.')
      }
      setFormData(emptyForm)
      await loadReminders()
    } catch (err) {
      setFormError(err.message || 'Could not save reminder.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!isLoggedIn()) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(formatApiDetail(data?.detail) || 'Could not delete.')
      }
      await loadReminders()
    } catch (e) {
      setListError(e.message || 'Could not delete reminder.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medication Reminder</h1>
      <p className="text-slate-600 mb-4">
        Schedule medications with date range and daily time. Reminders are saved to your account and sync across
        visits.
      </p>

      {!loggedIn && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Sign in to save and view reminders. <strong>Add Reminder</strong> will prompt you to log in if needed.
        </p>
      )}

      <Card className="mb-8">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medicine name</label>
              <input
                type="text"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                placeholder="e.g. Aspirin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dosage (optional)</label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g. 100 mg"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reminder time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 bg-white"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <Button type="submit" disabled={submitLoading}>
            {submitLoading ? 'Saving…' : loggedIn ? 'Add reminder' : 'Add reminder (sign in required)'}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Your reminders</h3>
        {!loggedIn ? (
          <p className="text-slate-500 text-sm py-6 text-center">Sign in to view and manage your saved reminders.</p>
        ) : listLoading ? (
          <p className="text-slate-500 text-sm py-6 text-center">Loading reminders…</p>
        ) : listError ? (
          <p className="text-red-600 text-sm py-4">{listError}</p>
        ) : reminders.length === 0 ? (
          <p className="text-slate-500 text-sm py-6 text-center">No reminders yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {reminders.map((r) => (
              <li key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{r.medicine_name}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {r.dosage ? <span>{r.dosage} · </span> : null}
                    <span>
                      {formatTimeForDisplay(r.time)} · {r.frequency}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDateForDisplay(r.start_date)} — {formatDateForDisplay(r.end_date)}
                  </p>
                </div>
                <Button variant="secondary" type="button" onClick={() => handleRemove(r.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
