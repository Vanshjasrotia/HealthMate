# HealthMate – Complete Code Reference

All project source code and instructions in this file only. Use for backup or reference.

## Folder structure

```
HealthMate/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── COMPLETE_CODE.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── Card.jsx
    │   └── Button.jsx
    └── pages/
        ├── Home.jsx
        ├── DiseasePrediction.jsx
        ├── Chatbot.jsx
        ├── ReportAnalyzer.jsx
        ├── MedicationReminder.jsx
        └── Dashboard.jsx
```

## Run

```bash
npm install
npm start
```

Open http://localhost:5173/

## Build

```bash
npm run build
npm run preview
```

## Pages

- **Home** – Overview, key features, disclaimer
- **Disease Prediction** – Form (age, gender, BP, glucose, cholesterol, BMI) and result placeholder
- **Medical Chatbot** – Chat UI with user/bot messages and disclaimer
- **Report Analyzer** – File upload and placeholder extracted/abnormal values
- **Medication Reminder** – Add reminders, list with remove
- **Dashboard** – Cards (last prediction, risk score, reminders) and placeholder charts

All data is dummy/placeholder; no API calls.

---

## package.json

```json
{
  "name": "healthmate",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0"
  }
}
```

---

## vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HealthMate - AI Powered Medical Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f9f4',
          100: '#dcf3e6',
          200: '#bce5cf',
          300: '#8dd0ad',
          400: '#58b486',
          500: '#359869',
          600: '#267a52',
          700: '#206243',
          800: '#1b4f38',
          900: '#18412f',
        },
        accent: {
          light: '#e8f5e9',
          DEFAULT: '#4caf50',
          dark: '#2e7d32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
  @apply bg-slate-50 text-slate-800 antialiased;
}
```

---

## src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## src/App.jsx

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import DiseasePrediction from './pages/DiseasePrediction'
import Chatbot from './pages/Chatbot'
import ReportAnalyzer from './pages/ReportAnalyzer'
import MedicationReminder from './pages/MedicationReminder'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/disease-prediction" element={<DiseasePrediction />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/report-analyzer" element={<ReportAnalyzer />} />
            <Route path="/medication-reminder" element={<MedicationReminder />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
```

---

## src/components/Navbar.jsx

```jsx
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/disease-prediction', label: 'Disease Prediction' },
  { path: '/chatbot', label: 'Medical Chatbot' },
  { path: '/report-analyzer', label: 'Report Analyzer' },
  { path: '/medication-reminder', label: 'Medication Reminder' },
  { path: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-xl font-bold text-medical-700 hover:text-medical-600 transition-colors"
          >
            HealthMate
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-medical-100 text-medical-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden relative group">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="absolute right-0 mt-1 w-48 py-2 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 text-sm ${
                    location.pathname === link.path ? 'bg-medical-100 text-medical-800' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
```

---

## src/components/Footer.jsx

```jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-lg font-bold text-medical-700">
              HealthMate
            </Link>
            <p className="mt-2 text-sm text-slate-600">
              AI Powered Medical Assistant for Preventive Healthcare
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-slate-600 hover:text-medical-600">Home</Link>
              </li>
              <li>
                <Link to="/disease-prediction" className="text-sm text-slate-600 hover:text-medical-600">Disease Prediction</Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-sm text-slate-600 hover:text-medical-600">Medical Chatbot</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-slate-600 hover:text-medical-600">Dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Disclaimer</h4>
            <p className="text-sm text-slate-600">
              HealthMate is for educational and informational purposes only. It does not provide medical diagnosis, treatment, or professional advice. Always consult a qualified healthcare provider for medical decisions.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} HealthMate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```

---

## src/components/Card.jsx

```jsx
export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${
        padding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

---

## src/components/Button.jsx

```jsx
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-medical-600 text-white hover:bg-medical-700 focus:ring-medical-500',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
    outline: 'border-2 border-medical-600 text-medical-700 hover:bg-medical-50 focus:ring-medical-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## src/pages/Home.jsx

