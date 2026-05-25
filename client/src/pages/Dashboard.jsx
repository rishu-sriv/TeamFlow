import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, AlertTriangle, LayoutDashboard, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import StatsCard from '../components/dashboard/StatsCard'
import StatusChart from '../components/dashboard/StatusChart'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import OverdueAlert from '../components/dashboard/OverdueAlert'
import SkeletonLoader from '../components/shared/SkeletonLoader'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [overdueTasks, setOverdueTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, overdueRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/dashboard/overdue'),
        ])
        setData(dashRes.data)
        setOverdueTasks(overdueRes.data.tasks || [])
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          You have {data?.projectCount || 0} active project{data?.projectCount !== 1 ? 's' : ''}
          {stats.overdue > 0 ? ` and ${stats.overdue} overdue task${stats.overdue !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Tasks"
          value={stats.total || 0}
          icon={LayoutDashboard}
          color="indigo"
          subtext={`Across ${data?.projectCount || 0} projects`}
        />
        <StatsCard
          label="Completed"
          value={stats.byStatus?.done || 0}
          icon={CheckCircle2}
          color="emerald"
          subtext={stats.total > 0 ? `${Math.round(((stats.byStatus?.done || 0) / stats.total) * 100)}% completion rate` : '0% completion rate'}
        />
        <StatsCard
          label="In Progress"
          value={(stats.byStatus?.in_progress || 0) + (stats.byStatus?.review || 0)}
          icon={TrendingUp}
          color="blue"
          subtext={`${stats.byStatus?.review || 0} in review`}
        />
        <StatsCard
          label="Overdue"
          value={stats.overdue || 0}
          icon={AlertTriangle}
          color="red"
          subtext={stats.dueSoon > 0 ? `${stats.dueSoon} due within 3 days` : 'No tasks due soon'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OverdueAlert tasks={overdueTasks} />
          <ActivityFeed activities={data?.recentActivity || []} />
        </div>
        <div>
          <StatusChart byStatus={stats.byStatus || {}} />
        </div>
      </div>
    </div>
  )
}
