// STT Section - Nhận giọng nói, chuyển thành văn bản
import { useEffect, useRef } from 'react'
import { useSTT } from '../hooks/useSTT'
import { useTTS } from '../hooks/useTTS'

export default function STTSection({ addToast }) {
  const stt = useSTT()
  const tts = useTTS()
  const barsRef = useRef([])

  // Animate bars when listening
  useEffect(() => {
    let interval
    if (stt.isListening) {
      interval = setInterval(() => {
        barsRef.current.forEach(bar => {
          if (bar) {
            const h = Math.random() * 44 + 4
            bar.style.height = `${h}px`
          }
        })
      }, 100)
    } else {
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = '4px'
      })
    }
    return () => clearInterval(interval)
  }, [stt.isListening])

  const handleToggle = () => {
    if (!stt.isSupported) {
      addToast('Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome.', 'error')
      return
    }
    if (stt.isListening) {
      stt.stopListening()
      addToast('Đã dừng nghe.', 'info')
    } else {
      stt.startListening()
      addToast('Đang nghe... Hãy nói tiếng Việt!', 'success')
    }
  }

  const handleReadBack = () => {
    const fullText = stt.transcript + stt.interimTranscript
    if (!fullText.trim()) {
      addToast('Chưa có văn bản để đọc lại.', 'error')
      return
    }
    tts.speak(fullText)
  }

  const handleCopy = async () => {
    if (!stt.transcript) return
    try {
      await navigator.clipboard.writeText(stt.transcript)
      addToast('Đã sao chép!', 'success')
    } catch {
      addToast('Không thể sao chép.', 'error')
    }
  }

  const numBars = 32

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge green">
          <span>🎙️</span> Nhận Dạng Giọng Nói
        </div>
        <h1 className="section-title">Nói Để Nhập Văn Bản</h1>
        <p className="section-desc">
          Nhấn nút microphone và nói tiếng Việt. Hệ thống sẽ tự động chuyển giọng nói của bạn thành văn bản.
        </p>
      </div>

      <div className="card card-green">
        {/* Browser support warning */}
        {!stt.isSupported && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--accent-red-dim)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 20,
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.9rem', marginBottom: 4 }}>
                Trình duyệt không hỗ trợ
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Tính năng nhận dạng giọng nói yêu cầu Google Chrome hoặc Microsoft Edge. Hãy đổi sang trình duyệt được hỗ trợ.
              </div>
            </div>
          </div>
        )}

        {/* Visualizer */}
        <div className="stt-visualizer" aria-hidden="true">
          {Array.from({ length: numBars }).map((_, i) => (
            <div
              key={i}
              ref={el => barsRef.current[i] = el}
              className={`stt-bar ${stt.isListening ? 'active' : ''}`}
              style={{
                height: '4px',
                animationDelay: `${(i * 0.05) % 0.5}s`,
                animationDuration: `${0.3 + (i % 5) * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Mic button */}
        <div className="mic-btn-wrapper">
          <div style={{ position: 'relative' }}>
            {stt.isListening && (
              <>
                <div className="mic-pulse-ring" />
                <div className="mic-pulse-ring" style={{ animationDelay: '0.5s' }} />
              </>
            )}
            <button
              id="stt-mic-btn"
              className={`btn btn-icon-lg ${stt.isListening ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggle}
              aria-label={stt.isListening ? 'Dừng nghe' : 'Bắt đầu nghe giọng nói'}
              aria-pressed={stt.isListening}
              disabled={!stt.isSupported}
              style={{ zIndex: 1, position: 'relative' }}
            >
              {stt.isListening ? '⏹' : '🎙️'}
            </button>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            {stt.isListening
              ? <span style={{ color: 'var(--accent-green)' }}>Đang nghe...</span>
              : <span style={{ color: 'var(--text-secondary)' }}>Nhấn để nói</span>
            }
          </div>
        </div>

        {/* Status */}
        <div className="stt-status" role="status" aria-live="polite">
          <div className={`status-dot ${stt.status}`} />
          {stt.status === 'idle' && <span>Sẵn sàng nhận giọng nói</span>}
          {stt.status === 'listening' && <span>Đang nghe giọng nói tiếng Việt...</span>}
          {stt.status === 'processing' && <span>Đang xử lý...</span>}
          {stt.status === 'error' && <span style={{ color: 'var(--accent-red)' }}>{stt.errorMsg}</span>}
        </div>

        {/* Transcript display */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Văn bản nhận dạng
          </div>
          <div
            className="stt-transcript-box"
            role="region"
            aria-label="Văn bản được nhận dạng từ giọng nói"
            aria-live="polite"
          >
            {!stt.transcript && !stt.interimTranscript && (
              <span style={{ color: 'var(--text-muted)' }}>
                Văn bản sẽ xuất hiện ở đây khi bạn nói...
              </span>
            )}
            {stt.transcript && (
              <span className="stt-final">{stt.transcript}</span>
            )}
            {stt.interimTranscript && (
              <span className="stt-interim">{stt.interimTranscript}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {(stt.transcript || stt.interimTranscript) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleReadBack}
              aria-label="Đọc lại văn bản đã nhận dạng"
            >
              🔊 Đọc Lại
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              aria-label="Sao chép văn bản"
            >
              📋 Sao Chép
            </button>
            <button
              className="btn btn-secondary"
              onClick={stt.clearTranscript}
              aria-label="Xoá văn bản"
            >
              🗑 Xoá
            </button>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📋 Hướng dẫn sử dụng
          </div>
          <ol style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
            <li>Nhấn nút microphone để bắt đầu</li>
            <li>Nói rõ ràng, tốc độ vừa phải bằng tiếng Việt</li>
            <li>Ứng dụng nhận dạng liên tục - không cần dừng lại</li>
            <li>Nhấn nút dừng khi hoàn thành</li>
            <li>Nhấn "Đọc Lại" để nghe lại văn bản đã nhận dạng</li>
          </ol>
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ⚡ Yêu cầu: Google Chrome, Microsoft Edge | Cần cấp quyền microphone
          </div>
        </div>
      </div>
    </div>
  )
}
