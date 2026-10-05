// QRScannerSection.jsx - Quét mã QR
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTTS } from '../hooks/useTTS'
import jsQR from 'jsqr'

export default function QRScannerSection({ addToast }) {
  const [isActive, setIsActive] = useState(false)
  const [result, setResult] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)
  const tts = useTTS()

  const stopCamera = useCallback(() => {
    setIsActive(false)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startCamera = async () => {
    setResult('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setIsActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(tick)
      }
      addToast('Đã bật camera. Hướng vào mã QR.', 'info')
    } catch {
      addToast('Lỗi truy cập camera', 'error')
    }
  }

  const tick = () => {
    if (!videoRef.current || !canvasRef.current) return
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
      if (code && code.data) {
        setResult(code.data)
        tts.speak(`Tìm thấy mã QR. Nội dung là: ${code.data}`)
        addToast('Quét thành công!', 'success')
        stopCamera()
        return
      }
    }
    if (isActive) animFrameRef.current = requestAnimationFrame(tick)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      addToast('Đã sao chép nội dung QR!', 'success')
    } catch {
      addToast('Không thể sao chép', 'error')
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          <span>📷</span> Quét QR
        </div>
        <h1 className="section-title">Quét Mã QR</h1>
        <p className="section-desc">Hướng camera vào mã QR. Ứng dụng sẽ tự động quét và đọc to nội dung.</p>
      </div>

      <div className="card">
        <div style={{ position: 'relative', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4/3', marginBottom: 20 }}>
          <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {!isActive && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '4rem' }}>📷</span>
              <p>Nhấn Bật Camera để bắt đầu</p>
            </div>
          )}
          
          {isActive && (
            <div style={{ position: 'absolute', inset: '20%', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: 12 }}>
               {/* Scanner frame */}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {!isActive ? (
            <button className="btn btn-primary btn-lg" onClick={startCamera}>📷 Bật Camera</button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={stopCamera}>⏹ Tắt Camera</button>
          )}
        </div>

        {result && (
          <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Kết quả quét:</div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: 16 }}>{result}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => tts.speak(result)}>🔊 Đọc Lại</button>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>📋 Sao Chép</button>
              {result.startsWith('http') && (
                <a href={result} target="_blank" rel="noreferrer" className="btn btn-outline-gold btn-sm">🌐 Mở Link</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
