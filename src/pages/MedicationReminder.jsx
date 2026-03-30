import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { createReminder, deleteReminder, listReminders } from '../features/reminders/reminderApi'

function formatReminderTime(timeValue) {
  if (!timeValue) return '--:--'
  return String(timeValue).slice(0, 5)
}

export default function MedicationReminder() {
  const [formData, setFormData] = useState({
    medicineName: '',
    time: '',
    frequency: 'daily',
  })
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setError('')
        const data = await listReminders()
        setReminders(data || [])
      } catch (apiError) {
        setError(apiError.message || 'Unable to fetch reminders.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formData.medicineName.trim() || !formData.time) return

    setSubmitting(true)
    setError('')
    try {
      const created = await createReminder({
        medicineName: formData.medicineName.trim(),
        time: formData.time,
        frequency: formData.frequency,
      })
      setReminders((prev) => [...prev, created])
      setFormData({ medicineName: '', time: '', frequency: 'daily' })
    } catch (apiError) {
      setError(apiError.message || 'Unable to create reminder.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      setError('')
      await deleteReminder(id)
      setReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (apiError) {
      setError(apiError.message || 'Unable to delete reminder.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medication Reminder</h1>
      <p className="text-slate-600 mb-8">Add and manage your medication reminders.</p>

      <Card className="mb-8">
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="once">Once</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Reminder'}
            </Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Your Reminders</h3>
        {loading ? (
          <p className="text-slate-500 text-sm py-6 text-center">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p className="text-slate-500 text-sm py-6 text-center">No reminders yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {reminders.map((r) => (
              <li key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-800">{r.medicine_name}</p>
                  <p className="text-sm text-slate-600">
                    {formatReminderTime(r.time)} - {r.frequency}
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
