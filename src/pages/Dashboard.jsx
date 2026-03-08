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
