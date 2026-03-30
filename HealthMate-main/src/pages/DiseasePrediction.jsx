import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function DiseasePrediction() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    bloodPressure: '',
    glucose: '',
    cholesterol: '',
    bmi: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Disease Prediction</h1>
      <p className="text-slate-600 mb-8">
        Enter your health metrics to get a risk assessment. Results are for illustration only.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (mmHg)</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="e.g. 120/80"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Glucose Level (mg/dL)</label>
              <input
                type="number"
                name="glucose"
                value={formData.glucose}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cholesterol (mg/dL)</label>
              <input
                type="number"
                name="cholesterol"
                value={formData.cholesterol}
                onChange={handleChange}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">BMI</label>
              <input
                type="number"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                placeholder="e.g. 22.5"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              />
            </div>
            <Button type="submit" className="w-full">
              Get Risk Assessment
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Disease Risk Result</h3>
          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-medical-50 rounded-lg border border-medical-200">
                <p className="text-sm text-slate-600 mb-1">Predicted condition (placeholder)</p>
                <p className="font-medium text-medical-800">Cardiovascular risk</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Risk percentage</p>
                <p className="text-2xl font-bold text-medical-700">24%</p>
              </div>
              <p className="text-xs text-slate-500">
                This is placeholder data. No actual prediction is performed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">Submit the form to see placeholder result</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
