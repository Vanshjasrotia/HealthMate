import { useEffect, useMemo, useState } from 'react'
import { createReminderSocket, requestNotificationPermission } from '../../features/notifications/notificationHandler'
import { stopReminderSound } from '../../features/notifications/soundAlert'

function ReminderPopup({ item, onClose }) {
  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-medical-200 bg-white shadow-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-medical-800">Medication Reminder</p>
          <p className="mt-1 text-sm text-slate-700">{item.message}</p>
          <p className="mt-2 text-xs text-slate-500">Scheduled at {item.time || '--:--'}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={stopReminderSound}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Stop Alarm
        </button>
      </div>
    </div>
  )
}

export default function ReminderPopupHost() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    const connection = createReminderSocket({
      onStatusChange: setStatus,
      onReminder: (payload, message) => {
        const id = `${payload.reminder_id}-${Date.now()}`
        setItems((current) => [...current, { id, message, time: payload.time }])

        window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id))
        }, 10000)
      },
    })

    return () => {
      connection.disconnect()
    }
  }, [])

  const isConnected = useMemo(() => status === 'connected', [status])

  return (
    <>
      <div className="fixed top-20 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 pointer-events-none">
        {items.map((item) => (
          <ReminderPopup key={item.id} item={item} onClose={() => setItems((cur) => cur.filter((x) => x.id !== item.id))} />
        ))}
      </div>

      <div className="fixed bottom-4 right-4 z-[60]">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          Reminder alerts: {isConnected ? 'Live' : status}
        </span>
      </div>
    </>
  )
} 
