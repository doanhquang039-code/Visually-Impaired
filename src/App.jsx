import { useState, useEffect, useCallback } from 'react'
import HomeSection from './components/HomeSection'
import TTSSection from './components/TTSSection'
import OCRSection from './components/OCRSection'
import STTSection from './components/STTSection'
import NewsSection from './components/NewsSection'
import ClockSection from './components/ClockSection'
import ColorSection from './components/ColorSection'
import BrailleSection from './components/BrailleSection'
import CalculatorSection from './components/CalculatorSection'
import QRScannerSection from './components/QRScannerSection'
import VoiceNotesSection from './components/VoiceNotesSection'
import EmergencySection from './components/EmergencySection'
import WeatherSection from './components/WeatherSection'
import ConverterSection from './components/ConverterSection'
import DictionarySection from './components/DictionarySection'
import LocationSection from './components/LocationSection'
import SettingsSection from './components/SettingsSection'
import AdminDashboard from './components/AdminDashboard'
import { useSettings } from './hooks/useSettings'
import { useAnalytics } from './hooks/useAnalytics'

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
  { id: 'home',      label: 'Trang Chủ',   icon: '🏠', shortLabel: 'Chủ' },
  { id: 'tts',       label: 'Đọc Văn Bản', icon: '🔊', shortLabel: 'Đọc' },
  { id: 'ocr',       label: 'Đọc Ảnh',     icon: '📷', shortLabel: 'Ảnh' },
  { id: 'stt',       label: 'Giọng Nói',   icon: '🎙️', shortLabel: 'Nói' },
  { id: 'news',      label: 'Tin Tức',     icon: '📰', shortLabel: 'Tin' },
  { id: 'clock',     label: 'Đồng Hồ',     icon: '⏰', shortLabel: 'Giờ' },
  { id: 'color',     label: 'Màu Sắc',     icon: '🎨', shortLabel: 'Màu' },
  { id: 'braille',   label: 'Braille',     icon: '📖', shortLabel: 'Braille' },
  { id: 'calc',      label: 'Máy Tính',    icon: '🔢', shortLabel: 'Tính' },
  { id: 'qr',        label: 'Quét QR',     icon: '📱', shortLabel: 'QR' },
  { id: 'notes',     label: 'Ghi Chú',     icon: '🎤', shortLabel: 'Ghi' },
  { id: 'emergency', label: 'Khẩn Cấp',    icon: '🆘', shortLabel: 'Gọi' },
  { id: 'weather',   label: 'Thời Tiết',   icon: '🌤️', shortLabel: 'Thời' },
  { id: 'convert',   label: 'Đo Lường',    icon: '📏', shortLabel: 'Đổi' },
  { id: 'dict',      label: 'Từ Điển',     icon: '🔤', shortLabel: 'Từ' },
  { id: 'location',  label: 'Định Vị',     icon: '📍', shortLabel: 'GPS' },
  { id: 'settings',  label: 'Cài Đặt',     icon: '⚙️', shortLabel: 'Cài' },
]

