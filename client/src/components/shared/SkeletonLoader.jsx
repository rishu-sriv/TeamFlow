export default function SkeletonLoader({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full mb-4" />
            <div className="flex justify-between">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${80 - i * 10}%` }} />
      ))}
    </div>
  )
}
