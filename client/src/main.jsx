import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Apply stored dark mode preference before render
const theme = localStorage.getItem('teamflow-theme')
if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
