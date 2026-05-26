import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  review: '#8b5cf6',
  done: '#10b981',
}

const LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export default function StatusChart({ byStatus = {} }) {
  const data = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value,
      color: COLORS[key] || '#94a3b8',
    }))

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-jet-elevated rounded-2xl p-6 border border-slate-100 dark:border-jet-border">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Task Distribution</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
          No tasks yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-jet-elevated rounded-2xl p-6 border border-slate-100 dark:border-jet-border">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Task Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              fontSize: '13px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
