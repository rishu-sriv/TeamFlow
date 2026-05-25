import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      login(res.data.user, res.data.token)
      toast.success('Account created! Welcome to TeamFlow.')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Sign up failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${errors[key] ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`}
      />
      {errors[key] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-primary-500 to-primary-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="font-extrabold text-xl">T</span>
          </div>
          <span className="font-extrabold text-2xl">TeamFlow</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            Start shipping<br />smarter today.
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of teams who manage their work with AI-powered insights.
          </p>
          <div className="space-y-3">
            {['Free to get started', 'Invite unlimited team members', 'AI summaries powered by Gemini', 'Full audit trail & activity logs'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-white/90 italic text-sm leading-relaxed">
            "TeamFlow transformed how our 30-person team collaborates. The AI summaries alone save us 2 hours per sprint review."
          </p>
          <p className="text-white/60 text-xs mt-3">— Engineering Lead at a Series B startup</p>
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

          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Create an account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Get started in 30 seconds</p>

          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'Full Name', 'text', 'Alex Johnson')}
            {field('email', 'Email', 'email', 'you@example.com')}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border ${errors.password ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {field('confirmPassword', 'Confirm Password', 'password', 'Repeat your password')}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
