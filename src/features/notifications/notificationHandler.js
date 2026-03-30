import { playReminderSound } from './soundAlert'

export function showBrowserNotification(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag: 'healthmate-reminder',
  })
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function createReminderSocket({ onReminder, onStatusChange }) {
  let socket = null
  let reconnectTimer = null
  let closedManually = false

  const connect = () => {
    const token = localStorage.getItem("token")
    const wsUrl = token
      ? `ws://127.0.0.1:8001/ws/reminders?token=${token}`
      : null

    if (!wsUrl) {
      onStatusChange?.('no-token')
      if (!closedManually) {
        if (reconnectTimer) {
          window.clearTimeout(reconnectTimer)
        }
        reconnectTimer = window.setTimeout(connect, 2000)
      }
      return
    }
    console.log('Connecting to WebSocket:', wsUrl)
    onStatusChange?.('connecting')
    if (socket && socket.readyState <= WebSocket.OPEN) {
      return
    }
    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('WebSocket connected')
      onStatusChange?.('connected')
    }

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data)
        console.log(payload)
        if (payload?.type !== 'reminder_due') return

        const message = payload.message || `Time to take ${payload.medicine_name || 'your medicine'}`
        onReminder?.(payload, message)

        console.log('Notification triggered:', message)
        showBrowserNotification('Medication Reminder', message)
        if (!window.__alarmPlaying) {
          window.__alarmPlaying = true
          console.log('Playing alarm')
          await playReminderSound()
        }
      } catch (error) {
        // Ignore malformed message payloads to keep socket alive.
      }
    }

    socket.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
      onStatusChange?.('disconnected')
      if (!closedManually) {
        if (reconnectTimer) {
          window.clearTimeout(reconnectTimer)
        }
        reconnectTimer = window.setTimeout(connect, 2000)
      }
    }
  }

  connect()

  return {
    disconnect: () => {
      closedManually = true
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
      }
      if (socket && socket.readyState <= WebSocket.OPEN) {
        socket.close()
      }
    },
  }
}

