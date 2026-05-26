export default function StatsCard({ label, value, icon: Icon, color, subtext }) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  }

  return (
    <div className="bg-white dark:bg-jet-elevated rounded-2xl p-6 border border-slate-100 dark:border-jet-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>}
    </div>
  )
}
