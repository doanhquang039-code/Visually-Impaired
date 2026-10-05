// DictionarySection.jsx - Từ điển tiếng Việt
import { useState } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function DictionarySection({ addToast }) {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const tts = useTTS()

  const handleSearch = async () => {
    if (!word.trim()) return
    setLoading(true)
    setResult(null)
    
    try {
      // Dùng Wikipedia Tiếng Việt API như một bộ từ điển tóm tắt (free)
      const res = await fetch(`https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word.trim().toLowerCase())}`)
      
      if (res.status === 404) {
        tts.speak(`Không tìm thấy định nghĩa cho từ ${word}`)
        setResult({ title: word, extract: 'Không tìm thấy định nghĩa cho từ này. Vui lòng thử từ đồng nghĩa hoặc cách viết khác.' })
        addToast('Không tìm thấy từ này', 'error')
      } else {
        const data = await res.json()
        const text = `${data.title}. ${data.extract}`
        setResult(data)
        tts.speak(text)
        addToast('Đã tìm thấy nghĩa', 'success')
      }
    } catch {
      tts.speak('Lỗi kết nối từ điển')
      addToast('Lỗi tra từ điển', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
          <span>🔤</span> Từ Điển
        </div>
        <h1 className="section-title">Tra Từ Điển Việt</h1>
        <p className="section-desc">Tìm kiếm nghĩa của từ tiếng Việt và đọc to định nghĩa.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={word} 
            onChange={e => setWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập từ cần tra..."
            style={{ flex: 1, minWidth: 200, padding: '16px', fontSize: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'white' }}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ fontSize: '1.1rem', padding: '0 24px' }}>
            {loading ? '⏳ Đang tra...' : '🔍 Tra Từ'}
          </button>
        </div>

        {result && (
          <div style={{ padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12, color: 'var(--accent-gold)' }}>{result.title}</h2>
            <div style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {result.extract}
            </div>
            
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => tts.speak(`${result.title}. ${result.extract}`)}>🔊 Đọc Nghĩa</button>
              {result.content_urls && (
                <a href={result.content_urls.desktop.page} target="_blank" rel="noreferrer" className="btn btn-outline-gold btn-sm">🌐 Xem Wikipedia</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
