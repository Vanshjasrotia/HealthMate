import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Animated background particles ─── */
function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 55
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.45 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(38, 122, 82, ${0.13 * (1 - dist / 130)})`
            ctx.lineWidth = 0.6
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(53, 152, 105, ${p.opacity})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

/* ─── Floating pulse ring ─── */
function PulseRing({ size, delay, color }) {
  return (
    <div
      className="absolute rounded-full border pointer-events-none"
      style={{
        width: size,
        height: size,
        borderColor: color || 'rgba(38,122,82,0.18)',
        animation: 'pulseRing 4s ease-out infinite',
        animationDelay: delay,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}

/* ─── Animated counter ─── */
function AnimatedStat({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const target = parseInt(value)
          const duration = 1400
          const step = 16
          const steps = duration / step
          let current = 0
          const inc = target / steps
          const timer = setInterval(() => {
            current += inc
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, step)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center group">
      <div className="text-4xl font-bold text-medical-700 tabular-nums transition-transform duration-300 group-hover:scale-110">
        {count}{suffix}
      </div>
      <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
    </div>
  )
}

/* ─── Feature data ─── */
const features = [
  {
    title: 'Disease Risk Prediction',
    description:
      'Enter health metrics and get AI-powered risk assessment for diabetes, heart, liver, and kidney conditions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    path: '/disease-prediction',
    gradFrom: 'from-emerald-50',
    gradTo: 'to-teal-50',
    accent: 'bg-emerald-100 text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
    tag: 'AI Powered',
  },
  {
    title: 'Medical Chatbot',
    description:
      'Get evidence-based medical information and health guidance from our AI assistant, available 24/7.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    path: '/chatbot',
    gradFrom: 'from-blue-50',
    gradTo: 'to-sky-50',
    accent: 'bg-blue-100 text-blue-700',
    hoverBorder: 'hover:border-blue-300',
    tag: 'Gemini AI',
  },
  {
    title: 'Report Analyzer',
    description:
      'Upload lab reports (PDF or image) and get an instant plain-language summary with flagged abnormal values.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    path: '/report-analyzer',
    gradFrom: 'from-violet-50',
    gradTo: 'to-purple-50',
    accent: 'bg-violet-100 text-violet-700',
    hoverBorder: 'hover:border-violet-300',
    tag: 'Vision AI',
  },
  {
    title: 'Medication Reminder',
    description:
      'Schedule medication alerts with flexible frequencies — daily, weekdays, or custom. Never miss a dose.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/medication-reminder',
    gradFrom: 'from-amber-50',
    gradTo: 'to-orange-50',
    accent: 'bg-amber-100 text-amber-700',
    hoverBorder: 'hover:border-amber-300',
    tag: 'Smart Alerts',
  },
]

/* ─── Feature card with hover tilt ─── */
function FeatureCard({ feature, index }) {
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setTiltX(dy * -6)
    setTiltY(dx * 6)
  }

  const handleMouseLeave = () => {
    setTiltX(0)
    setTiltY(0)
    setHovered(false)
  }

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(feature.path)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={[
        'relative cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden',
        'transition-shadow duration-300',
        feature.hoverBorder,
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{
        transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${visible ? 0 : 32}px)`,
        transition: `transform 0.25s ease, opacity 0.7s ease ${index * 100}ms, box-shadow 0.3s ease`,
        boxShadow: hovered
          ? '0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(38,122,82,0.1)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Gradient background on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradFrom} ${feature.gradTo}`}
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-medical-400 to-transparent"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl ${feature.accent}`}
            style={{
              transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            {feature.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-semibold text-slate-800 text-base">{feature.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${feature.accent} font-medium whitespace-nowrap`}>
                {feature.tag}
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
          </div>
        </div>
        <div
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-medical-600"
          style={{
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}
        >
          Explore feature
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ─── Typing animation ─── */
function TypingText({ texts }) {
  const [idx, setIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    let timeout
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 55)
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIdx((i) => (i + 1) % texts.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, idx, texts])

  return (
    <span>
      {displayed}
      <span className="animate-pulse text-medical-500 ml-0.5">|</span>
    </span>
  )
}

/* ─── Scroll reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── Main component ─── */
export default function Home() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-medical-50/60 to-teal-50/40" />

        {/* Mouse-following radial glow */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(38,122,82,0.09) 0%, transparent 70%)',
            transform: `translate(${mousePos.x - 192}px, ${mousePos.y - 192}px)`,
            transition: 'transform 0.7s ease-out',
          }}
        />

        <ParticleField />

        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PulseRing size={260} delay="0s" color="rgba(38,122,82,0.08)" />
          <PulseRing size={460} delay="1.2s" color="rgba(38,122,82,0.05)" />
          <PulseRing size={680} delay="2.4s" color="rgba(38,122,82,0.03)" />
        </div>

        {/* Floating blobs */}
        <div className="absolute top-16 right-16 w-64 h-64 rounded-full bg-medical-100/30 blur-3xl pointer-events-none hm-blob" />
        <div className="absolute bottom-24 left-8 w-80 h-80 rounded-full bg-teal-100/25 blur-3xl pointer-events-none hm-blob-delay" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-medical-200 text-medical-700 text-sm font-medium mb-8 shadow-sm hm-fadeInDown">
            <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse" />
            AI-Powered Preventive Healthcare
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight hm-fadeInUp tracking-tight">
            Health
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500">
              Mate
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 mb-4 font-light hm-fadeInUp hm-delay-200">
            Your intelligent companion for
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-medical-700 mb-10 h-10 hm-fadeInUp hm-delay-300">
            <TypingText
              texts={[
                'preventive healthcare.',
                'disease risk assessment.',
                'lab report analysis.',
                'medication management.',
              ]}
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center hm-fadeInUp hm-delay-500">
            <button
              onClick={() => navigate('/disease-prediction')}
              className="group relative px-8 py-3.5 bg-medical-600 text-white font-semibold rounded-xl overflow-hidden shadow-lg shadow-medical-200 hover:shadow-xl hover:shadow-medical-300 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-medical-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="px-8 py-3.5 bg-white/80 backdrop-blur-sm text-medical-700 font-semibold rounded-xl border border-medical-200 hover:bg-white hover:border-medical-400 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
            >
              Talk to AI
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
          <span className="text-xs text-slate-400 tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative bg-white border-y border-slate-100 py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-medical-50/40 via-transparent to-medical-50/40" />
        <div className="relative max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value="4" label="Disease Models" suffix="+" />
          <AnimatedStat value="24" label="Availability" suffix="/7" />
          <AnimatedStat value="100" label="Accuracy Focused" suffix="%" />
          <AnimatedStat value="0" label="Cost to Try" suffix="₹" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-20 px-4 bg-slate-50/60">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-medical-500 mb-3 px-3 py-1 bg-medical-50 rounded-full border border-medical-100">
              Core Features
            </span>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">
              Everything you need for
              <br />
              <span className="text-medical-600">proactive health management</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-medical-500 mb-3 px-3 py-1 bg-medical-50 rounded-full border border-medical-100">
              How It Works
            </span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Simple. Intelligent. Private.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Choose a tool',
                desc: 'Pick disease prediction, chatbot, report analyzer, or medication reminder from the navigation.',
                icon: '🎯',
              },
              {
                step: '02',
                title: 'Enter your data',
                desc: 'Input health metrics, upload a lab report, ask a medical question, or schedule your medications.',
                icon: '📝',
              },
              {
                step: '03',
                title: 'Get AI insights',
                desc: 'Receive instant AI-powered analysis, risk scores, plain-language summaries, and actionable advice.',
                icon: '✨',
              },
            ].map((step, i) => (
              <Reveal key={step.step} delay={i * 150}>
                <div className="relative p-6 rounded-2xl border border-slate-100 bg-white hover:border-medical-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-5xl font-black text-slate-100 group-hover:text-medical-100 transition-colors duration-300 absolute top-4 right-5 leading-none select-none">
                    {step.step}
                  </div>
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <Reveal>
        <section className="relative mx-4 mb-16 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-medical-700 via-medical-600 to-teal-600" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)',
            }}
          />
          {/* Decorative spinning rings */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10 hm-spin-slow pointer-events-none" />
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/15 hm-spin-rev pointer-events-none" />

          <div className="relative px-10 py-14 text-center md:text-left max-w-2xl">
            <p className="text-medical-200 text-sm font-semibold uppercase tracking-widest mb-3">Free to use</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
              Start understanding your health today
            </h2>
            <p className="text-medical-100/80 mb-8 leading-relaxed">
              No subscriptions. No hidden fees. Just intelligent tools to help you make better health decisions.
            </p>
            <button
              onClick={() => navigate('/disease-prediction')}
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-medical-700 font-semibold rounded-xl hover:bg-medical-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Try Disease Prediction
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>
      </Reveal>

      {/* ── Disclaimer ── */}
      <Reveal>
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-900 font-semibold text-sm mb-0.5">Medical Disclaimer</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                HealthMate is not a substitute for professional medical advice, diagnosis, or treatment.
                All content is for educational purposes only. Always consult a qualified healthcare provider for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1.5);  opacity: 0; }
        }
        @keyframes hmFadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hmFadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hmBlob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(20px,-20px) scale(1.05); }
          66%  { transform: translate(-15px,10px) scale(0.97); }
        }
        @keyframes hmSpinSlow    { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes hmSpinSlowRev { to { transform: translateY(-50%) rotate(-360deg); } }

        .hm-fadeInDown { animation: hmFadeInDown 0.7s ease both; }
        .hm-fadeInUp   { animation: hmFadeInUp   0.7s ease both; }
        .hm-delay-200  { animation-delay: 0.2s; }
        .hm-delay-300  { animation-delay: 0.3s; }
        .hm-delay-500  { animation-delay: 0.5s; }
        .hm-blob       { animation: hmBlob  9s ease-in-out infinite; }
        .hm-blob-delay { animation: hmBlob 11s ease-in-out infinite 2s; }
        .hm-spin-slow  { animation: hmSpinSlow    18s linear infinite; }
        .hm-spin-rev   { animation: hmSpinSlowRev 14s linear infinite; }
      `}</style>
    </div>
  )
}
