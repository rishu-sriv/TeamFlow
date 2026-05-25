import { useState } from 'react'

// Priority → estimated hours
const HOURS = { critical: 4, high: 2.5, medium: 1.5, low: 0.75 }

export default function WeeklyActivity({ tasks = [], userId }) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const getMonday = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(now)
    mon.setDate(now.getDate() + diff)
    mon.setHours(0, 0, 0, 0)
    return mon
  }
  const monday = getMonday()
  const todayIdx = (new Date().getDay() + 6) % 7

  // Only consider tasks assigned to the current user
  const myTasks = userId ? tasks.filter(t => t.assignee_id === userId) : tasks

  // Sum priority-weighted hours per day of this week for MY tasks only
  const dayHours = new Array(7).fill(0)
  myTasks.forEach(task => {
    if (!task.due_date) return
    const due = new Date(task.due_date)
    due.setHours(0, 0, 0, 0)
    const diff = Math.round((due - monday) / 86400000)
    if (diff >= 0 && diff < 7) {
      dayHours[diff] += HOURS[task.priority] || 1.5
    }
  })

  // Fallback: if no due dates this week, spread my tasks by task-id hash
  const hasData = dayHours.some(v => v > 0)
  if (!hasData) {
    myTasks.forEach(task => {
      const hash = (task.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      dayHours[hash % 7] += HOURS[task.priority] || 1.5
    })
  }

  const max = Math.max(...dayHours, 0.1)

  // Total estimated hours this week from my tasks
  const totalMin = myTasks.reduce((s, t) => s + (HOURS[t.priority] || 1.5) * 60, 0)
  const hours = Math.floor(totalMin / 60)
  const mins  = Math.round(totalMin % 60)

  const CHART_H = 60 // px
  const [tooltip, setTooltip] = useState(null) // { idx, x, y }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-gray-400">Weekly workload</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">
            {hours}h {String(mins).padStart(2, '0')}m
          </p>
          <p className="text-xs text-gray-400">Estimated this week</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {myTasks.filter(t => t.due_date).length} deadlines
        </span>
      </div>

      {/* Bars */}
      <div className="relative flex items-end gap-2" style={{ height: CHART_H }}>
        {days.map((day, i) => {
          const h = dayHours[i]
          const barPx = h > 0 ? Math.max(Math.round((h / max) * CHART_H), 8) : 3
          const isToday = i === todayIdx
          const isPast  = i < todayIdx
          const isFuture = i > todayIdx
          const hDisplay = h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
          const fullDay = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]

          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center justify-end gap-0.5 relative"
              style={{ height: CHART_H }}
              onMouseEnter={e => h > 0 && setTooltip({ i, rect: e.currentTarget.getBoundingClientRect() })}
              onMouseLeave={() => setTooltip(null)}
            >
              {h > 0 && (
                <span className="text-[9px] font-semibold text-gray-400 leading-none">
                  {hDisplay}
                </span>
              )}
              <div
                style={{ height: barPx }}
                className={`w-full rounded-t-[4px] transition-all duration-700 cursor-default ${
                  h === 0
                    ? 'bg-gray-100'
                    : isToday
                    ? 'bg-violet-400'
                    : isPast
                    ? 'bg-slate-200'
                    : 'bg-blue-200'
                }`}
              />

              {/* Tooltip */}
              {tooltip?.i === i && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg pointer-events-none">
                  <p className="font-semibold">{fullDay}</p>
                  <p className="text-gray-300">~{hDisplay} estimated</p>
                  {isFuture && <p className="text-blue-300">Upcoming deadline</p>}
                  {isToday && <p className="text-violet-300">Due today</p>}
                  {isPast && <p className="text-gray-400">Past</p>}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* X labels */}
      <div className="flex gap-2 mt-2">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex justify-center">
            <span className={`text-[10px] ${i === todayIdx ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
