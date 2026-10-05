// LocationSection.jsx - Định hướng & GPS
import { useState } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function LocationSection({ addToast }) {
  const [loc, setLoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const tts = useTTS()

  const getLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      addToast('Trình duyệt không hỗ trợ GPS', 'error')
      tts.speak('Trình duyệt không hỗ trợ định vị')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      setLoc({ lat: latitude, lng: longitude, acc: Math.round(accuracy) })
      
      try {
        // Reverse geocoding free API (Nominatim by OSM)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'vi-VN' }
        })
        const data = await res.json()
        const address = data.display_name
        
        setLoc(prev => ({ ...prev, address }))
        const msg = `Vị trí hiện tại: ${address}. Độ chính xác ${Math.round(accuracy)} mét.`
        tts.speak(msg)
        addToast('Đã tìm thấy vị trí', 'success')
      } catch {
        const msg = `Tọa độ: Vĩ độ ${latitude.toFixed(4)}, Kinh độ ${longitude.toFixed(4)}`
        tts.speak(msg)
        addToast('Lấy tọa độ thành công', 'info')
      } finally {
        setLoading(false)
      }
    }, () => {
      addToast('Vui lòng cấp quyền vị trí', 'error')
      tts.speak('Bạn cần cấp quyền vị trí')
      setLoading(false)
    }, { enableHighAccuracy: true })
  }

  const openMaps = () => {
    if (!loc) return
    window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank')
    tts.speak('Đang mở bản đồ Google')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#fce7f3', color: '#db2777', border: '1px solid #fbcfe8' }}>
          <span>🗺️</span> Định Hướng
        </div>
        <h1 className="section-title">Vị Trí Hiện Tại</h1>
        <p className="section-desc">Đọc địa chỉ hiện tại của bạn và mở Google Maps để dẫn đường.</p>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        {loc ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>📍</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              {loc.address || 'Không lấy được tên đường'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Tọa độ: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}<br/>
              Độ chính xác: ~{loc.acc} mét
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300, margin: '0 auto' }}>
              <button className="btn btn-primary" onClick={() => tts.speak(`Vị trí: ${loc.address || 'Tọa độ ' + loc.lat + ' ' + loc.lng}`)}>🔊 Đọc Vị Trí</button>
              <button className="btn btn-secondary" onClick={openMaps}>🧭 Mở Google Maps</button>
              <button className="btn btn-outline-gold" onClick={getLocation}>🔄 Làm Mới</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0' }}>
            <div style={{ fontSize: '4rem', opacity: 0.5, marginBottom: 20 }}>🧭</div>
            <button className="btn btn-primary btn-lg" onClick={getLocation} disabled={loading}>
              {loading ? '⏳ Đang định vị...' : '📍 Đọc Vị Trí Của Tôi'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
