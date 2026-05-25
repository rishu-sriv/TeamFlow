import InfoTooltip from '../shared/InfoTooltip'

export default function MiniStatCard({ label, value, subtext, percent, color = 'lime', tooltip }) {
  const barColor = {
    lime:  'bg-accent-400',
    blue:  'bg-blue-400',
    red:   'bg-red-400',
    amber: 'bg-amber-400',
  }[color] || 'bg-accent-400'

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1 mb-2">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-3">{value}</p>

      {percent !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{subtext}</span>
            <span className="font-semibold text-gray-600">{percent}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-700`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
      {percent === undefined && subtext && (
        <p className="text-xs text-gray-400">{subtext}</p>
      )}
    </div>
  )
}
