import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthModal, isLoggedIn } from '../contexts/AuthModalContext'

const PROMPT_PATHS = ['/disease-prediction', '/report-analyzer', '/medication-reminder', '/chatbot']

/**
 * When user opens a feature tab while logged out, show the login/signup dialog.
 */
export default function AuthRoutePrompt() {
  const location = useLocation()
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    if (!PROMPT_PATHS.includes(location.pathname)) return
    if (isLoggedIn()) return
    openAuthModal('login')
  }, [location.pathname, openAuthModal])

  return null
}
