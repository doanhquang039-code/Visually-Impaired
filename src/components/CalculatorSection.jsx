// CalculatorSection.jsx - Máy tính nói
import { useState, useCallback } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function CalculatorSection({ addToast }) {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState('')
  const tts = useTTS()

  const handlePress = useCallback((val) => {
    // Đọc số/phép tính khi bấm
    const speakMap = {
      '+': 'cộng', '-': 'trừ', '*': 'nhân', '/': 'chia', '.': 'chấm',
      'Enter': 'bằng', 'Clear': 'xóa', 'Backspace': 'xóa lùi'
    }
    tts.speak(speakMap[val] || val)
    setExpr(prev => prev + val)
  }, [tts])

  const calculate = useCallback(() => {
    try {
      if (!expr) return
      // Safe eval equivalent for basic math
      const res = new Function(`return ${expr}`)()
      const formatted = Number.isInteger(res) ? res.toString() : res.toFixed(2)
      setResult(formatted)
      tts.speak(`Bằng ${formatted}`)
      addToast(`Kết quả: ${formatted}`, 'success')
    } catch {
      setResult('Lỗi')
      tts.speak('Lỗi phép tính')
      addToast('Phép tính không hợp lệ', 'error')
    }
  }, [expr, tts, addToast])

  const clear = useCallback(() => {
    setExpr('')
    setResult('')
    tts.speak('Đã xóa')
  }, [tts])

  const backspace = useCallback(() => {
    setExpr(prev => prev.slice(0, -1))
    tts.speak('Xóa lùi')
  }, [tts])

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ]

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
          <span>🔢</span> Máy Tính
        </div>
        <h1 className="section-title">Máy Tính Nói</h1>
        <p className="section-desc">Bấm số và phép tính, máy sẽ đọc to. Nhấn dấu bằng để nghe kết quả.</p>
      </div>

      <div className="card" style={{ maxWidth: 400, margin: '0 auto', background: 'var(--bg-secondary)' }}>
        <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 'var(--radius-lg)', marginBottom: 20, textAlign: 'right', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', minHeight: 28, letterSpacing: '0.1em' }}>{expr || '0'}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, minHeight: 48, overflow: 'hidden' }}>{result}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={clear}>C (Xóa)</button>
          <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={backspace}>⌫ (Lùi)</button>
          
          {buttons.map(b => (
            <button
              key={b}
              className={`btn ${['/', '*', '-', '+', '='].includes(b) ? 'btn-primary' : 'btn-outline-gold'}`}
              style={{ fontSize: '1.5rem', padding: '16px 0', fontWeight: 700 }}
              onClick={() => b === '=' ? calculate() : handlePress(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
