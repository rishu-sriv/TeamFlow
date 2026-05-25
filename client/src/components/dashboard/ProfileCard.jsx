import { getInitials } from '../../lib/utils'
import InfoTooltip from '../shared/InfoTooltip'

export default function ProfileCard({ user, myRate = 0, myDone = 0, myTotal = 0 }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (myRate / 100) * circumference
  const initials = getInitials(user?.name || 'U')
  const rateColor = myRate < 30 ? '#f87171' : myRate < 60 ? '#fbbf24' : '#a3e635'
  const ringStroke = myRate < 30 ? '#f87171' : myRate < 60 ? '#fbbf24' : '#a3e635'

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-gray-100 h-full">
      {/* Avatar with personal progress ring */}
      <div className="relative mb-3 mt-2">
        <svg width="108" height="108" className="-rotate-90">
          <circle cx="54" cy="54" r={radius} fill="none" stroke="#f0f2f5" strokeWidth="7" />
          <circle
            cx="54" cy="54" r={radius}
            fill="none"
            stroke={ringStroke}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{ backgroundColor: user?.avatar_color || '#6366f1' }}
          >
            {initials}
          </div>
        </div>
      </div>

      <p className="font-bold text-gray-900 text-base leading-tight">{user?.name}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-full">{user?.email}</p>

      <div className="flex-1" />

      {/* Personal task completion */}
      <div className="w-full mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-medium">My tasks</span>
            <InfoTooltip text="Tasks assigned to you: done / total assigned" />
          </div>
          <span className="font-bold text-gray-800">{myDone}/{myTotal}</span>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${myRate}%`, backgroundColor: rateColor }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <span>My completion rate</span>
            <InfoTooltip text="Percentage of your assigned tasks that are marked done" />
          </div>
          <span className="font-semibold" style={{ color: rateColor }}>{myRate}%</span>
        </div>
      </div>

      {/* Ring legend */}
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-400">
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: ringStroke }} />
        <span>My progress ring</span>
        <InfoTooltip text="The ring around your avatar shows your personal task completion rate" position="top" />
      </div>
    </div>
  )
}
