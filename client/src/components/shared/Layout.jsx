import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-jet">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area — shifted right on desktop for the 72px sidebar */}
      <div className="lg:ml-[72px] flex flex-col min-h-screen">
        {/* Mobile-only top bar */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-accent-400" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900 text-sm">TeamFlow</span>
          </Link>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
