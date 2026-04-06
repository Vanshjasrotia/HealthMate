import { useEffect, useRef, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { getBearerAuthHeaders } from '../features/auth/authHeaders'
import { useAuthModal, isLoggedIn } from '../contexts/AuthModalContext'
import { API_BASE_URL } from '../config/api'
const LOGIN_PROMPT_MS = 5 * 60 * 1000

export default function ReportAnalyzer() {
  const { openAuthModal } = useAuthModal()
  const loginPromptTimeoutRef = useRef(null)
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    return () => {
      if (loginPromptTimeoutRef.current) {
        clearTimeout(loginPromptTimeoutRef.current)
        loginPromptTimeoutRef.current = null
      }
    }
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setUploaded(false)
      setError('')
      setAnalysis(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError('')
    setAnalysis(null)
    setUploaded(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_BASE_URL}/report/analyze`, {
        method: 'POST',
        headers: getBearerAuthHeaders(),
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Report analysis failed.')

      setAnalysis(data)
      setUploaded(true)
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
      setError(err.message || 'Could not analyze report.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Report Analyzer</h1>
      <p className="text-slate-600 mb-8">
        Upload a lab report (PDF, image, or text) to extract values and highlight abnormalities.
      </p>

      <Card className="mb-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select file (PDF / Image)</label>
            <input
              type="file"
              accept=".pdf,image/*,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-medical-100 file:text-medical-800 file:font-medium hover:file:bg-medical-200"
            />
            {file && (
              <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p>
            )}
          </div>
          <Button type="submit" disabled={!file || isLoading}>
            {isLoading ? 'Analyzing...' : 'Upload & Analyze'}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      {uploaded && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Extracted Report Values</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Parameter</th>
                    <th className="text-left py-2 font-medium text-slate-700">Value</th>
                    <th className="text-left py-2 font-medium text-slate-700">Status</th>
                    <th className="text-left py-2 font-medium text-slate-700">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(analysis?.extracted_values || []).map((row) => (
                    <tr key={row.name} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{row.name}</td>
                      <td className="py-2 text-slate-700">{row.value}</td>
                      <td className="py-2">
                        <span className={row.normal ? 'text-medical-600' : 'text-amber-600 font-medium'}>
                          {row.normal ? 'Normal' : 'Abnormal'}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-slate-500">{row.note || '-'}</td>
                    </tr>
                  ))}
                  {(analysis?.extracted_values || []).length === 0 && (
                    <tr>
                      <td className="py-2 text-slate-500" colSpan={4}>No values could be extracted from this file.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">AI Summary</h3>
            <p className="text-sm text-slate-700">{analysis?.summary}</p>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">Highlighted Abnormal Parameters</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              {(analysis?.abnormal_parameters || []).map((item, idx) => (
                <li key={`${item}-${idx}`}>• {item}</li>
              ))}
              {(analysis?.abnormal_parameters || []).length === 0 && <li>• No clearly abnormal parameter detected.</li>}
            </ul>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-3">Suggested Remedies</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              {(analysis?.remedies || []).map((item, idx) => (
                <li key={`${item}-${idx}`}>• {item}</li>
              ))}
              {(analysis?.remedies || []).length === 0 && (
                <li>• Maintain balanced nutrition, hydration, and regular checkups.</li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {!uploaded && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Upload a file to run AI report analysis</p>
          </div>
        </Card>
      )}
    </div>
  )
}
