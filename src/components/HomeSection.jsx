// Home / Welcome screen
export default function HomeSection({ setActiveTab }) {
  const features = [
    {
      id: 'tts',
      tab: 'tts',
      icon: '🔊',
      title: 'Đọc Văn Bản',
      desc: 'Nhập bất kỳ đoạn văn nào và nghe đọc bằng giọng tiếng Việt tự nhiên. Điều chỉnh tốc độ, cao độ và âm lượng theo ý muốn.',
      color: 'gold',
      shortcut: 'Alt + 1',
    },
    {
      id: 'ocr',
      tab: 'ocr',
      icon: '📷',
      title: 'Đọc Chữ Từ Ảnh',
      desc: 'Chụp ảnh tài liệu, sách, báo, biển hiệu... Hệ thống sẽ nhận dạng chữ và đọc to nội dung cho bạn.',
      color: 'blue',
      shortcut: 'Alt + 2',
    },
    {
      id: 'stt',
      tab: 'stt',
      icon: '🎙️',
      title: 'Nói Để Nhập',
      desc: 'Điều khiển bằng giọng nói tiếng Việt. Nói tự nhiên, hệ thống chuyển thành văn bản ngay lập tức.',
      color: 'green',
      shortcut: 'Alt + 3',
    },
    {
      id: 'news',
      tab: 'news',
      icon: '📰',
      title: 'Đọc Tin Tức',
      desc: 'Tin tức hàng ngày được biên tập và trình bày đặc biệt dành cho người khiếm thị Việt Nam.',
      color: 'purple',
      shortcut: 'Alt + 4',
    },
  ]

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="home-hero">
        <img
          src="/logo.png"
          alt="Logo MatViet"
          className="hero-logo"
        />
        <h1 className="hero-title">
          Chào Mừng Đến MatViet
        </h1>
        <p className="hero-sub">
          Ứng dụng hỗ trợ người khiếm thị Việt Nam tiếp cận thông tin và giao tiếp dễ dàng hơn với công nghệ hiện đại.
        </p>
        <button
          id="home-start-btn"
          className="btn btn-primary btn-lg"
          onClick={() => setActiveTab('tts')}
          aria-label="Bắt đầu sử dụng MatViet ngay"
        >
          🚀 Bắt Đầu Ngay
        </button>
      </div>

      {/* Feature cards */}
      <div className="feature-grid">
        {features.map(f => (
          <button
            key={f.id}
            id={`home-feature-${f.id}`}
            className={`feature-card ${f.color}`}
            onClick={() => setActiveTab(f.tab)}
            aria-label={`Chuyển đến tính năng: ${f.title}. ${f.desc}`}
          >
            <span className="feature-card-icon" aria-hidden="true">{f.icon}</span>
            <div className="feature-card-title">{f.title}</div>
            <div className="feature-card-desc">{f.desc}</div>
            <div style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid var(--border-default)',
            }}>
              <kbd style={{ fontFamily: 'monospace', color: 'var(--accent-gold-light)' }}>{f.shortcut}</kbd>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="card" style={{ marginTop: 28 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ⌨️ Phím tắt hỗ trợ người dùng
        </div>
        <div className="shortcut-grid">
          {[
            { key: 'Alt + 1', desc: 'Đọc văn bản (TTS)' },
            { key: 'Alt + 2', desc: 'Nhận dạng ảnh (OCR)' },
            { key: 'Alt + 3', desc: 'Nhận giọng nói (STT)' },
            { key: 'Alt + 4', desc: 'Đọc tin tức' },
            { key: 'Alt + H', desc: 'Về trang chủ' },
            { key: 'Alt + P', desc: 'Tạm dừng / Tiếp tục đọc' },
            { key: 'Alt + S', desc: 'Dừng đọc' },
            { key: 'Alt + M', desc: 'Bật/tắt microphone' },
            { key: 'Alt + +', desc: 'Tăng cỡ chữ' },
            { key: 'Alt + -', desc: 'Giảm cỡ chữ' },
          ].map(s => (
            <div key={s.key} className="shortcut-item">
              <span className="shortcut-key">{s.key}</span>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility note */}
      <div style={{
        marginTop: 20,
        padding: '18px 22px',
        background: 'var(--accent-gold-dim)',
        border: '1px solid rgba(240,180,41,0.2)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.85rem',
        color: 'var(--accent-gold-light)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>♿</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Được thiết kế theo chuẩn WCAG 2.1 AA</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            MatViet tuân thủ các hướng dẫn tiếp cận web quốc tế: tương thích với phần mềm đọc màn hình,
            điều hướng hoàn toàn bằng bàn phím, tỉ lệ tương phản màu sắc cao, và kích thước chữ có thể điều chỉnh.
          </div>
        </div>
      </div>
    </div>
  )
}
