import { statusConfig } from '../../lib/utils'

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.todo
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
