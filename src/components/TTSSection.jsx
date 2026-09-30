// TTS Section Component - Đọc văn bản bằng giọng nói
import { useState, useRef } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function TTSSection({ addToast }) {
  const [text, setText] = useState('')
  const tts = useTTS()

  const handleSpeak = () => {
    if (!text.trim()) {
      addToast('Vui lòng nhập văn bản để đọc!', 'error')
      return
    }
    tts.speak(text)
    addToast('Đang đọc văn bản...', 'info')
  }

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText()
      setText(clipText)
      addToast('Đã dán từ clipboard!', 'success')
    } catch {
      addToast('Không thể truy cập clipboard.', 'error')
    }
  }

  const handleClear = () => {
    setText('')
    tts.stop()
  }

  const sampleTexts = [
    'Xin chào! Tôi là MatViet, ứng dụng hỗ trợ người khiếm thị Việt Nam.',
    'Hôm nay thời tiết Hà Nội mát mẻ, nhiệt độ khoảng 25 độ C. Người dân có thể ra ngoài tập thể dục vào buổi sáng sớm.',
    'Việt Nam có 54 dân tộc anh em, đoàn kết và cùng nhau xây dựng đất nước phồn vinh.',
  ]

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge gold">
          <span>🔊</span> Đọc Văn Bản
        </div>
        <h1 className="section-title">Chuyển Văn Bản Thành Giọng Nói</h1>
        <p className="section-desc">
          Nhập hoặc dán văn bản tiếng Việt vào ô bên dưới. Ứng dụng sẽ đọc to nội dung bằng giọng nói tự nhiên.
        </p>
      </div>

      <div className="card card-gold">
        <div className="tts-container">
          {/* Main textarea */}
          <div className="textarea-wrapper">
            <textarea
              id="tts-text-input"
              className="tts-textarea"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Nhập văn bản tiếng Việt tại đây để nghe đọc... Ví dụ: Xin chào, tôi muốn nghe tin tức hôm nay."
              aria-label="Ô nhập văn bản để đọc"
              disabled={tts.isSpeaking && !tts.isPaused}
              rows={6}
            />
            <span className="char-count">{text.length} ký tự</span>
          </div>

          {/* Progress bar */}
          {tts.isSpeaking && (
            <div className="tts-progress" role="progressbar" aria-valuenow={tts.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến trình đọc">
              <div className="tts-progress-bar" style={{ width: `${tts.progress}%` }} />
            </div>
          )}

          {/* Controls */}
          <div className="tts-controls">
            {!tts.isSpeaking ? (
              <button
                id="tts-speak-btn"
                className="btn btn-primary btn-lg"
                onClick={handleSpeak}
                disabled={!text.trim()}
                aria-label="Bắt đầu đọc văn bản"
              >
                <span>▶</span> Đọc Ngay
              </button>
            ) : (
              <>
                {tts.isPaused ? (
                  <button
                    className="btn btn-primary"
                    onClick={tts.resume}
                    aria-label="Tiếp tục đọc"
                  >
                    <span>▶</span> Tiếp Tục
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-gold"
                    onClick={tts.pause}
                    aria-label="Tạm dừng"
                  >
                    <span>⏸</span> Tạm Dừng
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={tts.stop}
                  aria-label="Dừng đọc"
                >
                  <span>⏹</span> Dừng
                </button>
              </>
            )}
            <button
              className="btn btn-secondary"
              onClick={handlePaste}
              aria-label="Dán văn bản từ clipboard"
            >
              <span>📋</span> Dán
            </button>
            {text && (
              <button
                className="btn btn-secondary"
                onClick={handleClear}
                aria-label="Xoá văn bản"
              >
                <span>🗑</span> Xoá
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="card" style={{ background: 'var(--bg-secondary)', padding: '20px' }}>
            <div style={{ marginBottom: 16, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⚙️ Cài đặt giọng đọc
            </div>

            {/* Voice selector */}
            <div className="setting-group" style={{ marginBottom: 16 }}>
              <label className="setting-label" htmlFor="voice-select">Giọng đọc</label>
              <select
                id="voice-select"
                className="voice-select"
                value={tts.selectedVoice?.name || ''}
                onChange={e => {
                  const v = tts.voices.find(v => v.name === e.target.value)
                  tts.setSelectedVoice(v)
                }}
                aria-label="Chọn giọng đọc"
              >
                {tts.voices.length === 0 && (
                  <option value="">Đang tải giọng đọc...</option>
                )}
                {tts.voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="tts-settings">
              <div className="setting-group">
                <label className="setting-label" htmlFor="rate-slider">Tốc độ đọc</label>
                <input
                  id="rate-slider"
                  type="range"
                  className="setting-slider"
                  min="0.3"
                  max="2"
                  step="0.1"
                  value={tts.rate}
                  onChange={e => tts.setRate(parseFloat(e.target.value))}
                  aria-label={`Tốc độ đọc: ${tts.rate}`}
                />
                <span className="setting-value">{tts.rate}x</span>
              </div>
              <div className="setting-group">
                <label className="setting-label" htmlFor="pitch-slider">Cao độ giọng</label>
                <input
                  id="pitch-slider"
                  type="range"
                  className="setting-slider"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={tts.pitch}
                  onChange={e => tts.setPitch(parseFloat(e.target.value))}
                  aria-label={`Cao độ: ${tts.pitch}`}
                />
                <span className="setting-value">{tts.pitch}</span>
              </div>
              <div className="setting-group">
                <label className="setting-label" htmlFor="volume-slider">Âm lượng</label>
                <input
                  id="volume-slider"
                  type="range"
                  className="setting-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={tts.volume}
                  onChange={e => tts.setVolume(parseFloat(e.target.value))}
                  aria-label={`Âm lượng: ${Math.round(tts.volume * 100)}%`}
                />
                <span className="setting-value">{Math.round(tts.volume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Sample texts */}
          <div>
            <div style={{ marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              📝 Văn bản mẫu (nhấn để thử):
            </div>
            <div className="flex flex-col gap-8">
              {sampleTexts.map((sample, i) => (
                <button
                  key={i}
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '10px 14px' }}
                  onClick={() => setText(sample)}
                  aria-label={`Văn bản mẫu ${i + 1}: ${sample}`}
                >
                  <span style={{ color: 'var(--accent-gold)', flexShrink: 0 }}>▸</span>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
