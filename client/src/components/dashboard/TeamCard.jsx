import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import Avatar from '../shared/Avatar'
import { getInitials } from '../../lib/utils'

export default function TeamCard({ members = [], projectId }) {
  const shown = members.slice(0, 4)
  const extra = members.length - shown.length

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Your team</p>
        </div>
        {projectId && (
          <Link to={`/projects/${projectId}/members`} className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
            Show all
          </Link>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No team members yet</p>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {shown.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: member.avatar_color || '#6366f1' }}
                title={member.name}
              >
                {getInitials(member.name)}
              </div>
              <p className="text-[10px] text-gray-500 font-medium text-center leading-tight max-w-[48px] truncate">
                {member.name.split(' ')[0]}
              </p>
              <p className="text-[9px] text-gray-400 capitalize">{member.role}</p>
            </div>
          ))}
          {extra > 0 && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                +{extra}
              </div>
              <p className="text-[10px] text-gray-400">more</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
