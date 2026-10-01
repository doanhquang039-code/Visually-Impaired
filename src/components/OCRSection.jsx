// OCR Section - THỰC THẬT với Tesseract.js
import { useState, useRef, useCallback } from 'react'
import { createWorker } from 'tesseract.js'
import { useTTS } from '../hooks/useTTS'

export default function OCRSection({ addToast, settings }) {
  const [imageURL, setImageURL] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const tts = useTTS()

  const processImage = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file ảnh (JPG, PNG, v.v.)', 'error')
      return
    }

    setImageURL(URL.createObjectURL(file))
    setExtractedText('')
    setIsProcessing(true)
    setOcrProgress(0)
    setOcrStatus('Đang khởi tạo...')
    addToast('Đang nhận dạng văn bản từ ảnh...', 'info')

    try {
      const worker = await createWorker('vie+eng', 1, {
        logger: m => {
          if (m.status === 'loading tesseract core') {
            setOcrStatus('Đang tải engine...')
            setOcrProgress(10)
          } else if (m.status === 'loading language traineddata') {
            setOcrStatus('Đang tải dữ liệu tiếng Việt...')
            setOcrProgress(30)
          } else if (m.status === 'initializing api') {
            setOcrStatus('Đang khởi tạo...')
            setOcrProgress(50)
          } else if (m.status === 'recognizing text') {
            setOcrStatus('Đang nhận dạng văn bản...')
            setOcrProgress(50 + Math.round(m.progress * 50))
          }
        }
      })

      const { data: { text, confidence } } = await worker.recognize(file)
      await worker.terminate()

      const cleaned = text.trim()
      setExtractedText(cleaned || 'Không tìm thấy văn bản trong ảnh. Thử ảnh khác rõ hơn.')
      setOcrProgress(100)
      setOcrStatus('')
      setIsProcessing(false)

      const msg = cleaned
        ? `Nhận dạng xong! Độ chính xác: ${Math.round(confidence)}%. Nhấn "Đọc Kết Quả" để nghe.`
        : 'Không tìm thấy văn bản. Thử ảnh khác rõ hơn.'
      addToast(msg, cleaned ? 'success' : 'error')

      // Auto-read if setting enabled
      if (cleaned && settings?.autoReadOCR) {
        setTimeout(() => tts.speak(cleaned), 500)
      }
    } catch (err) {
      console.error(err)
      addToast('Lỗi nhận dạng ảnh. Vui lòng thử lại.', 'error')
      setIsProcessing(false)
      setOcrStatus('')
    }
  }, [addToast, settings, tts])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processImage(file)
  }, [processImage])

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)

  const handleCopy = async () => {
    if (!extractedText) return
    try {
      await navigator.clipboard.writeText(extractedText)
      addToast('Đã sao chép văn bản!', 'success')
    } catch {
      addToast('Không thể sao chép.', 'error')
    }
  }

  const handleReset = () => {
    setImageURL(null)
    setExtractedText('')
    setOcrProgress(0)
    setOcrStatus('')
    tts.stop()
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge blue">
          <span>📷</span> Nhận Dạng Ảnh
        </div>
        <h1 className="section-title">Đọc Văn Bản Từ Ảnh</h1>
        <p className="section-desc">
          Chụp ảnh hoặc tải lên hình ảnh có chứa chữ. Hệ thống sẽ nhận dạng và đọc to nội dung cho bạn.
        </p>
      </div>

      <div className="card card-blue">
        {!imageURL ? (
          <div
            className={`ocr-upload-area ${isDragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Khu vực tải ảnh. Nhấn để chọn hoặc kéo thả ảnh vào đây"
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <span className="ocr-upload-icon">🖼️</span>
            <div className="ocr-upload-title">Kéo thả ảnh vào đây</div>
            <div className="ocr-upload-sub">Hỗ trợ: JPG, PNG, WEBP, BMP, TIFF</div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline-blue btn-sm"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                aria-label="Chọn ảnh từ thư viện"
              >
                📁 Chọn File
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={e => { e.stopPropagation(); cameraInputRef.current?.click() }}
                aria-label="Chụp ảnh bằng camera"
              >
                📸 Camera
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Processing indicator */}
            {isProcessing && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div className="spinner" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {ocrStatus} {ocrProgress}%
                  </span>
                </div>
                <div className="tts-progress">
                  <div className="tts-progress-bar"
                    style={{ width: `${ocrProgress}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }}
                  />
                </div>
              </div>
            )}

            <div className="ocr-preview-area">
              {/* Image preview */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Ảnh gốc
                </div>
                <img
                  src={imageURL}
                  alt="Ảnh đã tải lên để nhận dạng"
                  className="ocr-image-preview"
                />
              </div>

              {/* Result */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Văn bản nhận dạng
                </div>
                <div
                  className="ocr-result-box"
                  role="region"
                  aria-label="Kết quả nhận dạng văn bản"
                  aria-live="polite"
                >
                  {isProcessing
                    ? <span style={{ color: 'var(--text-muted)' }}>Đang xử lý...</span>
                    : extractedText || <span style={{ color: 'var(--text-muted)' }}>Văn bản sẽ xuất hiện ở đây...</span>
                  }
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {extractedText && !isProcessing && (
                <>
                  {tts.isSpeaking ? (
                    <button className="btn btn-danger" onClick={tts.stop} aria-label="Dừng đọc">
                      ⏹ Dừng
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => tts.speak(extractedText)} aria-label="Đọc to văn bản">
                      🔊 Đọc Kết Quả
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={handleCopy} aria-label="Sao chép văn bản">
                    📋 Sao Chép
                  </button>
                </>
              )}
              <button className="btn btn-secondary" onClick={handleReset} aria-label="Tải ảnh khác">
                🔄 Ảnh Khác
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="ocr-input" onChange={handleFileChange} id="ocr-file-input" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="ocr-input" onChange={handleFileChange} id="ocr-camera-input" />
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 16, background: 'var(--accent-blue-dim)', borderColor: 'rgba(78,154,241,0.2)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue-light)', fontWeight: 700, marginBottom: 10 }}>💡 Mẹo để kết quả tốt nhất</div>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 2, paddingLeft: 20 }}>
          <li>Chụp ảnh rõ nét, đủ ánh sáng, chữ phải thẳng góc</li>
          <li>Tránh bóng đổ và phản chiếu ánh sáng</li>
          <li>Phù hợp: sách, báo, đơn thuốc, biển hiệu, hóa đơn</li>
          <li>Hỗ trợ: Tiếng Việt có dấu + Tiếng Anh</li>
          <li>Lần đầu dùng sẽ tải dữ liệu ngôn ngữ (~10MB)</li>
        </ul>
      </div>
    </div>
  )
}
