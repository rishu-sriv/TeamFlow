import { priorityConfig } from '../../lib/utils'

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.medium
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
