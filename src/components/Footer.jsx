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
