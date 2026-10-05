// WeatherSection.jsx - Thời tiết nói (Open-Meteo API, không cần key)
import { useState, useCallback } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function WeatherSection({ addToast }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const tts = useTTS()

  const fetchWeather = useCallback(() => {
    setLoading(true)
    setWeather(null)
    
    if (!navigator.geolocation) {
      addToast('Trình duyệt không hỗ trợ GPS', 'error')
      tts.speak('Trình duyệt không hỗ trợ định vị')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        // Open-Meteo free API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        const res = await fetch(url)
        const data = await res.json()
        
        const w = data.current_weather
        const codeMap = {
          0: 'Trời quang đãng', 1: 'Chủ yếu quang đãng', 2: 'Có mây từng phần', 3: 'Nhiều mây',
          45: 'Có sương mù', 48: 'Sương mù dày',
          51: 'Mưa phùn nhẹ', 53: 'Mưa phùn vừa', 55: 'Mưa phùn đặc',
          61: 'Mưa nhỏ', 63: 'Mưa vừa', 65: 'Mưa to',
          71: 'Tuyết rơi nhẹ', 73: 'Tuyết rơi vừa', 75: 'Tuyết rơi dày',
          95: 'Có sấm sét', 96: 'Sấm sét kèm mưa đá'
        }
        const condition = codeMap[w.weathercode] || 'Trời nhiều mây'
        const text = `Thời tiết hiện tại: ${condition}. Nhiệt độ là ${w.temperature} độ C. Tốc độ gió ${w.windspeed} km trên giờ.`
        
        setWeather({ temp: w.temperature, wind: w.windspeed, condition, text })
        tts.speak(text)
        addToast('Đã cập nhật thời tiết', 'success')
      } catch (err) {
        addToast('Lỗi lấy dữ liệu thời tiết', 'error')
        tts.speak('Lỗi khi lấy dữ liệu thời tiết. Vui lòng kiểm tra mạng.')
      } finally {
        setLoading(false)
      }
    }, () => {
      addToast('Vui lòng cấp quyền vị trí (GPS)', 'error')
      tts.speak('Bạn cần cấp quyền vị trí để xem thời tiết')
      setLoading(false)
    })
  }, [tts, addToast])

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>
          <span>🌤️</span> Thời Tiết
        </div>
        <h1 className="section-title">Thời Tiết Hiện Tại</h1>
        <p className="section-desc">Kiểm tra nhiệt độ và thời tiết tại vị trí của bạn qua GPS.</p>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        {weather ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 10 }}>
              {weather.condition.includes('mưa') ? '🌧️' : weather.condition.includes('nắng') || weather.condition.includes('quang') ? '☀️' : '☁️'}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {weather.temp}°C
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: 10, fontWeight: 600 }}>
              {weather.condition}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Gió: {weather.wind} km/h
            </div>
            
            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => tts.speak(weather.text)}>🔊 Đọc Lại</button>
              <button className="btn btn-secondary" onClick={fetchWeather}>🔄 Cập Nhật</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0' }}>
            <div style={{ fontSize: '4rem', opacity: 0.5, marginBottom: 20 }}>🌍</div>
            <button className="btn btn-primary btn-lg" onClick={fetchWeather} disabled={loading}>
              {loading ? '⏳ Đang lấy dữ liệu...' : '📍 Lấy Thời Tiết Vị Trí Của Tôi'}
            </button>
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Yêu cầu cấp quyền GPS (Vị trí)</div>
          </div>
        )}
      </div>
    </div>
  )
}
