// STTSection - Fixed version
// Fixes:
// 1. Audio visualizer using React state (not direct DOM) - avoids conflict
// 2. Better mic button with clear visual states
// 3. Auto-scroll transcript
import { useEffect, useRef, useState } from 'react'
import { useSTT } from '../hooks/useSTT'
import { useTTS } from '../hooks/useTTS'

const NUM_BARS = 28

export default function STTSection({ addToast }) {
  const stt = useSTT()
  const tts = useTTS()
  const [barHeights, setBarHeights] = useState(Array(NUM_BARS).fill(4))
  const transcriptRef = useRef(null)
  const animFrameRef = useRef(null)

  // Animate bars using requestAnimationFrame (smoother, no DOM conflict)
  useEffect(() => {
    if (stt.isListening) {
      const animate = () => {
        setBarHeights(prev => prev.map(() => Math.random() * 44 + 4))
        animFrameRef.current = requestAnimationFrame(animate)
      }
      // Throttle to ~10fps for visual effect
      let last = 0
      const throttled = (ts) => {
        if (ts - last > 100) {
          setBarHeights(prev => prev.map(() => Math.random() * 44 + 4))
          last = ts
        }
        animFrameRef.current = requestAnimationFrame(throttled)
      }
      animFrameRef.current = requestAnimationFrame(throttled)
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      setBarHeights(Array(NUM_BARS).fill(4))
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [stt.isListening])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [stt.transcript, stt.interimTranscript])

  const handleToggle = () => {
    if (!stt.isSupported) {
      addToast('Trình duyệt không hỗ trợ. Hãy dùng Google Chrome hoặc Edge.', 'error')
      return
    }
    if (stt.isListening) {
      stt.stopListening()
      addToast('Đã dừng nghe.', 'info')
    } else {
      stt.startListening()
      addToast('🎙️ Đang nghe... Hãy nói tiếng Việt!', 'success')
    }
  }

  const handleReadBack = () => {
    const fullText = (stt.transcript + ' ' + stt.interimTranscript).trim()
    if (!fullText) { addToast('Chưa có văn bản để đọc lại.', 'error'); return }
    tts.speak(fullText)
  }

  const handleCopy = async () => {
    if (!stt.transcript.trim()) return
    try {
      await navigator.clipboard.writeText(stt.transcript.trim())
      addToast('Đã sao chép!', 'success')
    } catch {
      addToast('Không thể sao chép.', 'error')
    }
  }

  const hasContent = stt.transcript.trim() || stt.interimTranscript.trim()

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge green">
          <span>🎙️</span> Nhận Dạng Giọng Nói
        </div>
        <h1 className="section-title">Nói Để Nhập Văn Bản</h1>
        <p className="section-desc">
          Nhấn nút microphone và nói tiếng Việt. Văn bản xuất hiện tức thì, không cần gõ bàn phím.
        </p>
      </div>

      <div className="card card-green">
        {/* Browser support warning */}
        {!stt.isSupported && (
          <div style={{ padding: '16px 20px', background: 'var(--accent-red-dim)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-lg)', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.9rem', marginBottom: 4 }}>Trình duyệt không hỗ trợ</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Nhận dạng giọng nói yêu cầu <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Visualizer */}
        <div
          className="stt-visualizer"
          aria-hidden="true"
          style={{ height: 60, alignItems: 'flex-end', justifyContent: 'center' }}
        >
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="stt-bar"
              style={{
                height: `${h}px`,
                opacity: stt.isListening ? 0.6 + (h / 48) * 0.4 : 0.3,
                background: stt.isListening
                  ? `hsl(${140 + i * 4}, 70%, 55%)`
                  : 'var(--border-default)',
                transition: 'height 0.1s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Mic button */}
        <div className="mic-btn-wrapper">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stt.isListening && (
              <>
                <div className="mic-pulse-ring" style={{ position: 'absolute', inset: -10, borderColor: 'var(--accent-green)' }} />
                <div className="mic-pulse-ring" style={{ position: 'absolute', inset: -10, borderColor: 'var(--accent-green)', animationDelay: '0.75s' }} />
              </>
            )}
            <button
              id="stt-mic-btn"
              className={`btn btn-icon-lg ${stt.isListening ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggle}
              aria-label={stt.isListening ? 'Dừng nghe giọng nói' : 'Bắt đầu nghe giọng nói'}
              aria-pressed={stt.isListening}
              disabled={!stt.isSupported}
              style={{ zIndex: 1, position: 'relative', fontSize: '1.8rem' }}
            >
              {stt.isListening ? '⏹' : '🎙️'}
            </button>
          </div>

          <div style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
            {stt.isListening
              ? <span style={{ color: 'var(--accent-green)' }}>🔴 Đang nghe...</span>
              : <span style={{ color: 'var(--text-secondary)' }}>Nhấn để nói</span>
            }
          </div>
        </div>

        {/* Status */}
        <div className="stt-status" role="status" aria-live="polite" aria-atomic="true">
          <div className={`status-dot ${stt.status}`} />
          {stt.status === 'idle' && <span>Sẵn sàng nhận giọng nói tiếng Việt</span>}
          {stt.status === 'listening' && <span>Đang nghe... nói rõ ràng vào microphone</span>}
          {stt.status === 'processing' && <span>Đang xử lý...</span>}
          {stt.status === 'error' && (
            <span style={{ color: 'var(--accent-red)' }}>{stt.errorMsg}</span>
          )}
        </div>

        {/* Transcript */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Văn bản nhận dạng
            </span>
            {stt.transcript && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {stt.transcript.trim().length} ký tự
              </span>
            )}
          </div>
          <div
            ref={transcriptRef}
            className="stt-transcript-box"
            role="region"
            aria-label="Văn bản được nhận dạng từ giọng nói"
            aria-live="polite"
            style={{ overflowY: 'auto', maxHeight: 200 }}
          >
            {!hasContent ? (
              <span style={{ color: 'var(--text-muted)' }}>
                Văn bản sẽ xuất hiện ở đây khi bạn nói...
              </span>
            ) : (
              <>
                {stt.transcript && (
                  <span className="stt-final">{stt.transcript}</span>
                )}
                {stt.interimTranscript && (
                  <span className="stt-interim"> {stt.interimTranscript}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {hasContent && (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            {tts.isSpeaking ? (
              <button className="btn btn-danger" onClick={tts.stop} aria-label="Dừng đọc lại">
                ⏹ Dừng Đọc
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleReadBack} aria-label="Đọc lại văn bản">
                🔊 Đọc Lại
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleCopy} aria-label="Sao chép văn bản">
              📋 Sao Chép
            </button>
            <button className="btn btn-secondary" onClick={stt.clearTranscript} aria-label="Xoá văn bản">
              🗑 Xoá
            </button>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📋 Hướng dẫn
          </div>
          <ol style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
            <li>Nhấn nút 🎙️ → cho phép microphone khi trình duyệt hỏi</li>
            <li>Nói rõ ràng, vừa phải bằng <strong>tiếng Việt</strong></li>
            <li>Văn bản xám = đang nhận dạng · Văn bản trắng = đã xác nhận</li>
            <li>Nhấn ⏹ để dừng → nhấn "Đọc Lại" để nghe lại</li>
          </ol>
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ⚡ Yêu cầu: Google Chrome / Edge · Cần cấp quyền microphone · Cần internet
          </div>
        </div>
      </div>
    </div>
  )
}
