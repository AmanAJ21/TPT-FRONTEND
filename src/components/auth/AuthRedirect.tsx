"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AuthRedirectProps {
  children: React.ReactNode
}

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If user is authenticated and on a public route, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      const redirectTo = searchParams.get('redirect')
      
      if (redirectTo) {
        // Redirect to the originally requested page
        window.location.href = redirectTo
      } else {
        // Redirect to dashboard by default
        window.location.href = '/dashboard'
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // If authenticated, don't show the public page content (middleware should handle this)
  if (!isLoading && isAuthenticated) {
    // Use immediate redirect
    const redirectTo = searchParams.get('redirect')
    window.location.href = redirectTo || '/dashboard'
    return null
  }

  // Show content only if not authenticated or still loading
  return <>{children}</>
}