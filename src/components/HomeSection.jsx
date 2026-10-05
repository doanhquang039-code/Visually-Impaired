// Home / Welcome screen - MatViet 2.0
export default function HomeSection({ setActiveTab }) {
  const features = [
    { id: 'tts', tab: 'tts', icon: '🔊', title: 'Đọc Văn Bản', desc: 'Nghe đọc bất kỳ văn bản tiếng Việt nào bằng giọng nói tự nhiên.', color: 'gold', shortcut: 'Alt+1' },
    { id: 'ocr', tab: 'ocr', icon: '📷', title: 'Đọc Chữ Từ Ảnh', desc: 'Chụp ảnh tài liệu, sách, biển hiệu... AI nhận dạng và đọc to.', color: 'blue', shortcut: 'Alt+2' },
    { id: 'stt', tab: 'stt', icon: '🎙️', title: 'Nói Để Nhập', desc: 'Điều khiển bằng giọng nói tiếng Việt, chuyển thành văn bản tức thì.', color: 'green', shortcut: 'Alt+3' },
    { id: 'news', tab: 'news', icon: '📰', title: 'Đọc Tin Tức', desc: 'Tin tức Việt Nam được biên tập đặc biệt cho người khiếm thị.', color: 'purple', shortcut: 'Alt+4' },
    { id: 'clock', tab: 'clock', icon: '⏰', title: 'Đồng Hồ Nói Giờ', desc: 'Nghe giờ hiện tại, đặt báo thức tự động thông báo bằng giọng nói.', color: 'green', shortcut: 'Alt+5' },
    { id: 'color', tab: 'color', icon: '🎨', title: 'Nhận Diện Màu', desc: 'Hướng camera vào vật thể để nghe tên màu sắc bằng tiếng Việt.', color: 'purple', shortcut: 'Alt+6' },
    { id: 'braille', tab: 'braille', icon: '📖', title: 'Chữ Braille', desc: 'Chuyển đổi văn bản tiếng Việt sang ký hiệu chữ nổi Braille.', color: 'gold', shortcut: 'Alt+7' },
    { id: 'calc', tab: 'calc', icon: '🔢', title: 'Máy Tính Nói', desc: 'Tính toán và đọc to kết quả, hỗ trợ đọc các phép tính.', color: 'blue', shortcut: 'Alt+8' },
    { id: 'qr', tab: 'qr', icon: '📱', title: 'Quét QR Code', desc: 'Dùng camera quét mã QR và đọc to nội dung bên trong.', color: 'green', shortcut: 'Alt+9' },
    { id: 'notes', tab: 'notes', icon: '🎤', title: 'Ghi Chú Giọng Nói', desc: 'Ghi lại, lưu trữ và phát lại các ghi chú bằng giọng nói.', color: 'gold', shortcut: 'Alt+0' },
    { id: 'emergency', tab: 'emergency', icon: '🆘', title: 'Gọi Khẩn Cấp', desc: 'Danh bạ nhanh: 113, 114, 115 và gọi nhanh cho người thân.', color: 'purple', shortcut: 'Alt+E' },
    { id: 'weather', tab: 'weather', icon: '🌤️', title: 'Thời Tiết Nói', desc: 'Cập nhật thời tiết hiện tại qua GPS và đọc bằng giọng nói.', color: 'blue', shortcut: 'Alt+W' },
    { id: 'convert', tab: 'convert', icon: '📏', title: 'Chuyển Đơn Vị', desc: 'Chuyển đổi nhanh độ dài, nhiệt độ, khối lượng và đọc.', color: 'green', shortcut: 'Alt+C' },
    { id: 'dict', tab: 'dict', icon: '🔤', title: 'Từ Điển Việt', desc: 'Tra nghĩa từ tiếng Việt, tích hợp đọc to định nghĩa.', color: 'purple', shortcut: 'Alt+D' },
    { id: 'location', tab: 'location', icon: '📍', title: 'Định Hướng GPS', desc: 'Đọc tọa độ, địa chỉ hiện tại và kết nối Google Maps.', color: 'gold', shortcut: 'Alt+L' },
    { id: 'settings', tab: 'settings', icon: '⚙️', title: 'Cài Đặt', desc: 'Tuỳ chỉnh cỡ chữ, giọng đọc, tốc độ và lưu tự động.', color: 'blue', shortcut: 'Alt+,' },
  ]

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="home-hero">
        <img src="/logo.png" alt="Logo MatViet" className="hero-logo" />
        <h1 className="hero-title">MatViet 2.0</h1>
        <p className="hero-sub">
          Ứng dụng hỗ trợ người khiếm thị Việt Nam với 15 tính năng: đọc văn bản, OCR, giọng nói, tin tức, đồng hồ, màu sắc, Braille, máy tính, mã QR, thời tiết, định vị và hơn thế nữa.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button id="home-start-btn" className="btn btn-primary btn-lg" onClick={() => setActiveTab('tts')} aria-label="Bắt đầu sử dụng">
            🚀 Bắt Đầu Ngay
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setActiveTab('settings')} aria-label="Đi đến cài đặt">
            ⚙️ Cài Đặt
          </button>
        </div>
      </div>

      {/* Feature grid - 4 columns on wide screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginTop: 8 }}>
        {features.map(f => (
          <button
            key={f.id}
            id={`home-feature-${f.id}`}
            className={`feature-card ${f.color}`}
            onClick={() => setActiveTab(f.tab)}
            aria-label={`Chuyển đến: ${f.title}. ${f.desc}`}
          >
            <span className="feature-card-icon" aria-hidden="true">{f.icon}</span>
            <div className="feature-card-title">{f.title}</div>
            <div className="feature-card-desc">{f.desc}</div>
            <div style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.68rem', color: 'var(--text-muted)',
              background: 'var(--bg-secondary)', padding: '3px 9px',
              borderRadius: '999px', border: '1px solid var(--border-default)',
            }}>
              <kbd style={{ color: 'var(--accent-gold-light)', fontFamily: 'monospace' }}>{f.shortcut}</kbd>
            </div>
          </button>
        ))}
      </div>

      {/* Quick keyboard shortcuts */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ⌨️ Phím tắt quan trọng
        </div>
        <div className="shortcut-grid">
          {[
            { key: 'Alt+1 ~ 0', desc: 'Chuyển 10 tính năng đầu' },
            { key: 'Alt + E,W,C,D,L', desc: 'Mở tính năng phụ' },
            { key: 'Alt+H', desc: 'Về trang chủ' },
            { key: 'Alt+,', desc: 'Mở Cài Đặt' },
            { key: 'Alt+P', desc: 'Tạm dừng đọc' },
            { key: 'Alt+S', desc: 'Dừng đọc' },
            { key: 'Alt+M', desc: 'Bật/tắt microphone' },
            { key: 'Alt++', desc: 'Tăng cỡ chữ' },
            { key: 'Alt+-', desc: 'Giảm cỡ chữ' },
            { key: 'Tab', desc: 'Di chuyển giữa các nút' },
            { key: 'Enter', desc: 'Kích hoạt nút đang chọn' },
          ].map(s => (
            <div key={s.key} className="shortcut-item">
              <span className="shortcut-key">{s.key}</span>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WCAG badge */}
      <div style={{
        marginTop: 18, padding: '16px 20px',
        background: 'var(--accent-gold-dim)',
        border: '1px solid rgba(240,180,41,0.2)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.85rem', color: 'var(--accent-gold-light)',
        display: 'flex', gap: 12, alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>♿</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Chuẩn WCAG 2.1 AA · Tương thích Screen Reader</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Toàn bộ ứng dụng điều hướng được bằng bàn phím · Tỉ lệ tương phản cao · Hỗ trợ NVDA, JAWS, VoiceOver, TalkBack
          </div>
        </div>
      </div>
    </div>
  )
}
