// ConverterSection.jsx - Chuyển đổi đơn vị
import { useState } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function ConverterSection({ addToast }) {
  const [val, setVal] = useState('')
  const [type, setType] = useState('temp') // temp, length, weight
  const [result, setResult] = useState(null)
  const tts = useTTS()

  const handleConvert = () => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      addToast('Vui lòng nhập số hợp lệ', 'error')
      tts.speak('Vui lòng nhập số')
      return
    }

    let text = ''
    let resStr = ''

    if (type === 'temp') {
      const c = ((num - 32) * 5/9).toFixed(1)
      const f = (num * 9/5 + 32).toFixed(1)
      resStr = `${num}°C = ${f}°F\n${num}°F = ${c}°C`
      text = `${num} độ C bằng ${f} độ F. Và ${num} độ F bằng ${c} độ C.`
    } else if (type === 'length') {
      const m = (num / 100).toFixed(2)
      const inc = (num / 2.54).toFixed(2)
      resStr = `${num} cm = ${m} mét\n${num} cm = ${inc} inch`
      text = `${num} cen-ti-mét bằng ${m} mét, và bằng ${inc} in-sơ.`
    } else if (type === 'weight') {
      const g = (num * 1000).toFixed(0)
      const lb = (num * 2.20462).toFixed(2)
      resStr = `${num} kg = ${g} gram\n${num} kg = ${lb} pound`
      text = `${num} ki-lô-gam bằng ${g} gram, và bằng ${lb} pao.`
    }

    setResult(resStr)
    tts.speak(text)
    addToast('Đã chuyển đổi', 'success')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#fae8ff', color: '#c026d3', border: '1px solid #f5d0fe' }}>
          <span>📏</span> Đo Lường
        </div>
        <h1 className="section-title">Chuyển Đổi Đơn Vị</h1>
        <p className="section-desc">Chuyển đổi nhanh độ dài, nhiệt độ, khối lượng và đọc kết quả.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <button className={`news-cat-btn ${type === 'temp' ? 'active' : ''}`} onClick={() => setType('temp')}>🌡️ Nhiệt độ</button>
          <button className={`news-cat-btn ${type === 'length' ? 'active' : ''}`} onClick={() => setType('length')}>📏 Chiều dài</button>
          <button className={`news-cat-btn ${type === 'weight' ? 'active' : ''}`} onClick={() => setType('weight')}>⚖️ Khối lượng</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input 
            type="number" 
            value={val} 
            onChange={e => setVal(e.target.value)}
            placeholder="Nhập con số cần đổi..."
            style={{ flex: 1, minWidth: 200, padding: '16px', fontSize: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'white' }}
          />
          <button className="btn btn-primary" onClick={handleConvert} style={{ fontSize: '1.1rem', padding: '0 24px' }}>🔄 Đổi</button>
        </div>

        {result && (
          <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Kết quả:</div>
            <div style={{ fontSize: '1.3rem', whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--accent-gold)' }}>
              {result}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => handleConvert()}>🔊 Đọc Lại</button>
          </div>
        )}
      </div>
    </div>
  )
}
