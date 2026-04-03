import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthModal } from '../contexts/AuthModalContext'

/** Opens the shared signup step and sends the user to Home (modal stays open). */
export default function Signup() {
  const navigate = useNavigate()
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    openAuthModal('signup')
    navigate('/', { replace: true })
  }, [navigate, openAuthModal])

  return null
}
