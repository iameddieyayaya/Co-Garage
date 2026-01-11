import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const classForType: Record<ToastType, { border: string; bg: string; title: string; text: string }> = {
  success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/15', title: 'text-emerald-100', text: 'text-emerald-200/90' },
  error: { border: 'border-red-500/30', bg: 'bg-red-500/15', title: 'text-red-100', text: 'text-red-200/90' },
  info: { border: 'border-blue-500/30', bg: 'bg-blue-500/15', title: 'text-blue-100', text: 'text-blue-200/90' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, number>>({})

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current[id]
    if (timer) window.clearTimeout(timer)
    delete timers.current[id]
  }, [])

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((prev) => [{ id, ...toast }, ...prev].slice(0, 3))
      timers.current[id] = window.setTimeout(() => remove(id), 4500)
    },
    [remove]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message: string, title = 'Success') => push({ type: 'success', title, message }),
      error: (message: string, title = 'Something went wrong') => push({ type: 'error', title, message }),
      info: (message: string, title = 'Info') => push({ type: 'info', title, message }),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[60] right-4 top-4 space-y-3 w-[min(420px,calc(100vw-2rem))]">
        {toasts.map((t) => {
          const styles = classForType[t.type]
          return (
            <div
              key={t.id}
              className={`rounded-2xl border ${styles.border} ${styles.bg} backdrop-blur px-4 py-3 shadow-lg`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {t.title && <div className={`font-bold ${styles.title}`}>{t.title}</div>}
                  <div className={`text-sm mt-1 ${styles.text}`}>{t.message}</div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-xs font-semibold text-white/70 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  Close
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      push: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } as ToastContextValue
  }
  return ctx
}

