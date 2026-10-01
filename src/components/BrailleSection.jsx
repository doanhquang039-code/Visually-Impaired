// Braille Converter - Chuyển văn bản Việt sang Braille
import { useState } from 'react'
import { useTTS } from '../hooks/useTTS'

// Bảng Braille Grade 1 cơ bản (Latin + số)
// Sử dụng Unicode Braille Pattern (⠀-⣿)
const BRAILLE_MAP = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
  'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
  'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
  'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢',
  '6': '⠖', '7': '⠶', '8': '⠦', '9': '⠔', '0': '⠴',
  ' ': '⠀', ',': '⠂', '.': '⠄', '?': '⠦', '!': '⠖',
  ':': '⠒', ';': '⠆', '-': '⠤', '"': '⠐', "'": '⠄',
  // Ký tự Việt phổ biến (loại bỏ dấu → Latin)
  'à': '⠁', 'á': '⠁', 'â': '⠁', 'ã': '⠁', 'ä': '⠁',
  'è': '⠑', 'é': '⠑', 'ê': '⠑',
  'ì': '⠊', 'í': '⠊',
  'ò': '⠕', 'ó': '⠕', 'ô': '⠕', 'õ': '⠕',
  'ù': '⠥', 'ú': '⠥',
  'ý': '⠽',
  'đ': '⠙',
  'ă': '⠁', 'ơ': '⠕', 'ư': '⠥',
}

// Diacritics indicator mapping (simplified)
const TONE_MARKS = {
  '\u0300': '↓', // huyền
  '\u0301': '↑', // sắc
  '\u0303': '~', // ngã
  '\u0309': '?', // hỏi
  '\u0323': '.', // nặng
  // flat = ngang (không dấu)
}

function textToBraille(text) {
  const lower = text.toLowerCase()
  return lower.split('').map(ch => BRAILLE_MAP[ch] || (ch === '\n' ? '\n' : '⠿')).join('')
}

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

// Các bảng Braille phổ biến
const BRAILLE_ALPHABET_DISPLAY = [
  { char: 'A', braille: '⠁' }, { char: 'B', braille: '⠃' }, { char: 'C', braille: '⠉' },
  { char: 'D', braille: '⠙' }, { char: 'E', braille: '⠑' }, { char: 'F', braille: '⠋' },
  { char: 'G', braille: '⠛' }, { char: 'H', braille: '⠓' }, { char: 'I', braille: '⠊' },
  { char: 'J', braille: '⠚' }, { char: 'K', braille: '⠅' }, { char: 'L', braille: '⠇' },
  { char: 'M', braille: '⠍' }, { char: 'N', braille: '⠝' }, { char: 'O', braille: '⠕' },
  { char: 'P', braille: '⠏' }, { char: 'Q', braille: '⠟' }, { char: 'R', braille: '⠗' },
  { char: 'S', braille: '⠎' }, { char: 'T', braille: '⠞' }, { char: 'U', braille: '⠥' },
  { char: 'V', braille: '⠧' }, { char: 'W', braille: '⠺' }, { char: 'X', braille: '⠭' },
  { char: 'Y', braille: '⠽' }, { char: 'Z', braille: '⠵' },
]

