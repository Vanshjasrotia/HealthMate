import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuthModal, isLoggedIn } from '../contexts/AuthModalContext'

export default function MedicationReminder() {
  const { openAuthModal } = useAuthModal()
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    time: '',
    duration: '',
  })
  const [reminders, setReminders] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!formData.medicineName.trim()) return

    // Saving a reminder requires an account so we know which user to notify.
    if (!isLoggedIn()) {
      openAuthModal('login')
      return
    }

    setReminders((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...formData,
        medicineName: formData.medicineName.trim(),
      },
    ])
    setFormData({ medicineName: '', dosage: '', time: '', duration: '' })
  }

  const handleRemove = (id) => {
    if (!isLoggedIn()) return
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  const loggedIn = isLoggedIn()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medication Reminder</h1>
      <p className="text-slate-600 mb-4">
        Set reminders for your medications. Adding a reminder requires you to be signed in so we know which account to attach notifications to.
      </p>

      {!loggedIn && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Sign in to save reminders. You can browse this page without an account, but <strong>Add Reminder</strong> will ask you to log in first.
        </p>
      )}

      <Card className="mb-8">
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g. 5mg"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 7 days"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit">
              {loggedIn ? 'Add Reminder' : 'Add Reminder (sign in required)'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Your Reminders</h3>
        {!loggedIn ? (
          <p className="text-slate-500 text-sm py-6 text-center">
            Sign in to view and manage your saved reminders.
          </p>
        ) : reminders.length === 0 ? (
          <p className="text-slate-500 text-sm py-6 text-center">No reminders yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {reminders.map((r) => (
              <li key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-800">{r.medicineName}</p>
                  <p className="text-sm text-slate-600">
                    {r.dosage} at {r.time} — {r.duration}
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
