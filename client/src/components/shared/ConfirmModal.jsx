import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false, variant = 'danger' }) {
  if (!isOpen) return null

  const confirmStyles = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-primary-600 hover:bg-primary-700 text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-jet-elevated rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
          <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-primary-600'}`} />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 ${confirmStyles}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
