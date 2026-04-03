import { getJsonAuthHeaders, notifyAuthChanged } from './authHeaders'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data = {}
  try {
    data = await response.json()
  } catch (error) {
    data = {}
  }

  if (!response.ok) {
    const message = data?.detail || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}

export async function signup(payload) {
  return request('/signup', payload)
}

export async function login(payload) {
  return request('/login', payload)
}

/** Regenerate AI wellness tips for the current user (call after login/signup). */
export async function refreshDashboardHealthTips() {
  const token = localStorage.getItem('token')
  if (!token) return
  await fetch(`${API_BASE_URL}/dashboard/health-tips`, {
    method: 'POST',
    headers: getJsonAuthHeaders(),
  })
}

export function persistAuth(authPayload) {
  const token = authPayload?.access_token || authPayload?.token
  if (!token) return
  localStorage.setItem('token', token)
  localStorage.setItem('access_token', token)
  if (authPayload.user) {
    localStorage.setItem('auth_user', JSON.stringify(authPayload.user))
  }
  notifyAuthChanged()
}

