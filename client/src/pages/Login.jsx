import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

const features = [
  'AI-powered project summaries',
  'Real-time Kanban board with drag & drop',
  'Role-based access control',
  'Overdue task detection & alerts',
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="font-extrabold text-xl">T</span>
          </div>
          <span className="font-extrabold text-2xl">TeamFlow</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            Ship faster,<br />together.
          </h1>
          <p className="text-white/80 text-lg mb-8">
            The modern task manager built for high-performing engineering teams.
          </p>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['500+', 'Teams'], ['50K+', 'Tasks Done'], ['99.9%', 'Uptime']].map(([num, label]) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-extrabold">{num}</p>
              <p className="text-white/70 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-extrabold text-xl text-slate-800 dark:text-white">TeamFlow</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Demo accounts</p>
            <div className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-300">
              <p>admin@teamflow.com / Admin@123</p>
              <p>member@teamflow.com / Member@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
