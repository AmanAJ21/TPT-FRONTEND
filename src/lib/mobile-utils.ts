/**
 * Mobile utility functions and hooks
 */

import { useEffect, useState } from 'react'

// Device detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const isTablet = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export const isDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
}

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Viewport utilities
export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
  }
}

// React hooks for mobile functionality
export const useViewportSize = () => {
  const [size, setSize] = useState(getViewportSize)

  useEffect(() => {
    const handleResize = () => setSize(getViewportSize())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

export const useIsMobile = () => {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setMobile(isMobile())
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return mobile
}

export const useIsTablet = () => {
  const [tablet, setTablet] = useState(false)

  useEffect(() => {
    const checkTablet = () => setTablet(isTablet())
    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  return tablet
}

export const useIsTouchDevice = () => {
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    setTouch(isTouchDevice())
  }, [])

  return touch
}

// Touch event handlers
export const handleTouchFeedback = (element: HTMLElement) => {
  if (!isTouchDevice()) return

  const addFeedback = () => {
    element.style.transform = 'scale(0.98)'
    element.style.opacity = '0.8'
  }

  const removeFeedback = () => {
    element.style.transform = 'scale(1)'
    element.style.opacity = '1'
  }

  element.addEventListener('touchstart', addFeedback, { passive: true })
  element.addEventListener('touchend', removeFeedback, { passive: true })
  element.addEventListener('touchcancel', removeFeedback, { passive: true })

  return () => {
    element.removeEventListener('touchstart', addFeedback)
    element.removeEventListener('touchend', removeFeedback)
    element.removeEventListener('touchcancel', removeFeedback)
  }
}

// Prevent zoom on input focus (iOS)
export const preventZoomOnFocus = () => {
  if (typeof document === 'undefined') return

  const inputs = document.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    if (input instanceof HTMLElement) {
      input.style.fontSize = '16px'
    }
  })
}

// Haptic feedback (if supported)
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    }
    navigator.vibrate(patterns[type])
  }
}

// Mobile-optimized scroll utilities
export const smoothScrollTo = (element: HTMLElement | string, offset = 0) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element
  if (!target) return

  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  })
}

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}

// Mobile-friendly image loading
export const optimizeImageForMobile = (src: string, width?: number) => {
  if (!width) {
    width = isMobile() ? 400 : isTablet() ? 800 : 1200
  }
  
  // Add width parameter for optimization (if using a service like Cloudinary or similar)
  if (src.includes('cloudinary.com')) {
    return src.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
  }
  
  return src
}

// CSS class utilities
export const getMobileClasses = () => ({
  container: 'px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  card: 'p-4 sm:p-6',
  text: 'text-sm sm:text-base',
  heading: 'text-lg sm:text-xl lg:text-2xl',
  button: 'min-h-[44px] touch-manipulation w-full sm:w-auto',
  input: 'text-base min-h-[44px]',
  spacing: 'space-y-4 sm:space-y-6',
  gap: 'gap-3 sm:gap-4 lg:gap-6',
})

// Performance utilities for mobile
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Form validation
export const validateMobileForm = (formData: FormData) => {
  const errors: Record<string, string> = {}
  
  // Add validation rules
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  
  if (email && !email.includes('@')) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export default {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getViewportSize,
  getSafeAreaInsets,
  useViewportSize,
  useIsMobile,
  useIsTablet,
  useIsTouchDevice,
  handleTouchFeedback,
  preventZoomOnFocus,
  triggerHapticFeedback,
  smoothScrollTo,
  lockBodyScroll,
  unlockBodyScroll,
  optimizeImageForMobile,
  getMobileClasses,
  debounce,
  throttle,
  validateMobileForm,
}