import { playReminderSound } from './soundAlert'

function getStoredToken() {
  return window.localStorage.getItem('token')
}

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
    const token = getStoredToken()
    if (!token) {
      onStatusChange?.('no-token')
      if (!closedManually) {
        reconnectTimer = window.setTimeout(connect, 2000)
      }
      return
    }
    const wsUrl = `ws://127.0.0.1:8001/ws/reminders?token=${encodeURIComponent(token)}`
    socket = new WebSocket(wsUrl)
    onStatusChange?.('connecting')

    socket.onopen = () => {
      onStatusChange?.('connected')
    }

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type !== 'reminder_due') return

        const message = payload.message || `Time to take ${payload.medicine_name || 'your medicine'}`
        onReminder?.(payload, message)

        showBrowserNotification('Medication Reminder', message)
        await playReminderSound()
      } catch (error) {
        // Ignore malformed message payloads to keep socket alive.
      }
    }

    socket.onerror = () => {
      onStatusChange?.('error')
    }

    socket.onclose = () => {
      onStatusChange?.('disconnected')
      if (!closedManually) {
        reconnectTimer = window.setTimeout(connect, 3000)
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

