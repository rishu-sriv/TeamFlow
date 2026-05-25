import { useState } from 'react'
import { X, Sparkles, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import api from '../../lib/api'

export default function AISummaryPanel({ projectId, isOpen, onClose }) {
  const [state, setState] = useState('idle') // idle | loading | result | error
  const [data, setData] = useState(null)

  const generate = async () => {
    setState('loading')
    try {
      const res = await api.post(`/ai/projects/${projectId}/summarize`)
      setData(res.data)
      setState('result')
    } catch (err) {
      setState('error')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[380px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">AI Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Idle state */}
          {state === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Get AI insights for this project
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Analyze tasks, progress, and team activity with Gemini AI.
                </p>
              </div>
              <button
                onClick={generate}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </button>
            </div>
          )}

          {/* Loading state */}
          {state === 'loading' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Analyzing project health...
                </p>
              </div>
              {/* Shimmer skeleton */}
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-4/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              </div>
              <div className="space-y-3 animate-pulse mt-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            </div>
          )}

          {/* Result state */}
          {state === 'result' && data && (
            <div className="space-y-5">
              {/* Summary card */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {data.summary}
                </p>
              </div>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-2">
                {data.stats?.completionRate !== undefined && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    {data.stats.completionRate}% complete
                  </span>
                )}
                {data.stats?.overdue > 0 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    {data.stats.overdue} overdue
                  </span>
                )}
                {data.stats?.total !== undefined && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {data.stats.total} tasks total
                  </span>
                )}
              </div>

              {/* Timestamp */}
              {data.generatedAt && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Generated {new Date(data.generatedAt).toLocaleString()}
                </p>
              )}

              {/* Regenerate button */}
              <button
                onClick={generate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Unable to generate summary
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Something went wrong while analyzing the project.
                </p>
              </div>
              <button
                onClick={generate}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Powered by Gemini
          </p>
        </div>
      </div>
    </>
  )
}
