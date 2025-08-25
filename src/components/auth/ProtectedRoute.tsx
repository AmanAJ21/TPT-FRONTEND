"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check authentication immediately when component mounts
    const checkAuth = () => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = window.location.pathname
        const loginUrl = `/login${currentPath !== '/' && currentPath !== '/dashboard' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`
        
        // Use window.location for immediate redirect
        window.location.href = loginUrl
      }
    }

    checkAuth()
  }, [isLoading, isAuthenticated, router])

  // Immediate redirect check - don't render anything if not authenticated
  if (!isAuthenticated) {
    // Trigger immediate redirect
    if (!isLoading) {
      const currentPath = window.location.pathname
      const loginUrl = `/login${currentPath !== '/' && currentPath !== '/dashboard' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`
      window.location.href = loginUrl
    }
    return null
  }

  // Only render children if authenticated
  return <>{children}</>
}