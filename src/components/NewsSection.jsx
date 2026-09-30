// News Reader Section - Đọc tin tức cho người khiếm thị
import { useState, useEffect } from 'react'
import { useTTS } from '../hooks/useTTS'

// Curated Vietnamese news articles (sample data for MVP)
const SAMPLE_NEWS = [
  {
    id: 1,
    category: 'Xã hội',
    icon: '🏛️',
    title: 'Hà Nội triển khai hệ thống xe buýt điện tuyến mới phục vụ người dân',
    summary: 'Thành phố Hà Nội chính thức đưa vào hoạt động 50 xe buýt điện tuyến số 41, kết nối trung tâm thành phố với các khu đô thị mới phía Tây.',
    content: `Hà Nội triển khai hệ thống xe buýt điện tuyến mới phục vụ người dân.

Thành phố Hà Nội vừa chính thức đưa vào hoạt động 50 xe buýt điện trên tuyến số 41, kết nối trung tâm thành phố với các khu đô thị mới phía Tây. Đây là một bước quan trọng trong chiến lược phát triển giao thông công cộng thân thiện với môi trường của thủ đô.

Xe buýt điện được trang bị hệ thống điều hòa không khí, màn hình thông tin hành trình, và đặc biệt có hệ thống thông báo giọng nói hỗ trợ người khiếm thị nhận biết các điểm dừng.

Giá vé: 9.000 đồng mỗi lượt, với nhiều ưu đãi cho người cao tuổi, người khuyết tật và học sinh sinh viên.`,
    source: 'Báo Hà Nội Mới',
    time: '2 giờ trước',
  },
  {
    id: 2,
    category: 'Y tế',
    icon: '🏥',
    title: 'Bộ Y tế phát hành ứng dụng đặt lịch khám bệnh miễn phí cho người dùng',
    summary: 'Ứng dụng VNeID Health cho phép đặt lịch khám tại hơn 500 bệnh viện toàn quốc, tích hợp hỗ trợ người khiếm thị với giao diện đọc màn hình.',
    content: `Bộ Y tế phát hành ứng dụng đặt lịch khám bệnh miễn phí.

Bộ Y tế vừa chính thức ra mắt ứng dụng đặt lịch khám bệnh trực tuyến VNeID Health, cho phép người dùng đặt lịch tại hơn 500 bệnh viện và cơ sở y tế trên toàn quốc hoàn toàn miễn phí.

Ứng dụng được thiết kế đặc biệt với giao diện hỗ trợ người khiếm thị, tương thích hoàn toàn với các phần mềm đọc màn hình như TalkBack và VoiceOver. Người dùng có thể điều hướng toàn bộ ứng dụng chỉ bằng giọng nói.

Để tải ứng dụng, truy cập App Store hoặc Google Play và tìm kiếm "VNeID Health". Ứng dụng hoàn toàn miễn phí và không chứa quảng cáo.`,
    source: 'VnExpress',
    time: '4 giờ trước',
  },
  {
    id: 3,
    category: 'Giáo dục',
    icon: '📚',
    title: 'Chương trình học bổng cho học sinh khiếm thị xuất sắc năm 2026 mở đơn',
    summary: 'Quỹ học bổng Ánh Sáng dành cho học sinh khuyết tật thị giác xuất sắc với mức hỗ trợ lên đến 20 triệu đồng mỗi năm học.',
    content: `Chương trình học bổng cho học sinh khiếm thị xuất sắc năm 2026 mở đơn.

Quỹ học bổng Ánh Sáng Việt Nam thông báo mở đơn đăng ký học bổng dành cho học sinh, sinh viên khuyết tật thị giác xuất sắc năm học 2026 - 2027.

Mức học bổng: Từ 10 đến 20 triệu đồng mỗi năm học, tùy theo cấp học và hoàn cảnh gia đình.

Điều kiện: Học sinh có hoàn cảnh khó khăn, bị khuyết tật thị giác, đạt kết quả học tập loại Khá trở lên.

Hạn nộp hồ sơ: 31 tháng 10 năm 2026.

Liên hệ: Gọi đường dây miễn phí 1800 599 920 để được hỗ trợ nộp hồ sơ.`,
    source: 'Tuổi Trẻ Online',
    time: '6 giờ trước',
  },
  {
    id: 4,
    category: 'Công nghệ',
    icon: '💻',
    title: 'Google ra mắt tính năng mô tả hình ảnh bằng AI hỗ trợ người khiếm thị',
    summary: 'Google cập nhật TalkBack trên Android với khả năng mô tả chi tiết hình ảnh bằng AI, hỗ trợ tiếng Việt từ phiên bản 14.0.',
    content: `Google ra mắt tính năng mô tả hình ảnh bằng AI hỗ trợ người khiếm thị.

Google vừa công bố cập nhật lớn cho TalkBack - phần mềm đọc màn hình trên Android - với khả năng mô tả chi tiết hình ảnh sử dụng trí tuệ nhân tạo Gemini.

Tính năng mới này cho phép người dùng khiếm thị nhận được mô tả chi tiết về bất kỳ hình ảnh nào trên màn hình, bao gồm ảnh chụp, biểu đồ, đồ thị, và thậm chí cả biểu cảm của con người trong ảnh.

Đặc biệt, tính năng này đã được tối ưu hóa cho tiếng Việt, cho phép người dùng nghe mô tả bằng giọng đọc tiếng Việt tự nhiên.

Cách bật: Vào Cài đặt - Hỗ trợ tiếp cận - TalkBack - Cài đặt TalkBack - Mô tả hình ảnh bằng AI.`,
    source: 'ICT News',
    time: '8 giờ trước',
  },
  {
    id: 5,
    category: 'Thể thao',
    icon: '⚽',
    title: 'Đội tuyển bóng đá người khiếm thị Việt Nam giành vé dự SEA Games 2027',
    summary: 'Đội tuyển bóng đá 5 người của Việt Nam xuất sắc vượt qua vòng loại để giành vé tham dự SEA Games 2027 tại Singapore.',
    content: `Đội tuyển bóng đá người khiếm thị Việt Nam giành vé dự SEA Games 2027.

Đội tuyển bóng đá 5 người khiếm thị Việt Nam đã có màn trình diễn xuất sắc tại vòng loại SEA Games 2027, giành chiến thắng trước đội chủ nhà Thái Lan với tỷ số 3-1.

Đây là lần thứ ba liên tiếp Việt Nam giành vé vào SEA Games, khẳng định vị thế của bóng đá người khiếm thị Việt Nam tại khu vực Đông Nam Á.

Đội trưởng Nguyễn Văn Mạnh chia sẻ: "Chúng tôi tập luyện rất chăm chỉ để mang lại niềm vui cho người hâm mộ. Đây là thành quả xứng đáng."

SEA Games 2027 sẽ diễn ra tại Singapore vào tháng 5 năm 2027.`,
    source: 'Báo Thể Thao Việt Nam',
    time: '10 giờ trước',
  },
  {
    id: 6,
    category: 'Kinh tế',
    icon: '💰',
    title: 'Nhà nước tăng lương hưu và trợ cấp cho người khuyết tật từ tháng 1/2027',
    summary: 'Chính phủ thông qua quyết định tăng 15% lương hưu và trợ cấp xã hội cho người khuyết tật, có hiệu lực từ ngày 1 tháng 1 năm 2027.',
    content: `Nhà nước tăng lương hưu và trợ cấp cho người khuyết tật từ tháng 1 năm 2027.

Chính phủ vừa thông qua Nghị định tăng mức lương hưu và trợ cấp bảo hiểm xã hội thêm 15 phần trăm, có hiệu lực từ ngày 1 tháng 1 năm 2027.

Cụ thể, trợ cấp xã hội hàng tháng cho người khuyết tật nặng tăng từ 900.000 đồng lên 1.035.000 đồng. Người khuyết tật đặc biệt nặng tăng từ 1.350.000 đồng lên 1.552.500 đồng.

Ngoài ra, người khuyết tật cũng được hưởng thêm các chính sách hỗ trợ: miễn phí đi xe buýt, giảm 50% vé tàu hỏa và máy bay, và hỗ trợ tiền mua thiết bị trợ thị lên đến 5 triệu đồng mỗi 3 năm.`,
    source: 'Báo Lao Động',
    time: '12 giờ trước',
  },
]

