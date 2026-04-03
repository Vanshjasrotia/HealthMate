export function notifyAuthChanged() {
  try {
    window.dispatchEvent(new Event('healthmate-auth-changed'))
  } catch {
    /* ignore */
  }
}

/** Attach Bearer token when the user is logged in (optional for public endpoints). */
export function getJsonAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/** For FormData uploads — do not set Content-Type (browser sets multipart boundary). */
export function getBearerAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
  notifyAuthChanged()
}
