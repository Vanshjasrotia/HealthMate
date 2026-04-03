import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { isLoggedIn } from '../contexts/AuthModalContext'
import { getJsonAuthHeaders } from '../features/auth/authHeaders'

const CHAT_PREVIEW_KEY = 'healthmate_chat_preview'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const initialMessages = [
  { id: 1, text: 'Hello! I can provide general medical information. How can I help you today?', isBot: true },
]

function hasStoredToken() {
  try {
    return !!localStorage.getItem('token')
  } catch {
    return false
  }
}

/** Two-letter initials from first words of preview (sidebar avatar). */
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

function mapHistoryToMessages(rows) {
  return (rows || []).map((m) => ({
    id: m.id,
    text: m.content,
    isBot: m.role === 'assistant',
  }))
}

export default function Chatbot() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState(initialMessages)
  const [bootstrapping, setBootstrapping] = useState(() => hasStoredToken())
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, bootstrapping])

  useEffect(() => {
    const tail = messages.slice(-3).map((m) => ({
      role: m.isBot ? 'assistant' : 'user',
      text: (m.text || '').slice(0, 280),
    }))
    try {
      localStorage.setItem(CHAT_PREVIEW_KEY, JSON.stringify(tail))
    } catch {
      /* ignore */
    }
  }, [messages])

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setConversations([])
      return []
    }
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return []
      const data = await res.json()
      const list = data.conversations || []
      setConversations(list)
      return list
    } catch {
      return []
    }
  }, [])

  const fetchMessagesFor = useCallback(async (conversationId) => {
    const token = localStorage.getItem('token')
    if (!token) return []
    const res = await fetch(
      `${API_BASE_URL}/chat/history?conversation_id=${encodeURIComponent(conversationId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return mapHistoryToMessages(data.messages)
  }, [])

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setConversations([])
      setMessages(initialMessages)
      setActiveConversationId(null)
      setBootstrapping(false)
      return
    }

    setBootstrapping(true)
    try {
      await fetchConversations()
      const convParam = searchParams.get('conversation')
      if (convParam) {
        const cid = parseInt(convParam, 10)
        if (Number.isFinite(cid)) {
          const loaded = await fetchMessagesFor(cid)
          if (loaded.length > 0) {
            setActiveConversationId(cid)
            setMessages(loaded)
          } else {
            setActiveConversationId(null)
            setMessages(initialMessages)
          }
        } else {
          setActiveConversationId(null)
          setMessages(initialMessages)
        }
      } else {
        setActiveConversationId(null)
        setMessages(initialMessages)
      }
    } catch {
      setMessages(initialMessages)
      setActiveConversationId(null)
    } finally {
      setBootstrapping(false)
    }
  }, [fetchConversations, fetchMessagesFor, searchParams])

  const openThread = useCallback(
    async (conversationId) => {
      setBootstrapping(true)
      setActiveConversationId(conversationId)
      try {
        const loaded = await fetchMessagesFor(conversationId)
        setMessages(loaded.length > 0 ? loaded : initialMessages)
      } finally {
        setBootstrapping(false)
      }
    },
    [fetchMessagesFor]
  )

  const startNewChat = useCallback(() => {
    setActiveConversationId(null)
    setMessages(initialMessages)
    if (searchParams.get('conversation')) {
      navigate('/chatbot', { replace: true })
    }
  }, [navigate, searchParams])

  useEffect(() => {
    bootstrap()
    const onAuth = () => {
      bootstrap()
    }
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === null) onAuth()
    }
    window.addEventListener('healthmate-auth-changed', onAuth)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('healthmate-auth-changed', onAuth)
      window.removeEventListener('storage', onStorage)
    }
  }, [bootstrap])

  const formatBotMessage = (text) =>
    text
      .split(/(?<=[.!?])\s+/)
      .map((part) =>
        part
          .trim()
          .replace(/^\*+\s*/, '')
          .replace(/\*\*(.+?)\*\*/g, '$1')
      )
      .filter(Boolean)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const messageText = input.trim()
    const userMsg = { id: Date.now(), text: messageText, isBot: false }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    const body = { message: messageText }
    if (isLoggedIn() && activeConversationId != null) {
      body.conversation_id = activeConversationId
    }

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      const botMsg = {
        id: Date.now() + 1,
        text: data.reply,
        isBot: true,
      }
      setMessages((prev) => [...prev, botMsg])

      if (data.conversation_id != null) {
        setActiveConversationId(data.conversation_id)
        await fetchConversations()
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 2,
        text: 'Sorry, something went wrong talking to the medical assistant.',
        isBot: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const loggedIn = isLoggedIn()
  const showSidebar = loggedIn

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical Chatbot</h1>
      <p className="text-slate-600 mb-4">
        Ask me about your health and medical questions, I'm here to help you.
      </p>

      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-3">
        This chatbot provides general medical information only.
      </p>
      {!loggedIn && (
        <p className="text-sm text-slate-600 mb-6">
          You can chat without signing in; messages are not saved. Log in for threads and history in your account.
        </p>
      )}
      {loggedIn && (
        <p className="text-sm text-slate-600 mb-6">
          Signed in: open a past chat from the left or start a new conversation.
        </p>
      )}

      <div className={`flex flex-col md:flex-row gap-4 ${showSidebar ? '' : ''}`}>
        {showSidebar && (
          <aside className="w-full md:w-64 md:flex-shrink-0 space-y-3">
            <Card className="p-3">
              <Button type="button" className="w-full mb-3" variant="secondary" onClick={startNewChat}>
                New chat
              </Button>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">History</h2>
              <ul className="max-h-[min(420px,50vh)] overflow-y-auto space-y-1 -mx-1">
                {conversations.length === 0 && (
                  <li className="text-xs text-slate-500 px-2 py-3">No past chats yet.</li>
                )}
                {conversations.map((c) => {
                  const active = c.id === activeConversationId
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => openThread(c.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${
                          active ? 'bg-medical-100 ring-1 ring-medical-300' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-medical-600 text-xs font-semibold text-white">
                          {previewInitials(c.preview)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-sm font-medium text-slate-800">{c.preview}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </aside>
        )}

        <Card padding={false} className="overflow-hidden relative flex-1 min-w-0">
          {bootstrapping && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-slate-600">
              Loading…
            </div>
          )}
          <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    msg.isBot
                      ? 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-medical-600 text-white'
                  }`}
                >
                  {msg.isBot && index > 0 ? (
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {formatBotMessage(msg.text).map((sentence, idx) => (
                        <li key={idx}>{sentence}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className="px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-medical-600 animate-pulse" />
              <span>HealthMate is thinking...</span>
            </div>
          )}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
            />
            <Button type="submit">Send</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}