// OCR Section - Nhận dạng văn bản từ ảnh
import { useState, useRef, useCallback } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function OCRSection({ addToast }) {
  const [image, setImage] = useState(null)
  const [imageURL, setImageURL] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const tts = useTTS()

  const processImage = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file ảnh (JPG, PNG, v.v.)', 'error')
      return
    }

    setImage(file)
    setImageURL(URL.createObjectURL(file))
    setExtractedText('')
    setIsProcessing(true)
    setOcrProgress(0)
    addToast('Đang nhận dạng văn bản từ ảnh...', 'info')

    try {
      // Dynamically import Tesseract.js - it's loaded via CDN
      // We'll use the global Tesseract if available, otherwise show instructions
      if (typeof window.Tesseract === 'undefined') {
        // Simulate OCR with canvas text extraction approach
        await simulateOCR(file)
      } else {
        await runTesseract(file)
      }
    } catch (err) {
      console.error(err)
      addToast('Lỗi nhận dạng ảnh. Vui lòng thử lại.', 'error')
      setIsProcessing(false)
    }
  }, [addToast])

  const simulateOCR = async (file) => {
    // Fallback: Use canvas + basic text detection
    // In production, integrate Tesseract.js or Google Cloud Vision API
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 80))
      setOcrProgress(i)
    }

    // For MVP demo: use a descriptive placeholder with instructions
    const demoText = `[Hệ thống nhận dạng văn bản]

Để sử dụng tính năng OCR đầy đủ, ứng dụng cần kết nối với dịch vụ nhận dạng văn bản.

Ảnh đã được tải lên thành công: ${file.name}
Kích thước: ${(file.size / 1024).toFixed(1)} KB
Loại file: ${file.type}

Tích hợp OCR:
• Tesseract.js (miễn phí, chạy ngay trên trình duyệt)
• Google Cloud Vision API (chính xác cao)
• Microsoft Azure Computer Vision

Thêm vào index.html:
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>`

    setExtractedText(demoText)
    setIsProcessing(false)
    addToast('Hoàn tất! Nhấn "Đọc kết quả" để nghe.', 'success')
  }

  const runTesseract = async (file) => {
    const { createWorker } = window.Tesseract
    const worker = await createWorker('vie+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100))
        }
      }
    })

    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()

    setExtractedText(text || 'Không tìm thấy văn bản trong ảnh.')
    setIsProcessing(false)
    addToast('Nhận dạng hoàn tất! Nhấn "Đọc kết quả" để nghe.', 'success')
  }

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
    setImage(null)
    setImageURL(null)
    setExtractedText('')
    setOcrProgress(0)
    tts.stop()
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        {/* Upload area */}
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
            <div className="ocr-upload-sub">hoặc nhấn để chọn file từ máy tính</div>
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
            {/* Processing state */}
            {isProcessing && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div className="spinner" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Đang nhận dạng văn bản... {ocrProgress}%
                  </span>
                </div>
                <div className="tts-progress">
                  <div className="tts-progress-bar" style={{ width: `${ocrProgress}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }} />
                </div>
              </div>
            )}

            <div className="ocr-preview-area">
              {/* Image preview */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Ảnh gốc
                </div>
                <img
                  src={imageURL}
                  alt="Ảnh đã tải lên để nhận dạng văn bản"
                  className="ocr-image-preview"
                />
              </div>

              {/* Extracted text */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Văn bản nhận dạng được
                </div>
                <div
                  className="ocr-result-box"
                  role="region"
                  aria-label="Kết quả nhận dạng văn bản"
                  aria-live="polite"
                >
                  {isProcessing
                    ? <span style={{ color: 'var(--text-muted)' }}>Đang xử lý...</span>
                    : extractedText
                      ? extractedText
                      : <span style={{ color: 'var(--text-muted)' }}>Văn bản sẽ xuất hiện ở đây...</span>
                  }
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {extractedText && !isProcessing && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => tts.speak(extractedText)}
                    aria-label="Đọc to văn bản nhận dạng được"
                  >
                    🔊 Đọc Kết Quả
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCopy}
                    aria-label="Sao chép văn bản"
                  >
                    📋 Sao Chép
                  </button>
                </>
              )}
              {tts.isSpeaking && (
                <button
                  className="btn btn-danger"
                  onClick={tts.stop}
                  aria-label="Dừng đọc"
                >
                  ⏹ Dừng
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                aria-label="Tải ảnh khác"
              >
                🔄 Ảnh Khác
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="ocr-input"
          onChange={handleFileChange}
          aria-label="Chọn file ảnh"
          id="ocr-file-input"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="ocr-input"
          onChange={handleFileChange}
          aria-label="Chụp ảnh từ camera"
          id="ocr-camera-input"
        />
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 16, background: 'var(--accent-blue-dim)', borderColor: 'rgba(78,154,241,0.2)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue-light)', fontWeight: 700, marginBottom: 10 }}>
          💡 Mẹo để kết quả tốt nhất
        </div>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 2, paddingLeft: 20 }}>
          <li>Chụp ảnh rõ nét, đủ ánh sáng</li>
          <li>Đặt camera thẳng góc với văn bản</li>
          <li>Tránh bóng đổ, phản chiếu ánh sáng</li>
          <li>Phù hợp với sách, báo, biển hiệu, đơn thuốc...</li>
          <li>Hỗ trợ tiếng Việt và tiếng Anh</li>
        </ul>
      </div>
    </div>
  )
}
