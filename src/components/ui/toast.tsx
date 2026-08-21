'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { ...toast, id }
      
      setToasts((prev) => [...prev, newToast])

      const duration = toast.duration ?? 5000
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }

      return id
    },
    [dismiss]
  )

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'success', title, description })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'error', title, description, duration: 7000 })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'info', title, description })
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'warning', title, description })
    },
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[]
  dismiss: (id: string) => void
}) {
  return (
    <div 
      aria-live="polite" 
      aria-atomic="false"
      className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-start sm:justify-end sm:p-6"
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </div>
    </div>
  )
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const Icon = icons[toast.type]

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  }

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full overflow-hidden rounded-lg border shadow-lg transition-all',
        'data-[state=open]:animate-in data-[state=open]:slide-in-from-top-5 data-[state=open]:fade-in',
        'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-5 data-[state=closed]:fade-out',
        styles[toast.type]
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-state="open"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[toast.type])} aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
