import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Trash2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import RoleBadge from '../components/shared/RoleBadge'
import ConfirmModal from '../components/shared/ConfirmModal'
import Avatar from '../components/shared/Avatar'

export default function ProjectMembers() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { currentProject, setCurrentProject, members, setMembers, updateMemberRole, removeMember } = useProjectStore()

  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [updatingRoleId, setUpdatingRoleId] = useState(null)

  const fetchData = async () => {
    try {
      const res = await api.get(`/projects/${id}`)
      setCurrentProject(res.data.project)
      setMembers(res.data.members)
    } catch (err) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const projectRole = currentProject?.user_role || 'member'
  const isAdmin = projectRole === 'admin'

  const handleRoleToggle = async (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin'
    setUpdatingRoleId(member.user_id)
    try {
      await api.put(`/projects/${id}/members/${member.user_id}/role`, { role: newRole })
      updateMemberRole(member.user_id, newRole)
      toast.success(`Role updated to ${newRole}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemovingId(removeTarget.user_id)
    try {
      await api.delete(`/projects/${id}/members/${removeTarget.user_id}`)
      removeMember(removeTarget.user_id)
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member')
    } finally {
      setRemovingId(null)
      setRemoveTarget(null)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await api.post(`/projects/${id}/members`, { email: inviteEmail.trim() })
      toast.success('Member added')
      setInviteEmail('')
      fetchData()
    } catch (err) {
      const status = err.response?.status
      if (status === 404) {
        toast.error('No user found with that email')
      } else if (status === 409) {
        toast.error('Already a member')
      } else {
        toast.error(err.response?.data?.error || 'Failed to add member')
      }
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72 mb-8" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to board
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Members</h1>
        {currentProject && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{currentProject.name}</p>
        )}
      </div>

      {/* Members table — desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Member</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Role</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Joined</th>
              {isAdmin && (
                <th className="text-right px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isSelf = member.user_id === user?.id
              return (
                <tr
                  key={member.user_id}
                  className={`border-b last:border-0 border-slate-100 dark:border-slate-800 ${
                    isSelf ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800 dark:text-white">{member.name}</span>
                          {isSelf && (
                            <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">(You)</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {member.joined_at
                      ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      {!isSelf && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleToggle(member)}
                            disabled={updatingRoleId === member.user_id}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            {updatingRoleId === member.user_id
                              ? 'Updating...'
                              : member.role === 'admin'
                              ? 'Make Member'
                              : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => setRemoveTarget(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Members cards — mobile */}
      <div className="md:hidden space-y-3 mb-6">
        {members.map((member) => {
          const isSelf = member.user_id === user?.id
          return (
            <div
              key={member.user_id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 ${
                isSelf ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800 dark:text-white text-sm">{member.name}</span>
                      {isSelf && (
                        <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">(You)</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{member.email}</span>
                  </div>
                </div>
                <RoleBadge role={member.role} />
              </div>
              {isAdmin && !isSelf && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRoleToggle(member)}
                    disabled={updatingRoleId === member.user_id}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {updatingRoleId === member.user_id
                      ? 'Updating...'
                      : member.role === 'admin'
                      ? 'Make Member'
                      : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Member section (admin only) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary-500" />
            Invite Member
          </h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {inviting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Confirm remove modal */}
      <ConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeTarget?.name} from this project?`}
        confirmLabel="Remove"
        loading={!!removingId}
      />
    </div>
  )
}