// Mobile nav shows only first 5 + settings
const MOBILE_NAV = ['home', 'tts', 'ocr', 'stt', 'news']

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [toasts, setToasts] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const { settings, updateSetting, resetSettings } = useSettings()

  // Track analytics
  useAnalytics(activeTab)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const increaseFontSize = () => updateSetting('fontSize', Math.min(settings.fontSize + 2, 28))
  const decreaseFontSize = () => updateSetting('fontSize', Math.max(settings.fontSize - 2, 14))

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      // Secret admin: Alt+Shift+A
      if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        setShowAdmin(prev => !prev)
        return
      }
      if (!e.altKey) return
      const map = { 
        '1': 'tts', '2': 'ocr', '3': 'stt', '4': 'news', '5': 'clock', '6': 'color', '7': 'braille',
        '8': 'calc', '9': 'qr', '0': 'notes', 'e': 'emergency', 'w': 'weather', 'c': 'convert', 'd': 'dict', 'l': 'location'
      }
      const key = e.key.toLowerCase()
      if (map[key]) { e.preventDefault(); setActiveTab(map[key]) }
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); setActiveTab('home') }
      if (e.key === ',') { e.preventDefault(); setActiveTab('settings') }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); increaseFontSize() }
      if (e.key === '-') { e.preventDefault(); decreaseFontSize() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [settings.fontSize])

  useEffect(() => {
    const tab = NAV_ITEMS.find(t => t.id === activeTab)
    if (tab) document.title = `${tab.label} - MatViet`
    setMobileMenuOpen(false)
  }, [activeTab])

  const renderSection = () => {
    switch (activeTab) {
      case 'home':     return <HomeSection setActiveTab={setActiveTab} />
      case 'tts':      return <TTSSection addToast={addToast} settings={settings} />
      case 'ocr':      return <OCRSection addToast={addToast} settings={settings} />
      case 'stt':      return <STTSection addToast={addToast} />
      case 'news':     return <NewsSection addToast={addToast} />
      case 'clock':    return <ClockSection addToast={addToast} />
      case 'color':    return <ColorSection addToast={addToast} />
      case 'braille':  return <BrailleSection addToast={addToast} />
      case 'calc':     return <CalculatorSection addToast={addToast} />
      case 'qr':       return <QRScannerSection addToast={addToast} />
      case 'notes':    return <VoiceNotesSection addToast={addToast} />
      case 'emergency':return <EmergencySection addToast={addToast} />
      case 'weather':  return <WeatherSection addToast={addToast} />
      case 'convert':  return <ConverterSection addToast={addToast} />
      case 'dict':     return <DictionarySection addToast={addToast} />
      case 'location': return <LocationSection addToast={addToast} />
      case 'settings': return <SettingsSection settings={settings} updateSetting={updateSetting} resetSettings={resetSettings} addToast={addToast} onOpenAdmin={() => setShowAdmin(true)} />
      default:         return <HomeSection setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="app-wrapper">
      <a href="#main-content" className="skip-link">Chuyển đến nội dung chính</a>

      {/* Admin Dashboard overlay */}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}

      {/* Header */}
      <header className="header" role="banner">
        <div className="header-inner">
          <a href="#" className="logo-area" onClick={e => { e.preventDefault(); setActiveTab('home') }} aria-label="MatViet - Về trang chủ">
            <img src="/logo.png" alt="" className="logo-img" aria-hidden="true" />
            <div className="logo-text">
              <span className="logo-title">MatViet</span>
              <span className="logo-tagline">Hỗ trợ người khiếm thị</span>
            </div>
          </a>

          {/* Desktop nav - scrollable */}
          <nav aria-label="Điều hướng chính" style={{ flex: 1, overflow: 'hidden', margin: '0 16px' }}>
            <ul className="nav-tabs" role="tablist" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
              {NAV_ITEMS.map(item => (
                <li key={item.id} role="presentation">
                  <button
                    id={`nav-${item.id}`}
                    className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    role="tab"
                    aria-selected={activeTab === item.id}
                  >
                    <span className="nav-tab-icon" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* A11y controls */}
          <div className="a11y-controls" aria-label="Điều chỉnh cỡ chữ">
            <button className="a11y-btn" onClick={decreaseFontSize} aria-label="Giảm cỡ chữ" title="Alt+-">A-</button>
            <button className="a11y-btn" onClick={increaseFontSize} aria-label="Tăng cỡ chữ" title="Alt++">A+</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="main-content" role="main" tabIndex={-1}>
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`nav-${activeTab}`}>
          {renderSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <p>
          <strong style={{ color: 'var(--accent-gold-light)' }}>MatViet 2.0</strong> · {NAV_ITEMS.length - 1} tính năng ·
          Phím tắt: <kbd style={{ color: 'var(--accent-gold-light)' }}>Alt+1~7</kbd> chuyển mục ·
          <kbd style={{ color: 'var(--accent-gold-light)' }}>Alt+,</kbd> cài đặt
        </p>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="nav-mobile" aria-label="Điều hướng di động">
        {NAV_ITEMS.filter(i => MOBILE_NAV.includes(i.id)).map(item => (
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
        {/* More button */}
        <button
          className={`nav-mobile-btn ${['clock','color','braille','settings'].includes(activeTab) ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Xem thêm tính năng"
          aria-haspopup="true"
        >
          <span className="nav-mobile-icon" aria-hidden="true">•••</span>
          Thêm
        </button>
      </nav>

      {/* Mobile more menu overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)', zIndex: 200,
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              padding: '20px 20px 40px',
              width: '100%',
              border: '1px solid var(--border-default)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tính năng khác
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {NAV_ITEMS.filter(i => !MOBILE_NAV.includes(i.id)).map(item => (
                <button
                  key={item.id}
                  className={`nav-mobile-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  style={{ padding: '12px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <span className="nav-mobile-icon">{item.icon}</span>
                  {item.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => <Toast key={toast.id} toast={toast} />)}
      </div>
    </div>
  )
}