```jsx
import Card from '../components/Card'

const features = [
  {
    title: 'Disease Risk Prediction',
    description: 'Enter your health metrics to get AI-powered risk assessment for common conditions.',
    icon: '📊',
  },
  {
    title: 'Medical Chatbot',
    description: 'Get general medical information and answers to health-related questions 24/7.',
    icon: '💬',
  },
  {
    title: 'Report Analyzer',
    description: 'Upload lab reports and get extracted values with highlighted abnormal parameters.',
    icon: '📄',
  },
  {
    title: 'Medication Reminder',
    description: 'Set and manage medication reminders to stay on track with your treatment.',
    icon: '⏰',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-gradient-to-b from-medical-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-medical-800 mb-4">
            HealthMate
          </h1>
          <p className="text-xl text-slate-600">
            AI Powered Medical Assistant for Preventive Healthcare
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <Card className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Overview of HealthMate</h2>
          <p className="text-slate-600 leading-relaxed">
            HealthMate is a comprehensive health companion that helps you understand your health metrics,
            get general medical information, analyze lab reports, and manage medication schedules.
            Our tools are designed to support preventive healthcare and informed decision-making.
          </p>
        </Card>

        <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => (
            <Card key={feature.title}>
              <div className="flex gap-4">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2">Disclaimer</h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            HealthMate is not a substitute for professional medical advice, diagnosis, or treatment.
            All content is for educational use only. Always seek the advice of your physician or
            other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </Card>
      </section>
    </div>
  )
}
```

---

## src/pages/DiseasePrediction.jsx

```jsx
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
```

---

## src/pages/Chatbot.jsx

```jsx
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
```

---

## src/pages/ReportAnalyzer.jsx

```jsx
import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

const placeholderExtracted = [
  { name: 'Glucose', value: '98 mg/dL', normal: true },
  { name: 'Cholesterol', value: '210 mg/dL', normal: false },
  { name: 'HbA1c', value: '5.4%', normal: true },
  { name: 'Creatinine', value: '1.2 mg/dL', normal: true },
]

export default function ReportAnalyzer() {
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setUploaded(false)
    }
  }

  const handleUpload = (e) => {
    e.preventDefault()
    if (file) setUploaded(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Report Analyzer</h1>
      <p className="text-slate-600 mb-8">
        Upload a lab report (PDF or image) to see extracted values. This is a UI placeholder.
      </p>

      <Card className="mb-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select file (PDF / Image)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-medical-100 file:text-medical-800 file:font-medium hover:file:bg-medical-200"
            />
            {file && (
              <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p>
            )}
          </div>
          <Button type="submit" disabled={!file}>
            Upload & Analyze
          </Button>
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
                  </tr>
                </thead>
                <tbody>
                  {placeholderExtracted.map((row) => (
                    <tr key={row.name} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{row.name}</td>
                      <td className="py-2 text-slate-700">{row.value}</td>
                      <td className="py-2">
                        <span className={row.normal ? 'text-medical-600' : 'text-amber-600 font-medium'}>
                          {row.normal ? 'Normal' : 'Abnormal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">Highlighted Abnormal Parameters</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Cholesterol: 210 mg/dL (above normal range)</li>
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
            <p className="text-sm">Upload a file to see placeholder extracted values</p>
          </div>
        </Card>
      )}
    </div>
  )
}
```

---

## src/pages/MedicationReminder.jsx

```jsx
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
```

---

## src/pages/Dashboard.jsx

```jsx
import Card from '../components/Card'

const chartPlaceholder = (
  <div className="h-32 flex items-end justify-around gap-2 px-2">
    {[40, 65, 45, 80, 55, 70].map((h, i) => (
      <div
        key={i}
        className="flex-1 bg-medical-200 rounded-t max-w-[40px] transition-all"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
)

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-600 mb-8">
        Overview of your health data. All values are placeholders.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Last Prediction</h3>
          <p className="text-xl font-semibold text-slate-800">Cardiovascular risk</p>
          <p className="text-sm text-slate-600 mt-1">24% risk — Dec 15, 2024</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Health Risk Score</h3>
          <p className="text-3xl font-bold text-medical-600">72</p>
          <p className="text-sm text-slate-600 mt-1">Moderate (0–100 scale)</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Medication Reminders</h3>
          <p className="text-3xl font-bold text-slate-800">2</p>
          <p className="text-sm text-slate-600 mt-1">Vitamin D, Omega-3</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Weekly Risk Trend (placeholder)</h3>
          {chartPlaceholder}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Health Metrics (placeholder)</h3>
          {chartPlaceholder}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

---

End of complete code.