export default function BrailleSection({ addToast }) {
  const [inputText, setInputText] = useState('')
  const [brailleOutput, setBrailleOutput] = useState('')
  const [latinized, setLatinized] = useState('')
  const [showAlphabet, setShowAlphabet] = useState(false)
  const tts = useTTS()

  const handleConvert = () => {
    if (!inputText.trim()) { addToast('Vui lòng nhập văn bản để chuyển đổi', 'error'); return }
    const latin = removeDiacritics(inputText)
    const braille = textToBraille(latin)
    setLatinized(latin)
    setBrailleOutput(braille)
    addToast('Đã chuyển đổi sang Braille!', 'success')
  }

  const handleCopy = async () => {
    if (!brailleOutput) return
    try {
      await navigator.clipboard.writeText(brailleOutput)
      addToast('Đã sao chép ký hiệu Braille!', 'success')
    } catch {
      addToast('Không thể sao chép.', 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setBrailleOutput('')
    setLatinized('')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: 'rgba(240,180,41,0.12)', color: '#ffd666', border: '1px solid rgba(240,180,41,0.3)' }}>
          <span>📖</span> Braille
        </div>
        <h1 className="section-title">Chuyển Đổi Chữ Braille</h1>
        <p className="section-desc">
          Nhập văn bản tiếng Việt để chuyển sang ký hiệu chữ nổi Braille. Hỗ trợ in ấn và học tập.
        </p>
      </div>

      <div className="card card-gold">
        {/* Input */}
        <div className="textarea-wrapper" style={{ marginBottom: 16 }}>
          <textarea
            className="tts-textarea"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Nhập văn bản tiếng Việt để chuyển sang Braille..."
            aria-label="Văn bản cần chuyển đổi sang Braille"
            rows={5}
          />
          <span className="char-count">{inputText.length} ký tự</span>
        </div>

        {/* Sample words */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {['Xin chào', 'Cảm ơn', 'Việt Nam', 'Tôi yêu bạn', 'Hôm nay'].map(s => (
            <button
              key={s}
              className="btn btn-secondary btn-sm"
              onClick={() => setInputText(s)}
              aria-label={`Thử với văn bản: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={handleConvert} disabled={!inputText.trim()} aria-label="Chuyển đổi sang Braille">
            📖 Chuyển Sang Braille
          </button>
          {inputText && (
            <button className="btn btn-outline-gold" onClick={() => tts.speak(inputText)} aria-label="Đọc to văn bản gốc">
              🔊 Đọc Nguyên Bản
            </button>
          )}
          {inputText && (
            <button className="btn btn-secondary" onClick={handleClear} aria-label="Xoá tất cả">
              🗑 Xoá
            </button>
          )}
        </div>

        {/* Output */}
        {brailleOutput && (
          <div>
            {/* Latin version */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Văn bản Latin hóa (bỏ dấu)
              </div>
              <div style={{
                padding: '14px 18px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
              }}>
                {latinized}
              </div>
            </div>

            {/* Braille output */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Ký hiệu Braille ⠀⠁⠃⠉
              </div>
              <div style={{
                padding: '20px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--accent-gold-dim)',
                fontSize: '2rem',
                lineHeight: 2,
                letterSpacing: '0.15em',
                wordBreak: 'break-all',
                fontFamily: 'serif',
                color: 'var(--accent-gold-light)',
              }}
                role="region"
                aria-label="Kết quả chuyển đổi Braille"
              >
                {brailleOutput}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn btn-outline-gold btn-sm" onClick={handleCopy} aria-label="Sao chép Braille">
                  📋 Sao Chép Braille
                </button>
              </div>
            </div>

            {/* Side by side comparison */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                So sánh từng ký tự
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {latinized.split('').map((ch, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    minWidth: 40,
                  }}>
                    <span style={{ fontSize: '1.3rem', color: 'var(--accent-gold-light)' }}>
                      {BRAILLE_MAP[ch] || '⠿'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>
                      {ch === ' ' ? '·' : ch}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Braille alphabet reference */}
      <div className="card" style={{ marginTop: 16 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAlphabet(!showAlphabet)}
          style={{ width: '100%', justifyContent: 'space-between' }}
          aria-expanded={showAlphabet}
        >
          <span>📚 Bảng Chữ Cái Braille</span>
          <span>{showAlphabet ? '▲' : '▼'}</span>
        </button>

        {showAlphabet && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8 }}>
              {BRAILLE_ALPHABET_DISPLAY.map(({ char, braille }) => (
                <div
                  key={char}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '12px 8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => tts.speak(`Chữ ${char}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Braille chữ ${char}: ${braille}`}
                  onKeyDown={e => e.key === 'Enter' && tts.speak(`Chữ ${char}`)}
                >
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-gold-light)' }}>{braille}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 6 }}>{char}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--accent-gold-dim)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--accent-gold-light)' }}>
              💡 Nhấn vào từng ký tự để nghe tên chữ. Braille tiếng Việt đầy đủ cần bộ ký hiệu chuyên biệt theo tiêu chuẩn VBRA.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
