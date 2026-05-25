import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Error:', error.message)
    console.error('[ErrorBoundary] Stack:', error.stack)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-5">An unexpected error occurred.</p>

            {this.state.error && (
              <div className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-5 overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-700 break-all whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem('teamflow-auth')
                window.location.href = '/login'
              }}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Clear session & go to login
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
