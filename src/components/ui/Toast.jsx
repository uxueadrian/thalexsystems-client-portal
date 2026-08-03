import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(null)

const TONES = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, message, type }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const config = TONES[toast.type] || TONES.success
          const Icon = config.icon
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg ${config.className}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
