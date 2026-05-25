import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Moon, Sun, Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Avatar from './Avatar'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('teamflow-theme', isDark ? 'dark' : 'light')
    setDarkMode(isDark)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/dashboard" className="flex items-center gap-2 mr-auto md:hidden">
        <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="font-bold text-slate-800 dark:text-white">TeamFlow</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar name={user?.name} color={user?.avatar_color} size="sm" />
            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
