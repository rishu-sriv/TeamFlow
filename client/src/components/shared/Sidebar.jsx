import { NavLink, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, X } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm">T</span>
            </div>
            <span className="font-extrabold text-lg text-slate-800 dark:text-white">TeamFlow</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">TeamFlow</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">v1.0.0 — AI-powered tasks</p>
          </div>
        </div>
      </aside>
    </>
  )
}
