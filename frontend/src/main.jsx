import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("VayuShetra UI Recovery caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#05070A',
          color: '#E8EEF2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛰️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#00F0FF' }}>
            VAYUSHETRA // DIAGNOSTIC RECOVERY
          </h2>
          <p style={{ fontSize: '13px', color: '#7D8994', maxWidth: '480px', marginBottom: '20px', lineHeight: '1.6' }}>
            The atmospheric interface encountered a telemetry rendering conflict. Click below to reload the platform clean.
          </p>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            style={{
              backgroundColor: '#00F0FF',
              color: '#05070A',
              fontWeight: 'bold',
              fontSize: '13px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            REINITIALIZE PLATFORM
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
