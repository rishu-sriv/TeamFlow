import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Layout from './components/shared/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectBoard from './pages/ProjectBoard'
import ProjectMembers from './pages/ProjectMembers'
import ActivityLog from './pages/ActivityLog'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/shared/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectBoard />} />
            <Route path="/projects/:id/members" element={<ProjectMembers />} />
            <Route path="/projects/:id/activity" element={<ActivityLog />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