const CATEGORIES = ['Tất cả', 'Xã hội', 'Y tế', 'Giáo dục', 'Công nghệ', 'Thể thao', 'Kinh tế']

export default function NewsSection({ addToast }) {
  const [selectedCat, setSelectedCat] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [readingId, setReadingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const tts = useTTS()

  const filtered = SAMPLE_NEWS.filter(item => {
    const matchCat = selectedCat === 'Tất cả' || item.category === selectedCat
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const handleReadArticle = (article) => {
    tts.stop()
    const toRead = `${article.title}. Nguồn: ${article.source}. ${article.time}. Nội dung: ${article.content}`
    tts.speak(toRead)
    setReadingId(article.id)
    addToast(`Đang đọc: ${article.title.substring(0, 40)}...`, 'info')
  }

  const handleExpandArticle = (article) => {
    setExpandedId(expandedId === article.id ? null : article.id)
  }

  const handleStopReading = () => {
    tts.stop()
    setReadingId(null)
  }

  useEffect(() => {
    if (!tts.isSpeaking) setReadingId(null)
  }, [tts.isSpeaking])

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge purple">
          <span>📰</span> Tin Tức
        </div>
        <h1 className="section-title">Đọc Tin Tức Hôm Nay</h1>
        <p className="section-desc">
          Tin tức được biên tập dành riêng cho người khiếm thị. Nhấn nút đọc để nghe từng bài.
        </p>
      </div>

      <div className="card card-purple">
        {/* Search */}
        <div className="news-search-bar">
          <input
            id="news-search-input"
            className="news-input"
            type="search"
            placeholder="🔍 Tìm kiếm tin tức..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm tin tức"
          />
          {searchQuery && (
            <button
              className="btn btn-secondary"
              onClick={() => setSearchQuery('')}
              aria-label="Xoá tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="news-categories" role="group" aria-label="Lọc theo chủ đề">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`news-cat-btn ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat)}
              aria-pressed={selectedCat === cat}
              aria-label={`Chủ đề: ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Currently reading bar */}
        {tts.isSpeaking && readingId && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 18px',
            background: 'var(--accent-gold-dim)',
            border: '1px solid rgba(240,180,41,0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16
          }}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-gold)' }} />
            <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
              Đang đọc bài... {tts.progress}%
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleStopReading}
              aria-label="Dừng đọc"
            >
              ⏹ Dừng
            </button>
          </div>
        )}

        {/* News list */}
        <div className="news-list" role="feed" aria-label="Danh sách tin tức">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <div>Không tìm thấy tin tức phù hợp</div>
            </div>
          ) : (
            filtered.map(article => (
              <article
                key={article.id}
                className={`news-item ${readingId === article.id ? 'reading' : ''}`}
                aria-label={`Bài viết: ${article.title}`}
              >
                <div className="news-item-icon" aria-hidden="true">
                  {article.icon}
                </div>
                <div className="news-item-body">
                  <div className="news-item-category">{article.category} · {article.time}</div>
                  <h2 className="news-item-title">{article.title}</h2>
                  <p className="news-item-summary">{article.summary}</p>

                  {/* Expanded content */}
                  {expandedId === article.id && (
                    <div style={{
                      marginTop: 14,
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      lineHeight: '1.8',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-line',
                      borderLeft: '3px solid var(--accent-purple)'
                    }}>
                      {article.content}
                      <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Nguồn: {article.source}
                      </div>
                    </div>
                  )}

                  <div className="news-item-actions">
                    {readingId === article.id ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={handleStopReading}
                        aria-label={`Dừng đọc bài: ${article.title}`}
                      >
                        ⏹ Dừng
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-gold btn-sm"
                        onClick={() => handleReadArticle(article)}
                        aria-label={`Đọc bài: ${article.title}`}
                      >
                        🔊 Đọc Bài
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExpandArticle(article)}
                      aria-label={expandedId === article.id ? 'Thu gọn nội dung' : `Xem toàn bài: ${article.title}`}
                      aria-expanded={expandedId === article.id}
                    >
                      {expandedId === article.id ? '▲ Thu gọn' : '▼ Xem thêm'}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          📰 {filtered.length} bài tin tức · Cập nhật mỗi giờ · Nội dung thân thiện với người khiếm thị
        </div>
      </div>
    </div>
  )
}
