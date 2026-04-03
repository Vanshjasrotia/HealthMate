import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import AuthModal from '../components/AuthModal'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [initialMode, setInitialMode] = useState('login')

  const openAuthModal = useCallback((mode = 'login') => {
    setInitialMode(mode === 'signup' ? 'signup' : 'login')
    setOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      openAuthModal,
      closeAuthModal,
      isModalOpen: open,
    }),
    [open, openAuthModal, closeAuthModal]
  )

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal isOpen={open} onClose={closeAuthModal} initialMode={initialMode} />
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }
  return ctx
}

/** True when JWT is in localStorage (same-tab login updates on next render via navigation). */
export function isLoggedIn() {
  return Boolean(typeof window !== 'undefined' && localStorage.getItem('token'))
}
