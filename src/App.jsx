import { useState, useEffect, useCallback } from 'react'
import HomeSection from './components/HomeSection'
import TTSSection from './components/TTSSection'
import OCRSection from './components/OCRSection'
import STTSection from './components/STTSection'
import NewsSection from './components/NewsSection'

// Toast notification component
function Toast({ toast }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className={`toast ${toast.type}`} role="alert" aria-live="assertive">
      <span className="toast-icon">{icons[toast.type] || 'ℹ️'}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'home', label: 'Trang Chủ', icon: '🏠', shortLabel: 'Chủ' },
  { id: 'tts', label: 'Đọc Văn Bản', icon: '🔊', shortLabel: 'Đọc' },
  { id: 'ocr', label: 'Đọc Ảnh', icon: '📷', shortLabel: 'Ảnh' },
  { id: 'stt', label: 'Giọng Nói', icon: '🎙️', shortLabel: 'Nói' },
  { id: 'news', label: 'Tin Tức', icon: '📰', shortLabel: 'Tin' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [toasts, setToasts] = useState([])
  const [fontSize, setFontSize] = useState(18)

  // Add toast notification
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  // Font size adjustment
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
  }, [fontSize])

  const increaseFontSize = () => {
    setFontSize(prev => {
      const next = Math.min(prev + 2, 28)
      addToast(`Cỡ chữ: ${next}px`, 'info')
      return next
    })
  }

  const decreaseFontSize = () => {
    setFontSize(prev => {
      const next = Math.max(prev - 2, 14)
      addToast(`Cỡ chữ: ${next}px`, 'info')
      return next
    })
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (!e.altKey) return
      switch (e.key) {
        case '1': e.preventDefault(); setActiveTab('tts'); break
        case '2': e.preventDefault(); setActiveTab('ocr'); break
        case '3': e.preventDefault(); setActiveTab('stt'); break
        case '4': e.preventDefault(); setActiveTab('news'); break
        case 'h': case 'H': e.preventDefault(); setActiveTab('home'); break
        case '+': case '=': e.preventDefault(); increaseFontSize(); break
        case '-': e.preventDefault(); decreaseFontSize(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Announce tab changes to screen readers
  useEffect(() => {
    const tab = NAV_ITEMS.find(t => t.id === activeTab)
    if (tab) {
      document.title = `${tab.label} - MatViet`
    }
  }, [activeTab])

  const renderSection = () => {
    switch (activeTab) {
      case 'home': return <HomeSection setActiveTab={setActiveTab} />
      case 'tts': return <TTSSection addToast={addToast} />
      case 'ocr': return <OCRSection addToast={addToast} />
      case 'stt': return <STTSection addToast={addToast} />
      case 'news': return <NewsSection addToast={addToast} />
      default: return <HomeSection setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="app-wrapper">
      {/* Skip to main content - critical for screen readers */}
      <a href="#main-content" className="skip-link">
        Chuyển đến nội dung chính
      </a>

      {/* Header */}
      <header className="header" role="banner">
        <div className="header-inner">
          <a
            href="#"
            className="logo-area"
            onClick={e => { e.preventDefault(); setActiveTab('home') }}
            aria-label="MatViet - Về trang chủ"
          >
            <img src="/logo.png" alt="" className="logo-img" aria-hidden="true" />
            <div className="logo-text">
              <span className="logo-title">MatViet</span>
              <span className="logo-tagline">Hỗ trợ người khiếm thị</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Điều hướng chính">
            <ul className="nav-tabs" role="tablist">
              {NAV_ITEMS.map(item => (
                <li key={item.id} role="presentation">
                  <button
                    id={`nav-${item.id}`}
                    className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    role="tab"
                    aria-selected={activeTab === item.id}
                    aria-controls={`panel-${item.id}`}
                  >
                    <span className="nav-tab-icon" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Accessibility controls */}
          <div className="a11y-controls" aria-label="Điều chỉnh cỡ chữ">
            <button
              className="a11y-btn"
              onClick={decreaseFontSize}
              aria-label="Giảm cỡ chữ"
              title="Giảm cỡ chữ (Alt+-)"
            >
              A-
            </button>
            <button
              className="a11y-btn"
              onClick={increaseFontSize}
              aria-label="Tăng cỡ chữ"
              title="Tăng cỡ chữ (Alt++)"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Nội dung chính"
      >
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`nav-${activeTab}`}
        >
          {renderSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <p>
          <strong style={{ color: 'var(--accent-gold-light)' }}>MatViet</strong> · Hỗ trợ người khiếm thị Việt Nam ·
          Phím tắt: <kbd style={{ color: 'var(--accent-gold-light)' }}>Alt+1</kbd> đến <kbd style={{ color: 'var(--accent-gold-light)' }}>Alt+4</kbd> để chuyển mục
        </p>
      </footer>

      {/* Mobile bottom navigation */}
      <nav className="nav-mobile" aria-label="Điều hướng di động">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-mobile-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
            aria-pressed={activeTab === item.id}
          >
            <span className="nav-mobile-icon" aria-hidden="true">{item.icon}</span>
            {item.shortLabel}
          </button>
        ))}
      </nav>

      {/* Toast notifications */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
