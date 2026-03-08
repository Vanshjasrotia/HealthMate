import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

const initialMessages = [
  { id: 1, text: 'Hello! I can provide general medical information. How can I help you today?', isBot: true },
]

export default function Chatbot() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { id: Date.now(), text: input.trim(), isBot: false }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        text: 'This is a placeholder response. In a full implementation, an AI would reply here.',
        isBot: true,
      }
      setMessages((prev) => [...prev, botReply])
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical Chatbot</h1>
      <p className="text-slate-600 mb-4">
        Ask general health-related questions. Responses are for illustration only.
      </p>

      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
        This chatbot provides general medical information only.
      </p>

      <Card padding={false} className="overflow-hidden">
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
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
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
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
