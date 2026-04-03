import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthModal } from '../contexts/AuthModalContext'

/** Opens the shared login dialog and sends the user to Home (modal stays open). */
export default function Login() {
  const navigate = useNavigate()
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    openAuthModal('login')
    navigate('/', { replace: true })
  }, [navigate, openAuthModal])

  return null
}
