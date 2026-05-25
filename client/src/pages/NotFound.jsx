import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
      <div className="text-center">
        <p className="text-8xl font-bold text-indigo-200 dark:text-indigo-900 select-none mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-slate-200 mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 dark:text-slate-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
