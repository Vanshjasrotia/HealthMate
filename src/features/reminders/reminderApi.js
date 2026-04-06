import { API_BASE_URL } from '../../config/api'

function getAccessToken() {
  return localStorage.getItem('access_token') || ''
}

async function request(path, options = {}) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null

  let data = {}
  try {
    data = await response.json()
  } catch (error) {
    data = {}
  }

  if (!response.ok) {
    throw new Error(data?.detail || 'Request failed.')
  }

  return data
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

export function listReminders() {
  return request('/reminders')
}

export function createReminder({ medicineName, time, frequency }) {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 30)

  return request('/reminders', {
    method: 'POST',
    body: JSON.stringify({
      medicine_name: medicineName,
      time,
      frequency,
      start_date: formatDate(today),
      end_date: formatDate(endDate),
    }),
  })
}

export function deleteReminder(id) {
  return request(`/reminders/${id}`, { method: 'DELETE' })
}

