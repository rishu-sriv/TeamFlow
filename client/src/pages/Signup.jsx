import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Users, Plus, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Step 1: pick action; Step 2: fill details
  const [step, setStep] = useState(1)
  const [action, setAction] = useState(null) // 'create' | 'join'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', team_name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.team_name || form.team_name.length < 2) errs.team_name = 'Team name must be at least 2 characters'
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        action,
        team_name: form.team_name,
      })
      login(res.data.user, res.data.token)
      toast.success(action === 'create' ? `Team "${form.team_name}" created! You're the admin.` : `Joined team "${form.team_name}"!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Sign up failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const inputCls = (key) =>
    `w-full px-4 py-3 rounded-xl border ${errors[key] ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`

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
            Your team,<br />your workspace.
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Create your team and invite members, or join an existing team instantly.
          </p>
          <div className="space-y-3">
            {['Team isolation — your data stays private', 'Admin controls for every project', 'AI summaries powered by Gemini', 'Full audit trail & activity logs'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-extrabold text-xl text-slate-800 dark:text-white">TeamFlow</span>
          </div>

          {/* ── Step 1: Choose action ── */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Get started</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Create a new team or join an existing one</p>

              <div className="space-y-3">
                <button
                  onClick={() => { setAction('create'); setStep(2) }}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Create a team</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Start fresh. You'll be the admin and can invite members.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setAction('join'); setStep(2) }}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/40 transition-colors">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Join a team</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your team's name to join as a member.</p>
                  </div>
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2: Fill details ── */}
          {step === 2 && (
            <>
              <button
                onClick={() => { setStep(1); setErrors({}) }}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-6 transition-colors"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">
                {action === 'create' ? 'Create your team' : 'Join your team'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                {action === 'create'
                  ? "You'll be the admin. Team members can join using your team name."
                  : 'Enter the exact team name your admin gave you.'}
              </p>

              {errors.general && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Team name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {action === 'create' ? 'Team name' : 'Team name to join'}
                  </label>
                  <input
                    value={form.team_name}
                    onChange={set('team_name')}
                    placeholder={action === 'create' ? 'e.g. Acme Engineering' : 'Enter exact team name'}
                    className={inputCls('team_name')}
                  />
                  {errors.team_name && <p className="text-xs text-red-600 mt-1">{errors.team_name}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your name</label>
                  <input value={form.name} onChange={set('name')} placeholder="Full name" className={inputCls('name')} />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls('email')} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Min. 8 characters"
                      className={inputCls('password') + ' pr-11'}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" className={inputCls('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : action === 'create' ? <Plus className="w-4 h-4" /> : <Users className="w-4 h-4" />
                  }
                  {loading ? 'Creating account...' : action === 'create' ? 'Create team & account' : 'Join team & sign up'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
