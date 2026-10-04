// Đồng Hồ Nói Giờ - Speaking Clock (Fixed)
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTTS } from '../hooks/useTTS'

function formatTime(date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function formatDate(date) {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const day = days[date.getDay()]
  return `${day}, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`
}

function speakableTime(date) {
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const period = h < 12 ? 'sáng' : h < 18 ? 'chiều' : 'tối'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  let text = `Bây giờ là ${h12} giờ`
  if (m > 0) text += ` ${m} phút`
  if (s > 0) text += ` ${s} giây`
  text += ` ${period}.`
  return text
}

const INTERVALS = [
  { label: 'Tắt', value: 0 },
  { label: '15 phút', value: 15 },
  { label: '30 phút', value: 30 },
  { label: '1 giờ', value: 60 },
]

export default function ClockSection({ addToast }) {
  const [now, setNow] = useState(new Date())
  const [interval, setIntervalVal] = useState(0) // phút
  const [alarms, setAlarms] = useState([])
  const [newAlarmTime, setNewAlarmTime] = useState('')
  const [newAlarmLabel, setNewAlarmLabel] = useState('')
  const alarmTriggeredRef = useRef(new Set())
  const tts = useTTS()
  // Use ref for tts.speak to avoid re-render loop in useEffect deps
  const ttsRef = useRef(tts)
  useEffect(() => { ttsRef.current = tts })

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-announce clock (use ref to avoid re-render loop)
  useEffect(() => {
    if (interval === 0) return
    const ms = interval * 60 * 1000
    const id = setInterval(() => {
      ttsRef.current.speak(speakableTime(new Date()))
    }, ms)
    return () => clearInterval(id)
  }, [interval]) // DO NOT add tts here - causes infinite loop

  // Alarm checker (check every 10s, use ref for tts)
  useEffect(() => {
    const checker = setInterval(() => {
      const current = new Date()
      const hhmm = `${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')}`
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === hhmm && !alarmTriggeredRef.current.has(`${alarm.id}-${hhmm}`)) {
          alarmTriggeredRef.current.add(`${alarm.id}-${hhmm}`)
          const msg = alarm.label
            ? `Báo thức! ${alarm.label}. Bây giờ là ${alarm.time}.`
            : `Báo thức! Đã đến ${alarm.time} rồi.`
          ttsRef.current.speak(msg)
          addToast(`⏰ Báo thức: ${alarm.label || alarm.time}`, 'info')
        }
      })
    }, 10000)
    return () => clearInterval(checker)
  }, [alarms, addToast]) // tts via ref - safe

  const speakNow = useCallback(() => {
    ttsRef.current.speak(speakableTime(now) + ' ' + formatDate(now) + '.')
  }, [now])

  const addAlarm = () => {
    if (!newAlarmTime) { addToast('Vui lòng chọn giờ báo thức', 'error'); return }
    const alarm = { id: Date.now(), time: newAlarmTime, label: newAlarmLabel, enabled: true }
    setAlarms(prev => [...prev, alarm])
    setNewAlarmTime('')
    setNewAlarmLabel('')
    addToast(`Đã đặt báo thức lúc ${newAlarmTime}`, 'success')
    ttsRef.current.speak(`Đã đặt báo thức lúc ${newAlarmTime}`)
  }

  const toggleAlarm = (id) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const deleteAlarm = (id) => {
    setAlarms(prev => prev.filter(a => a.id !== id))
    addToast('Đã xoá báo thức', 'info')
  }

  // Clock face angles
  const sec = now.getSeconds()
  const min = now.getMinutes()
  const hr = now.getHours() % 12

  const secDeg = sec * 6
  const minDeg = min * 6 + sec * 0.1
  const hrDeg = hr * 30 + min * 0.5

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge green">
          <span>⏰</span> Đồng Hồ
        </div>
        <h1 className="section-title">Đồng Hồ Nói Giờ</h1>
        <p className="section-desc">
          Nhấn nút để nghe giờ hiện tại. Đặt báo thức hoặc tự động thông báo giờ theo lịch.
        </p>
      </div>

      {/* Analog Clock */}
      <div className="card card-green" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* SVG Clock */}
          <div style={{ position: 'relative' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" aria-label={`Đồng hồ hiển thị ${formatTime(now)}`}>
              {/* Background */}
              <circle cx="110" cy="110" r="108" fill="#0f1628" stroke="rgba(240,180,41,0.3)" strokeWidth="2"/>
              <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>

              {/* Hour markers */}
              {Array.from({length: 12}).map((_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180
                const x1 = 110 + 88 * Math.cos(angle)
                const y1 = 110 + 88 * Math.sin(angle)
                const x2 = 110 + 96 * Math.cos(angle)
                const y2 = 110 + 96 * Math.sin(angle)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth={i % 3 === 0 ? 3 : 1.5} strokeLinecap="round"/>
              })}

              {/* Hour numbers */}
              {[12,3,6,9].map((n, i) => {
                const angle = (i * 90 - 90) * Math.PI / 180
                const x = 110 + 75 * Math.cos(angle)
                const y = 110 + 75 * Math.sin(angle)
                return <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="600">{n}</text>
              })}

              {/* Hour hand */}
              <line
                x1="110" y1="110"
                x2={110 + 55 * Math.cos((hrDeg - 90) * Math.PI / 180)}
                y2={110 + 55 * Math.sin((hrDeg - 90) * Math.PI / 180)}
                stroke="#f0b429" strokeWidth="5" strokeLinecap="round"
                style={{ transition: 'all 0.5s ease' }}
              />
              {/* Minute hand */}
              <line
                x1="110" y1="110"
                x2={110 + 75 * Math.cos((minDeg - 90) * Math.PI / 180)}
                y2={110 + 75 * Math.sin((minDeg - 90) * Math.PI / 180)}
                stroke="#4e9af1" strokeWidth="3.5" strokeLinecap="round"
                style={{ transition: 'all 0.5s ease' }}
              />
              {/* Second hand */}
              <line
                x1="110" y1="110"
                x2={110 + 82 * Math.cos((secDeg - 90) * Math.PI / 180)}
                y2={110 + 82 * Math.sin((secDeg - 90) * Math.PI / 180)}
                stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"
              />
              {/* Center dot */}
              <circle cx="110" cy="110" r="5" fill="#f0b429"/>
            </svg>
          </div>

          {/* Digital time */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #f0b429, #4e9af1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatTime(now)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              {formatDate(now)}
            </div>
          </div>

          {/* Speak now button */}
          <button
            id="clock-speak-btn"
            className="btn btn-primary btn-lg"
            onClick={speakNow}
            aria-label="Đọc to giờ và ngày hiện tại"
          >
            🔊 Đọc Giờ Ngay
          </button>
        </div>

        {/* Auto-announce setting */}
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🔔 Tự động thông báo giờ
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {INTERVALS.map(opt => (
              <button
                key={opt.value}
                className={`news-cat-btn ${interval === opt.value ? 'active' : ''}`}
                onClick={() => {
                  setIntervalVal(opt.value)
                  const msg = opt.value === 0 ? 'Đã tắt thông báo tự động.' : `Sẽ thông báo giờ mỗi ${opt.label}.`
                  addToast(msg, 'info')
                  if (opt.value > 0) ttsRef.current.speak(msg)
                }}
                aria-pressed={interval === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {interval > 0 && (
            <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="status-dot listening" />
              Đang tự động thông báo mỗi {INTERVALS.find(i => i.value === interval)?.label}
            </div>
          )}
        </div>
      </div>

      {/* Alarm section */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>⏰ Đặt Báo Thức</div>

        {/* Add alarm */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            type="time"
            value={newAlarmTime}
            onChange={e => setNewAlarmTime(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-main)',
              fontSize: '1rem',
              colorScheme: 'dark',
            }}
            aria-label="Giờ báo thức"
          />
          <input
            type="text"
            value={newAlarmLabel}
            onChange={e => setNewAlarmLabel(e.target.value)}
            placeholder="Ghi chú (ví dụ: Uống thuốc)"
            style={{
              flex: 1,
              minWidth: 160,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-main)',
              fontSize: '0.9rem',
            }}
            aria-label="Ghi chú báo thức"
            onKeyDown={e => e.key === 'Enter' && addAlarm()}
          />
          <button className="btn btn-primary" onClick={addAlarm} aria-label="Thêm báo thức">
            + Thêm
          </button>
        </div>

        {/* Alarm list */}
        {alarms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Chưa có báo thức nào. Thêm báo thức ở trên.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alarms.map(alarm => (
              <div key={alarm.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                background: alarm.enabled ? 'var(--bg-secondary)' : 'transparent',
                border: `1px solid ${alarm.enabled ? 'var(--accent-gold-dim)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                opacity: alarm.enabled ? 1 : 0.5,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: alarm.enabled ? 'var(--accent-gold-light)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {alarm.time}
                  </div>
                  {alarm.label && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {alarm.label}
                    </div>
                  )}
                </div>
                <button
                  className={`btn btn-sm ${alarm.enabled ? 'btn-outline-gold' : 'btn-secondary'}`}
                  onClick={() => toggleAlarm(alarm.id)}
                  aria-label={alarm.enabled ? 'Tắt báo thức' : 'Bật báo thức'}
                  aria-pressed={alarm.enabled}
                >
                  {alarm.enabled ? '🔔 Bật' : '🔕 Tắt'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteAlarm(alarm.id)}
                  aria-label={`Xoá báo thức ${alarm.time}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
