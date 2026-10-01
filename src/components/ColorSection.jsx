// Nhận diện màu sắc - Color Identifier using camera
import { useState, useRef, useCallback, useEffect } from 'react'
import { useTTS } from '../hooks/useTTS'

// Map màu phổ biến sang tiếng Việt
function getColorName(r, g, b) {
  const colors = [
    { name: 'Đỏ tươi', rgb: [255, 0, 0] },
    { name: 'Đỏ đậm', rgb: [139, 0, 0] },
    { name: 'Cam', rgb: [255, 165, 0] },
    { name: 'Cam đậm', rgb: [255, 69, 0] },
    { name: 'Vàng', rgb: [255, 255, 0] },
    { name: 'Vàng nhạt', rgb: [255, 255, 153] },
    { name: 'Vàng cam', rgb: [255, 200, 0] },
    { name: 'Xanh lá', rgb: [0, 128, 0] },
    { name: 'Xanh lá nhạt', rgb: [144, 238, 144] },
    { name: 'Xanh lá đậm', rgb: [0, 100, 0] },
    { name: 'Xanh dương', rgb: [0, 0, 255] },
    { name: 'Xanh dương nhạt', rgb: [135, 206, 235] },
    { name: 'Xanh dương đậm', rgb: [0, 0, 139] },
    { name: 'Tím', rgb: [128, 0, 128] },
    { name: 'Tím nhạt', rgb: [216, 191, 216] },
    { name: 'Tím hoa cà', rgb: [153, 50, 204] },
    { name: 'Hồng', rgb: [255, 182, 193] },
    { name: 'Hồng đậm', rgb: [255, 20, 147] },
    { name: 'Nâu', rgb: [139, 69, 19] },
    { name: 'Nâu nhạt', rgb: [210, 180, 140] },
    { name: 'Đen', rgb: [0, 0, 0] },
    { name: 'Xám đậm', rgb: [64, 64, 64] },
    { name: 'Xám', rgb: [128, 128, 128] },
    { name: 'Xám nhạt', rgb: [192, 192, 192] },
    { name: 'Trắng', rgb: [255, 255, 255] },
    { name: 'Kem', rgb: [255, 253, 208] },
    { name: 'Ngà', rgb: [255, 255, 240] },
    { name: 'Xanh ngọc', rgb: [0, 128, 128] },
    { name: 'Xanh lơ', rgb: [0, 255, 255] },
    { name: 'Vàng nâu', rgb: [184, 134, 11] },
  ]

  let minDist = Infinity
  let closest = 'Không xác định'

  for (const c of colors) {
    const d = Math.sqrt(
      Math.pow(r - c.rgb[0], 2) +
      Math.pow(g - c.rgb[1], 2) +
      Math.pow(b - c.rgb[2], 2)
    )
    if (d < minDist) { minDist = d; closest = c.name }
  }
  return closest
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function getLuminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export default function ColorSection({ addToast }) {
  const [stream, setStream] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [detectedColor, setDetectedColor] = useState(null)
  const [history, setHistory] = useState([])
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const tts = useTTS()

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setIsActive(false)
  }, [stream])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      setStream(s)
      setIsActive(true)
      if (videoRef.current) videoRef.current.srcObject = s
      addToast('Camera đã bật. Hướng vào vật thể cần nhận diện màu.', 'success')
    } catch {
      addToast('Không thể truy cập camera. Hãy cấp quyền camera.', 'error')
    }
  }

  const captureColor = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Sample center area (5x5 pixels)
    const cx = Math.floor(canvas.width / 2)
    const cy = Math.floor(canvas.height / 2)
    const size = 20
    const data = ctx.getImageData(cx - size/2, cy - size/2, size, size).data

    let r = 0, g = 0, b = 0, count = 0
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i+1]; b += data[i+2]; count++
    }
    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    const name = getColorName(r, g, b)
    const hex = rgbToHex(r, g, b)
    const lum = getLuminance(r, g, b)
    const brightness = lum > 0.7 ? 'sáng' : lum > 0.3 ? 'trung bình' : 'tối'

    const result = { name, hex, r, g, b, brightness, time: new Date().toLocaleTimeString('vi-VN') }
    setDetectedColor(result)
    setHistory(prev => [result, ...prev].slice(0, 8))
    tts.speak(`Màu ${name}. Độ sáng ${brightness}.`)
  }, [tts])

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
          <span>🎨</span> Nhận Diện Màu
        </div>
        <h1 className="section-title">Nhận Diện Màu Sắc</h1>
        <p className="section-desc">
          Hướng camera vào vật thể để nhận biết màu sắc. Kết quả được đọc to bằng tiếng Việt.
        </p>
      </div>

      <div className="card card-purple">
        {/* Camera feed */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', aspectRatio: '4/3', maxHeight: 320 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none' }}
            aria-label="Camera nhận diện màu sắc"
          />

          {!isActive && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '4rem' }}>📷</span>
              <span>Nhấn "Bật Camera" để bắt đầu</span>
            </div>
          )}

          {/* Crosshair center indicator */}
          {isActive && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 60, height: 60,
              pointerEvents: 'none',
            }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.8)' }}/>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.8)' }}/>
              <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.6)', borderRadius: 4 }}/>
            </div>
          )}

          {/* Color preview overlay */}
          {detectedColor && isActive && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              background: 'rgba(0,0,0,0.8)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: detectedColor.hex, border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}/>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{detectedColor.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{detectedColor.hex.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {!isActive ? (
            <button className="btn btn-primary btn-lg" onClick={startCamera} aria-label="Bật camera nhận diện màu">
              📷 Bật Camera
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={captureColor} aria-label="Chụp và nhận diện màu sắc ngay">
                🎨 Nhận Diện Màu
              </button>
              <button className="btn btn-danger" onClick={stopCamera} aria-label="Tắt camera">
                ⏹ Tắt Camera
              </button>
            </>
          )}
        </div>

        {/* Current result */}
        {detectedColor && (
          <div style={{
            marginTop: 20,
            padding: '20px',
            background: detectedColor.hex,
            borderRadius: 'var(--radius-lg)',
            border: '2px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1.8rem', fontWeight: 900,
                color: getLuminance(detectedColor.r, detectedColor.g, detectedColor.b) > 0.5 ? '#000' : '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }}>
                {detectedColor.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: getLuminance(detectedColor.r, detectedColor.g, detectedColor.b) > 0.5 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }}>
                {detectedColor.hex.toUpperCase()} · RGB({detectedColor.r}, {detectedColor.g}, {detectedColor.b}) · Độ sáng: {detectedColor.brightness}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => tts.speak(`Màu ${detectedColor.name}. ${detectedColor.brightness}.`)}
              aria-label={`Đọc tên màu: ${detectedColor.name}`}
            >
              🔊
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Lịch sử nhận diện
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {history.map((c, i) => (
                <button
                  key={i}
                  onClick={() => tts.speak(`Màu ${c.name}`)}
                  title={c.name}
                  aria-label={`Màu ${c.name} lúc ${c.time}`}
                  style={{
                    width: 44, height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: c.hex,
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📋 Cách dùng</div>
          <ol style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
            <li>Nhấn "Bật Camera" và cho phép truy cập</li>
            <li>Hướng camera vào vật thể cần nhận màu</li>
            <li>Đặt ô vuông ở trung tâm màn hình lên vùng màu cần xác định</li>
            <li>Nhấn "Nhận Diện Màu" để nghe kết quả</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
