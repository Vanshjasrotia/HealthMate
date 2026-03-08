import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function MedicationReminder() {
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    time: '',
    duration: '',
  })
  const [reminders, setReminders] = useState([
    { id: 1, medicineName: 'Vitamin D', dosage: '1000 IU', time: '08:00', duration: '30 days' },
    { id: 2, medicineName: 'Omega-3', dosage: '1 capsule', time: '20:00', duration: '90 days' },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!formData.medicineName.trim()) return
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
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medication Reminder</h1>
      <p className="text-slate-600 mb-8">
        Add and manage your medication reminders. Data is stored in local state only.
      </p>

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
            <Button type="submit">Add Reminder</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Your Reminders</h3>
        {reminders.length === 0 ? (
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
