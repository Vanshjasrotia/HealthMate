function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function defaultApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return stripTrailingSlash(import.meta.env.VITE_API_BASE_URL)
  }

  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000'
  }

  if (typeof window !== 'undefined') {
    return stripTrailingSlash(window.location.origin)
  }

  return 'http://127.0.0.1:8000'
}

export const API_BASE_URL = defaultApiBaseUrl()

export function getReminderWebSocketUrl(token) {
  if (!token) return null

  const explicitBase = stripTrailingSlash(import.meta.env.VITE_WS_BASE_URL || '')
  const baseUrl = explicitBase || API_BASE_URL
  const wsBase = baseUrl.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://')
  return `${wsBase}/ws/reminders?token=${encodeURIComponent(token)}`
}
