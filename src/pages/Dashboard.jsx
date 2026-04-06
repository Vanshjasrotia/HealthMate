import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { useAuthModal } from '../contexts/AuthModalContext'
import { API_BASE_URL } from '../config/api'

function formatApiDetail(detail) {
  if (detail == null) return 'Could not load dashboard.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && item.msg != null) return String(item.msg)
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }
  return 'Could not load dashboard.'
}

function previewInitials(preview) {
  const s = (preview || '').trim()
  if (!s) return '?'
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    const a = words[0][0] || ''
    const b = words[1][0] || ''
    return (a + b).toUpperCase().slice(0, 2)
  }
  return s.slice(0, 2).toUpperCase()
}

function formatChatUpdated(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const { openAuthModal } = useAuthModal()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [recentChats, setRecentChats] = useState([])
  const [greetingName, setGreetingName] = useState('')

  const refreshRecentChats = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setRecentChats([])
      return
    }
    try {
      const r = await fetch(`${API_BASE_URL}/chat/conversations?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) {
        setRecentChats([])
        return
      }
      const d = await r.json()
      setRecentChats(d.conversations || [])
    } catch {
      setRecentChats([])
    }
  }, [])

  useEffect(() => {
    const onSync = () => refreshRecentChats()
    window.addEventListener('focus', onSync)
    window.addEventListener('healthmate-auth-changed', onSync)
    return () => {
      window.removeEventListener('focus', onSync)
      window.removeEventListener('healthmate-auth-changed', onSync)
    }
  }, [refreshRecentChats])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to view your dashboard.')
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(formatApiDetail(body?.detail) || 'Could not load dashboard.')
        }
        if (!cancelled) setData(body)
        if (!cancelled) {
          try {
            const raw = localStorage.getItem('auth_user')
            const u = raw ? JSON.parse(raw) : {}
            setGreetingName((u?.name || '').trim())
          } catch {
            setGreetingName('')
          }
        }
        if (!cancelled) await refreshRecentChats()
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refreshRecentChats])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <p className="text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="mt-4 text-medical-700 font-medium hover:underline"
          >
            Open login
          </button>
        </Card>
      </div>
    )
  }

  const recent = data?.recent_predictions || []
  const tips = Array.isArray(data?.health_tips) ? data.health_tips : []
  const hasNoActivity =
    (data?.total_predictions ?? 0) === 0 &&
    (data?.reports_uploaded ?? 0) === 0 &&
    (data?.active_reminders ?? 0) === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        {greetingName ? `Hello, ${greetingName}` : 'Dashboard'}
      </h1>
      <p className="text-slate-600 mb-8">
        {greetingName
          ? 'Here is your overview of predictions, reports, and reminders in HealthMate.'
          : 'Overview of your predictions, reports, and reminders in HealthMate.'}
      </p>

      {hasNoActivity && (
        <p className="text-sm text-slate-500 mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          No data available yet. Run a prediction, upload a report, or add a reminder while logged in.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Predictions</h3>
          <p className="text-3xl font-bold text-medical-600">{data?.total_predictions ?? 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Last Prediction</h3>
          <p className="text-lg font-semibold text-slate-800 leading-snug">
            {data?.last_prediction ?? 'No data available'}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Reports Uploaded</h3>
          <p className="text-3xl font-bold text-slate-800">{data?.reports_uploaded ?? 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Reminders</h3>
          <p className="text-3xl font-bold text-slate-800">{data?.active_reminders ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Recent Predictions</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Disease</th>
                    <th className="text-left py-2 font-medium text-slate-700">Result</th>
                    <th className="text-left py-2 font-medium text-slate-700">Probability</th>
                    <th className="text-left py-2 font-medium text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row, i) => (
                    <tr key={`${row.disease}-${row.date}-${i}`} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{row.disease}</td>
                      <td className="py-2 text-slate-700">{row.result}</td>
                      <td className="py-2 text-slate-700">{row.probability}</td>
                      <td className="py-2 text-slate-600">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-1">Tips to stay healthy</h3>
          <p className="text-xs text-slate-500 mb-4">
            Fresh ideas for your session — we refresh these when you log in.
          </p>
          {tips.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No tips available right now.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {tips.map((tip, idx) => (
                <li key={`${idx}-${tip.slice(0, 24)}`}>{tip}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="font-semibold text-slate-800">Medical Chatbot — recent chats</h3>
          <Link
            to="/chatbot"
            className="text-sm font-medium text-medical-700 hover:text-medical-600 hover:underline"
          >
            Open chatbot
          </Link>
        </div>
        <p className="text-xs text-slate-500 mb-3">Up to 5 latest conversations (same style as chatbot history).</p>
        {recentChats.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">No chat history yet. Open the chatbot to start a conversation.</p>
        ) : (
          <ul className="space-y-1 -mx-1">
            {recentChats.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/chatbot?conversation=${c.id}`}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-100"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-medical-600 text-xs font-semibold text-white">
                    {previewInitials(c.preview)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-slate-800 block">{c.preview}</span>
                    {c.updated_at ? (
                      <span className="text-xs text-slate-500 mt-0.5 block">{formatChatUpdated(c.updated_at)}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
