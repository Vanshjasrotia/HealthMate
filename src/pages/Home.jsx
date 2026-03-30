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
