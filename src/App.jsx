import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthRoutePrompt from './components/AuthRoutePrompt'
import { AuthModalProvider } from './contexts/AuthModalContext'
import Home from './pages/Home'
import DiseasePrediction from './pages/DiseasePrediction'
import Chatbot from './pages/Chatbot'
import ReportAnalyzer from './pages/ReportAnalyzer'
import MedicationReminder from './pages/MedicationReminder'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <AuthModalProvider>
        <AuthRoutePrompt />
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
        <Footer />
        </div>
      </AuthModalProvider>
    </BrowserRouter>
  )
}
