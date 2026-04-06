import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { getJsonAuthHeaders } from '../features/auth/authHeaders'
import { useAuthModal, isLoggedIn } from '../contexts/AuthModalContext'
import { API_BASE_URL } from '../config/api'

const diseaseConfig = {
  diabetes: {
    label: 'Diabetes',
    endpoint: '/predict/diabetes',
    fields: ['Glucose', 'BloodPressure', 'BMI', 'Age', 'Insulin'],
    optional: ['Insulin'],
  },
  heart: {
    label: 'Heart Disease',
    endpoint: '/predict/heart',
    fields: ['Age', 'Sex', 'ChestPainType', 'Cholesterol', 'MaxHeartRate', 'ExerciseAngina'],
    optional: [],
  },
  liver: {
    label: 'Liver Disease',
    endpoint: '/predict/liver',
    fields: ['Age', 'Gender', 'TotalBilirubin', 'DirectBilirubin', 'SGPT', 'SGOT'],
    optional: [],
  },
  kidney: {
    label: 'Kidney Disease',
    endpoint: '/predict/kidney',
    fields: ['Age', 'BloodPressure', 'Creatinine', 'Hemoglobin', 'Albumin'],
    optional: [],
  },
}

const initialForm = {
  Glucose: '',
  BloodPressure: '',
  BMI: '',
  Age: '',
  Insulin: '',
  Sex: '',
  ChestPainType: '',
  Cholesterol: '',
  MaxHeartRate: '',
  ExerciseAngina: '',
  Gender: '',
  TotalBilirubin: '',
  DirectBilirubin: '',
  SGPT: '',
  SGOT: '',
  Creatinine: '',
  Hemoglobin: '',
  Albumin: '',
}

const LOGIN_PROMPT_MS = 5 * 60 * 1000

export default function DiseasePrediction() {
  const { openAuthModal } = useAuthModal()
  const loginPromptTimeoutRef = useRef(null)
  const [selectedDisease, setSelectedDisease] = useState('diabetes')
  const [formData, setFormData] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const config = useMemo(() => diseaseConfig[selectedDisease], [selectedDisease])

  useEffect(() => {
    return () => {
      if (loginPromptTimeoutRef.current) {
        clearTimeout(loginPromptTimeoutRef.current)
        loginPromptTimeoutRef.current = null
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const parsePayload = () => {
    const payload = {}
    for (const field of config.fields) {
      const value = formData[field]
      if (value === '' || value === null || value === undefined) {
        if (!config.optional.includes(field)) {
          throw new Error(`${field} is required`)
        }
        continue
      }
      if (field === 'Sex' || field === 'ChestPainType' || field === 'ExerciseAngina' || field === 'Gender') {
        payload[field] = value
      } else if (field === 'Age') {
        payload[field] = Number.parseInt(value, 10)
      } else {
        payload[field] = Number.parseFloat(value)
      }
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    let payload
    try {
      payload = parsePayload()
    } catch (err) {
      setError(err.message || 'Please fill all required fields.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}${config.endpoint}`, {
        method: 'POST',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.detail || 'Prediction request failed.')
      }

      const data = await res.json()
      setResult(data)
      if (!isLoggedIn()) {
        if (loginPromptTimeoutRef.current) {
          clearTimeout(loginPromptTimeoutRef.current)
        }
        loginPromptTimeoutRef.current = setTimeout(() => {
          loginPromptTimeoutRef.current = null
          openAuthModal('login')
        }, LOGIN_PROMPT_MS)
      }
    } catch (err) {
      setError(err.message || 'Could not fetch prediction.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderInput = (field) => {
    if (field === 'Sex') {
      return (
        <select name={field} value={formData[field]} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
          <option value="">Select sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      )
    }
    if (field === 'Gender') {
      return (
        <select name={field} value={formData[field]} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      )
    }
    if (field === 'ExerciseAngina') {
      return (
        <select name={field} value={formData[field]} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      )
    }
    if (field === 'ChestPainType') {
      return (
        <select name={field} value={formData[field]} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
          <option value="">Select chest pain type</option>
          <option value="typical angina">Typical angina</option>
          <option value="atypical angina">Atypical angina</option>
          <option value="non-anginal">Non-anginal</option>
          <option value="asymptomatic">Asymptomatic</option>
        </select>
      )
    }

    return (
      <input
        type="number"
        step="any"
        name={field}
        value={formData[field]}
        onChange={handleChange}
        placeholder={`Enter ${field}`}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Disease Prediction</h1>
      <p className="text-slate-600 mb-8">Choose a disease model, fill details, and get AI-assisted risk output.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prediction Type</label>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {Object.entries(diseaseConfig).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            {config.fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field}
                  {config.optional.includes(field) ? ' (optional)' : ''}
                </label>
                {renderInput(field)}
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Predicting...' : 'Get Risk Assessment'}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Disease Risk Result</h3>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : result ? (
            <div className="space-y-4">
              <div className="p-4 bg-medical-50 rounded-lg border border-medical-200">
                <p className="text-sm text-slate-600 mb-1">Predicted status</p>
                <p className="font-medium text-medical-800">{result.prediction}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Risk probability</p>
                <p className="text-2xl font-bold text-medical-700">{result.probability}</p>
              </div>
              <p className="text-sm text-slate-600">{result.message}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Submit the form to get prediction results.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
