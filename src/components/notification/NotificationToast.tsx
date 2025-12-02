'use client'

import React from 'react'
import toast, { Toaster, Toast } from 'react-hot-toast'
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react'

// Custom Toast Component with close button - Storybook UI Style
const CustomToast = ({ t, message, type }: { t: Toast; message: string; type: 'success' | 'error' | 'loading' | 'info' }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    loading: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
    info: <Info className="w-5 h-5 text-slate-500" />,
  }

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-rose-50 border-rose-200',
    loading: 'bg-blue-50 border-blue-200',
    info: 'bg-slate-50 border-slate-200',
  }

  const textColors = {
    success: 'text-emerald-800',
    error: 'text-rose-800',
    loading: 'text-blue-800',
    info: 'text-slate-800',
  }

  return (
    <div
      className={`
        ${t.visible ? 'animate-enter' : 'animate-leave'}
        max-w-md w-full ${bgColors[type]} border rounded-2xl shadow-lg shadow-slate-200/50
        pointer-events-auto flex items-center gap-3 p-4 pr-3
        backdrop-blur-xl
      `}
    >
      {/* Icon */}
      <div className="shrink-0">
        {icons[type]}
      </div>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </p>

      {/* Close Button */}
      {type !== 'loading' && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 p-1.5 rounded-xl hover:bg-black/5 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      )}
    </div>
  )
}

// Toast utility functions with deduplication
const toastCache = new Map<string, number>()
const DEBOUNCE_TIME = 1000 // 1 second debounce

const createDebouncedToast = (
  type: 'success' | 'error' | 'loading' | 'info',
  message: string,
  options?: { id?: string }
) => {
  const cacheKey = `${type}-${message}`
  const now = Date.now()
  const lastShown = toastCache.get(cacheKey)

  // Prevent duplicate toasts within debounce time
  if (lastShown && now - lastShown < DEBOUNCE_TIME) {
    return
  }

  toastCache.set(cacheKey, now)

  // Clean old entries periodically
  if (toastCache.size > 50) {
    const entries = Array.from(toastCache.entries())
    entries.slice(0, 25).forEach(([key]) => toastCache.delete(key))
  }

  return toast.custom(
    (t) => <CustomToast t={t} message={message} type={type} />,
    {
      duration: type === 'loading' ? Infinity : type === 'error' ? 4000 : 3000,
      ...options,
    }
  )
}

// Export custom toast functions
export const customToast = {
  success: (message: string, options?: { id?: string }) =>
    createDebouncedToast('success', message, options),
  error: (message: string, options?: { id?: string }) =>
    createDebouncedToast('error', message, options),
  loading: (message: string, options?: { id?: string }) =>
    createDebouncedToast('loading', message, options),
  info: (message: string, options?: { id?: string }) =>
    createDebouncedToast('info', message, options),
  dismiss: toast.dismiss,
}

export default function NotificationToast() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
      }}
    />
  )
}
