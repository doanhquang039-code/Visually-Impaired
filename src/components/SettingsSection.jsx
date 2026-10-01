// Settings Section - Cài đặt lưu vào localStorage
import { useTTS } from '../hooks/useTTS'

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 26, 28]

export default function SettingsSection({ settings, updateSetting, resetSettings, addToast }) {
  const tts = useTTS()

  const handleReset = () => {
    resetSettings()
    addToast('Đã đặt lại tất cả cài đặt về mặc định', 'info')
    tts.speak('Đã đặt lại cài đặt về mặc định')
  }

  const handleFontChange = (size) => {
    updateSetting('fontSize', size)
    addToast(`Cỡ chữ: ${size}px`, 'info')
    tts.speak(`Cỡ chữ ${size} pixel`)
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>
          <span>⚙️</span> Cài Đặt
        </div>
        <h1 className="section-title">Cài Đặt Ứng Dụng</h1>
        <p className="section-desc">
          Tùy chỉnh MatViet theo nhu cầu của bạn. Tất cả cài đặt được lưu tự động.
        </p>
      </div>

      {/* Font size */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>🔠</span>
          <span>Cỡ Chữ Hiển Thị</span>
          <span style={{ marginLeft: 'auto', color: 'var(--accent-gold-light)', fontSize: '0.9rem' }}>{settings.fontSize}px</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FONT_SIZES.map(size => (
            <button
              key={size}
              className={`news-cat-btn ${settings.fontSize === size ? 'active' : ''}`}
              onClick={() => handleFontChange(size)}
              style={{ fontSize: `${Math.max(size * 0.7, 11)}px` }}
              aria-pressed={settings.fontSize === size}
              aria-label={`Cỡ chữ ${size} pixel`}
            >
              {size}px
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Ví dụ văn bản với cỡ chữ hiện tại: <strong style={{ color: 'var(--text-primary)' }}>Xin chào, đây là MatViet.</strong>
        </div>
      </div>

      {/* TTS settings */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>🔊</span>
          <span>Cài Đặt Giọng Đọc</span>
        </div>

        <div className="tts-settings">
          <div className="setting-group">
            <label className="setting-label" htmlFor="settings-rate">Tốc độ đọc</label>
            <input
              id="settings-rate"
              type="range"
              className="setting-slider"
              min="0.3" max="2" step="0.1"
              value={settings.ttsRate}
              onChange={e => updateSetting('ttsRate', parseFloat(e.target.value))}
              aria-label={`Tốc độ: ${settings.ttsRate}x`}
            />
            <span className="setting-value">{settings.ttsRate}x</span>
          </div>
          <div className="setting-group">
            <label className="setting-label" htmlFor="settings-pitch">Cao độ giọng</label>
            <input
              id="settings-pitch"
              type="range"
              className="setting-slider"
              min="0.5" max="2" step="0.1"
              value={settings.ttsPitch}
              onChange={e => updateSetting('ttsPitch', parseFloat(e.target.value))}
              aria-label={`Cao độ: ${settings.ttsPitch}`}
            />
            <span className="setting-value">{settings.ttsPitch}</span>
          </div>
          <div className="setting-group">
            <label className="setting-label" htmlFor="settings-volume">Âm lượng</label>
            <input
              id="settings-volume"
              type="range"
              className="setting-slider"
              min="0" max="1" step="0.1"
              value={settings.ttsVolume}
              onChange={e => updateSetting('ttsVolume', parseFloat(e.target.value))}
              aria-label={`Âm lượng: ${Math.round(settings.ttsVolume * 100)}%`}
            />
            <span className="setting-value">{Math.round(settings.ttsVolume * 100)}%</span>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            className="btn btn-outline-gold btn-sm"
            onClick={() => tts.speak('Đây là thử nghiệm giọng đọc với cài đặt hiện tại của bạn.')}
            aria-label="Thử giọng đọc"
          >
            🔊 Thử Giọng Đọc
          </button>
        </div>
      </div>

      {/* OCR settings */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>📷</span>
          <span>Cài Đặt Nhận Dạng Ảnh (OCR)</span>
        </div>

        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
          cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Tự động đọc sau khi nhận dạng</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tự động đọc to văn bản ngay khi OCR hoàn thành
            </div>
          </div>
          <div style={{ position: 'relative', width: 52, height: 28, flexShrink: 0 }}>
            <input
              type="checkbox"
              id="auto-read-ocr"
              checked={settings.autoReadOCR}
              onChange={e => updateSetting('autoReadOCR', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
              aria-label="Tự động đọc sau khi nhận dạng ảnh"
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: settings.autoReadOCR ? 'var(--accent-green)' : 'var(--border-default)',
              borderRadius: 999,
              transition: 'var(--transition)',
              cursor: 'pointer',
            }} onClick={() => updateSetting('autoReadOCR', !settings.autoReadOCR)}>
              <div style={{
                position: 'absolute',
                top: 3, left: settings.autoReadOCR ? 26 : 3,
                width: 22, height: 22,
                background: 'white',
                borderRadius: '50%',
                transition: 'var(--transition)',
              }}/>
            </div>
          </div>
        </label>
      </div>

      {/* Info */}
      <div className="card" style={{ marginBottom: 16, background: 'var(--bg-secondary)' }}>
        <div style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>📊</span>
          <span>Thông Tin Hệ Thống</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Trình duyệt', value: navigator.userAgent.split(' ').slice(-2).join(' ') },
            { label: 'Ngôn ngữ hệ thống', value: navigator.language },
            { label: 'Hỗ trợ TTS', value: 'speechSynthesis' in window ? '✅ Có' : '❌ Không' },
            { label: 'Hỗ trợ STT', value: ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? '✅ Có' : '❌ Không' },
            { label: 'Hỗ trợ Camera', value: 'mediaDevices' in navigator ? '✅ Có' : '❌ Không' },
            { label: 'Phiên bản MatViet', value: '2.0.0 MVP' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="card" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>🔄 Đặt Lại Cài Đặt</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Đưa tất cả cài đặt về mặc định ban đầu. Hành động này không thể hoàn tác.
        </div>
        <button
          className="btn btn-danger"
          onClick={handleReset}
          aria-label="Đặt lại tất cả cài đặt về mặc định"
        >
          🔄 Đặt Lại Tất Cả
        </button>
      </div>
    </div>
  )
}
