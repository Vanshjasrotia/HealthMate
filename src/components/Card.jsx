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
