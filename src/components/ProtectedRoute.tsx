import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate portal based on user role
    const roleRoutes = {
      PATIENT: '/patient',
      DOCTOR: '/doctor',
      NURSE: '/nurse',
      RECEPTIONIST: '/receptionist',
      PHARMACIST: '/pharmacist',
      ADMIN: '/admin'
    }

    const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
