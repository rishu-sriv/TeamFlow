import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Settings, LogOut, X, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Avatar from './Avatar'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
]

function NavIcon({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isActive
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="absolute left-full ml-3 px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
        {label}
      </span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* ── Desktop: narrow icon-only sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col items-center w-[72px] min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30 py-5 gap-3">
        {/* Logo */}
        <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0">
          <Zap className="w-5 h-5 text-accent-400" fill="currentColor" />
        </div>

        {/* User avatar */}
        <div className="mb-2">
          <Avatar user={user} size="sm" />
        </div>

        <div className="w-8 border-t border-gray-100 my-1" />

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavIcon key={item.to} {...item} />
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1 mt-auto">
          <button
            title="Settings"
            className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
              Settings
            </span>
          </button>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile: slide-in full sidebar ─────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-400" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">TeamFlow</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Avatar user={user} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
