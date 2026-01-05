import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children }: { children: ReactElement }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  return children
}

