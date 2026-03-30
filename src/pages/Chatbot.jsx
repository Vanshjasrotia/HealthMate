import { useState, useRef, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

const initialMessages = [
  { id: 1, text: 'Hello! I can provide general medical information. How can I help you today?', isBot: true },
]

export default function Chatbot() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const API_BASE_URL = 'http://127.0.0.1:8000'

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

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      const botMsg = {
        id: Date.now() + 1,
        text: data.reply,
        isBot: true,
      }
      setMessages((prev) => [...prev, botMsg])
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
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical Chatbot</h1>
      <p className="text-slate-600 mb-4">
        Ask me about your health and medical questions, I'm here to help you.
      </p>

      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
        This chatbot provides general medical information only.
      </p>

      <Card padding={false} className="overflow-hidden">
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
  )
}
