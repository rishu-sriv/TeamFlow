import { getInitials } from '../../lib/utils'

// Accepts either `user` object or individual `name`/`color` props
export default function Avatar({ user, name = '', color = '#6366f1', size = 'md', className = '' }) {
  const resolvedName  = user?.name  || name
  const resolvedColor = user?.avatar_color || color
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  }

  return (
    <div
      className={`${sizes[size] || sizes.md} rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm ${className}`}
      style={{ backgroundColor: resolvedColor }}
      title={resolvedName}
    >
      {getInitials(resolvedName)}
    </div>
  )
}
