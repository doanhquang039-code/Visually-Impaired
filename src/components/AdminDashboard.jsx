// Admin Dashboard - MatViet Analytics
import { useState, useMemo } from 'react'
import { getAnalyticsData, recordEvent } from '../hooks/useAnalytics'

// ─── Helpers ────────────────────────────────────────────────────────────────
function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayLabel(ts) {
  return new Date(ts).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

function monthLabel(ts) {
  return new Date(ts).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
}

const FEATURE_META = {
  tts:       { label: 'Đọc Văn Bản', icon: '🔊', color: '#f0b429' },
  ocr:       { label: 'Đọc Ảnh',     icon: '📷', color: '#4e9af1' },
  stt:       { label: 'Giọng Nói',   icon: '🎙️', color: '#34d399' },
  news:      { label: 'Tin Tức',     icon: '📰', color: '#a78bfa' },
  clock:     { label: 'Đồng Hồ',    icon: '⏰', color: '#fb923c' },
  color:     { label: 'Màu Sắc',    icon: '🎨', color: '#f472b6' },
  braille:   { label: 'Braille',    icon: '📖', color: '#facc15' },
  calc:      { label: 'Máy Tính',   icon: '🔢', color: '#818cf8' },
  qr:        { label: 'Quét QR',    icon: '📱', color: '#22c55e' },
  notes:     { label: 'Ghi Chú',    icon: '🎤', color: '#fbbf24' },
  emergency: { label: 'Khẩn Cấp',   icon: '🆘', color: '#ef4444' },
  weather:   { label: 'Thời Tiết',  icon: '🌤️', color: '#0ea5e9' },
  convert:   { label: 'Đo Lường',   icon: '📏', color: '#d946ef' },
  dict:      { label: 'Từ Điển',    icon: '🔤', color: '#6366f1' },
  location:  { label: 'Định Vị',    icon: '📍', color: '#ec4899' },
}

// ─── SVG Bar Chart ──────────────────────────────────────────────────────────
function BarChart({ data, color = '#f0b429', height = 120 }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const barW = Math.max(8, Math.floor(560 / data.length) - 4)

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <svg
        width={Math.max(560, data.length * (barW + 4))}
        height={height + 32}
        style={{ display: 'block' }}
        role="img"
        aria-label="Biểu đồ lượt truy cập"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => (
          <line
            key={frac}
            x1={0} y1={height - frac * height}
            x2="100%" y2={height - frac * height}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
        ))}

        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / max) * height)
          const x = i * (barW + 4) + 2
          const y = height - barH

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
                style={{ transition: 'height 0.5s ease, y 0.5s ease' }}
              />
              {/* Hover value */}
              {d.value > 0 && (
                <text
                  x={x + barW / 2} y={y - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.5)"
                >
                  {d.value}
                </text>
              )}
              {/* Label */}
              {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={x + barW / 2} y={height + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.35)"
                  transform={data.length > 20 ? `rotate(-30, ${x + barW / 2}, ${height + 16})` : undefined}
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Donut / Ring chart ─────────────────────────────────────────────────────
function DonutChart({ slices, size = 140 }) {
  const total = slices.reduce((s, c) => s + c.value, 0) || 1
  const r = 48, cx = size / 2, cy = size / 2
  let cum = 0

  const toXY = (pct) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  return (
    <svg width={size} height={size} aria-label="Biểu đồ tính năng">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={22} />
      {slices.map((s, i) => {
        const pct = s.value / total
        const [x1, y1] = toXY(cum)
        cum += pct
        const [x2, y2] = toXY(cum)
        const large = pct > 0.5 ? 1 : 0
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={s.color}
            opacity={0.85}
          />
        )
      })}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={r - 22} fill="#141c30" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#f0b429">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">lượt dùng</text>
    </svg>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, trend }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}30`,
      borderRadius: 'var(--radius-xl)',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, fontSize: '5rem',
        opacity: 0.06, userSelect: 'none', lineHeight: 1,
      }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: '2.2rem', fontWeight: 900, color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>
      )}
      {trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: '0.75rem', color: trend >= 0 ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)}% so với tuần trước</span>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard({ onClose }) {
  const [period, setPeriod] = useState('week') // week | month | all
  const [refreshKey, setRefreshKey] = useState(0)

  const stats = useMemo(() => {
    const events = getAnalyticsData()
    const now = Date.now()
    const DAY = 86400000

    // Time boundaries
    const boundaries = {
      week:  now - 7  * DAY,
      month: now - 30 * DAY,
      all:   0,
    }
    const since = boundaries[period]
    const filtered = events.filter(e => e.ts >= since)

    // Sessions
    const sessions      = filtered.filter(e => e.type === 'session_start')
    const featureEvents = filtered.filter(e => e.type === 'feature_use')

    // Unique days active
    const activeDays = new Set(sessions.map(e => startOfDay(e.ts))).size

    // Feature usage
    const featureCount = {}
    featureEvents.forEach(e => {
      featureCount[e.feature] = (featureCount[e.feature] || 0) + 1
    })

    // Browser breakdown
    const browserCount = {}
    sessions.forEach(e => {
      browserCount[e.ua] = (browserCount[e.ua] || 0) + 1
    })

    // Mobile vs Desktop
    const mobileCount  = sessions.filter(e => e.mobile).length
    const desktopCount = sessions.length - mobileCount

    // Daily chart data (last N days)
    const chartDays = period === 'week' ? 7 : period === 'month' ? 30 : 60
    const dailyData = []
    for (let d = chartDays - 1; d >= 0; d--) {
      const dayTs   = startOfDay(now - d * DAY)
      const dayEnd  = dayTs + DAY
      const count   = events.filter(e => e.type === 'session_start' && e.ts >= dayTs && e.ts < dayEnd).length
      dailyData.push({ label: dayLabel(dayTs), value: count })
    }

    // Weekly trend (compare this week vs last week)
    const thisWeek = events.filter(e => e.type === 'session_start' && e.ts >= now - 7 * DAY).length
    const lastWeek = events.filter(e => e.type === 'session_start' && e.ts >= now - 14 * DAY && e.ts < now - 7 * DAY).length
    const trend = lastWeek === 0 ? 100 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)

    // Monthly data (last 6 months)
    const monthlyData = []
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now)
      d.setDate(1)
      d.setMonth(d.getMonth() - m)
      d.setHours(0, 0, 0, 0)
      const mStart = d.getTime()
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
      const count  = events.filter(e => e.type === 'session_start' && e.ts >= mStart && e.ts < mEnd).length
      monthlyData.push({ label: monthLabel(mStart), value: count })
    }

    // Today vs yesterday
    const todayCount     = events.filter(e => e.type === 'session_start' && e.ts >= startOfDay(now)).length
    const yesterdayCount = events.filter(e => {
      const d = startOfDay(now)
      return e.type === 'session_start' && e.ts >= d - DAY && e.ts < d
    }).length

    return {
      totalSessions: sessions.length,
      totalFeatureUse: featureEvents.length,
      activeDays,
      featureCount,
      browserCount,
      mobileCount,
      desktopCount,
      dailyData,
      monthlyData,
      trend,
      todayCount,
      yesterdayCount,
    }
  }, [period, refreshKey])

  const topFeature = Object.entries(stats.featureCount).sort((a, b) => b[1] - a[1])[0]

  const donutSlices = Object.entries(stats.featureCount)
    .map(([k, v]) => ({ label: k, value: v, color: FEATURE_META[k]?.color || '#888' }))
    .sort((a, b) => b.value - a.value)

  const chartData = period === 'month' ? stats.dailyData : stats.dailyData

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'var(--bg-primary)',
      overflowY: 'auto',
      fontFamily: 'var(--font-main)',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #f0b429, #e0a020)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>📊</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Admin Dashboard</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MatViet Analytics</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Period selector */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 999, padding: 4, border: '1px solid var(--border-default)' }}>
              {[{ v: 'week', l: '7 ngày' }, { v: 'month', l: '30 ngày' }, { v: 'all', l: 'Tất cả' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setPeriod(v)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: period === v ? 'linear-gradient(135deg,#f0b429,#e0a020)' : 'transparent',
                    color: period === v ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-main)',
                    transition: 'all 0.2s',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setRefreshKey(k => k + 1)}
              style={{ width: 36, height: 36, border: '1px solid var(--border-default)', background: 'var(--bg-card)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem' }}
              title="Làm mới dữ liệu"
            >
              🔄
            </button>

            <button
              onClick={onClose}
              style={{ width: 36, height: 36, border: '1px solid var(--border-default)', background: 'var(--bg-card)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 700 }}
              aria-label="Đóng dashboard"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard icon="👥" label="Lượt truy cập" value={stats.totalSessions} sub={`Hôm nay: ${stats.todayCount} · Hôm qua: ${stats.yesterdayCount}`} color="#f0b429" trend={stats.trend} />
          <StatCard icon="⚡" label="Lượt dùng tính năng" value={stats.totalFeatureUse} sub="Tổng số lần dùng tính năng" color="#4e9af1" />
          <StatCard icon="📅" label="Ngày hoạt động" value={stats.activeDays} sub={`Trong ${period === 'week' ? '7' : period === 'month' ? '30' : 'tất cả'} ngày qua`} color="#34d399" />
          <StatCard icon="📱" label="Mobile" value={`${stats.totalSessions > 0 ? Math.round(stats.mobileCount / stats.totalSessions * 100) : 0}%`} sub={`${stats.mobileCount} mobile · ${stats.desktopCount} desktop`} color="#a78bfa" />
          {topFeature && (
            <StatCard
              icon={FEATURE_META[topFeature[0]]?.icon || '⭐'}
              label="Tính năng hot nhất"
              value={FEATURE_META[topFeature[0]]?.label || topFeature[0]}
              sub={`${topFeature[1].toLocaleString('vi-VN')} lượt dùng`}
              color={FEATURE_META[topFeature[0]]?.color || '#f0b429'}
            />
          )}
          <StatCard icon="🔥" label="Trung bình/ngày" value={stats.activeDays > 0 ? Math.round(stats.totalSessions / Math.max(stats.activeDays, 1)) : 0} sub="Lượt truy cập mỗi ngày hoạt động" color="#fb923c" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
          {/* Daily bar chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '22px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>📈 Lượt Truy Cập Theo Ngày</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  {period === 'week' ? '7 ngày gần nhất' : period === 'month' ? '30 ngày gần nhất' : '60 ngày gần nhất'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f0b429' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sessions</span>
              </div>
            </div>
            <BarChart data={chartData} color="#f0b429" />
          </div>

          {/* Monthly chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '22px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>📊 Lượt Truy Cập Theo Tháng</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>6 tháng gần nhất</div>
              </div>
            </div>
            <BarChart data={stats.monthlyData} color="#4e9af1" height={100} />
          </div>
        </div>

        {/* Feature + Browser row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
          {/* Feature breakdown */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '22px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 20 }}>🎯 Tính Năng Được Dùng Nhiều Nhất</div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <DonutChart slices={donutSlices} />

              <div style={{ flex: 1, minWidth: 160 }}>
                {Object.entries(stats.featureCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([feat, count]) => {
                    const total = Object.values(stats.featureCount).reduce((a, b) => a + b, 0) || 1
                    const pct = Math.round(count / total * 100)
                    const meta = FEATURE_META[feat] || { label: feat, icon: '?', color: '#888' }
                    return (
                      <div key={feat} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <span>{meta.icon}</span>
                            <span style={{ fontWeight: 600 }}>{meta.label}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {count.toLocaleString('vi-VN')} ({pct}%)
                          </div>
                        </div>
                        <div style={{ height: 5, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                {Object.keys(stats.featureCount).length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          {/* Browser & Device */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Browser */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '20px', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>🌐 Trình Duyệt</div>
              {Object.entries(stats.browserCount)
                .sort((a, b) => b[1] - a[1])
                .map(([browser, count]) => {
                  const total = Object.values(stats.browserCount).reduce((a, b) => a + b, 0) || 1
                  const pct = Math.round(count / total * 100)
                  const icons = { Chrome: '🟡', Edge: '🔵', Firefox: '🟠', Safari: '⚪', Other: '⚫' }
                  return (
                    <div key={browser} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: '1rem' }}>{icons[browser] || '⚫'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{browser}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border-default)', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#4e9af1', borderRadius: 99, transition: 'width 0.8s' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Device */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>💻 Thiết Bị</div>
              {[
                { label: 'Desktop', icon: '🖥️', count: stats.desktopCount, color: '#f0b429' },
                { label: 'Mobile', icon: '📱', count: stats.mobileCount, color: '#4e9af1' },
              ].map(({ label, icon, count, color }) => {
                const total = stats.totalSessions || 1
                const pct = Math.round(count / total * 100)
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-default)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent activity log */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>🕐 Hoạt Động Gần Đây</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {getAnalyticsData()
              .slice(-20)
              .reverse()
              .map((e, i) => {
                const meta = e.feature ? FEATURE_META[e.feature] : null
                const time = new Date(e.ts).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {e.type === 'session_start' ? '🔗' : meta?.icon || '⚡'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
                      {e.type === 'session_start'
                        ? `Phiên mới (${e.ua} · ${e.mobile ? 'Mobile' : 'Desktop'})`
                        : `Dùng: ${meta?.label || e.feature}`
                      }
                    </span>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 20, padding: '12px 18px', background: 'var(--accent-gold-dim)', border: '1px solid rgba(240,180,41,0.15)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--accent-gold-light)', textAlign: 'center' }}>
          📊 Dữ liệu được lưu cục bộ trong trình duyệt (localStorage). Không thu thập dữ liệu cá nhân. Chỉ admin biết lối vào dashboard này.
        </div>
      </div>
    </div>
  )
}
