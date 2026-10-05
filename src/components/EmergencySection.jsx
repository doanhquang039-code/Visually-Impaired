// EmergencySection.jsx - Liên hệ khẩn cấp
import { useState, useEffect } from 'react'
import { useTTS } from '../hooks/useTTS'

export default function EmergencySection({ addToast }) {
  const tts = useTTS()
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('matviet_contacts')) || [] } catch { return [] }
  })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    localStorage.setItem('matviet_contacts', JSON.stringify(contacts))
  }, [contacts])

  const callNumber = (number, label) => {
    tts.speak(`Đang gọi ${label}`)
    window.location.href = `tel:${number}`
  }

  const addContact = () => {
    if (!name || !phone) {
      addToast('Vui lòng nhập tên và số điện thoại', 'error')
      return
    }
    const newC = { id: Date.now(), name, phone }
    setContacts([...contacts, newC])
    setName('')
    setPhone('')
    tts.speak(`Đã thêm liên hệ ${name}`)
    addToast('Đã thêm liên hệ', 'success')
  }

  const deleteContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id))
    tts.speak('Đã xóa liên hệ')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <span>🆘</span> Khẩn Cấp
        </div>
        <h1 className="section-title">Gọi Khẩn Cấp</h1>
        <p className="section-desc">Danh bạ nhanh để gọi ngay khi cần thiết. Nhấn vào số để gọi.</p>
      </div>

      <div className="card" style={{ borderColor: 'rgba(220,38,38,0.3)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, color: '#ef4444', fontSize: '1.2rem' }}>Số Điện Thoại Quốc Gia</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <button className="btn btn-danger btn-lg" onClick={() => callNumber('113', 'Cảnh sát')}>🚓 113<br/><small style={{fontSize:'0.7em', fontWeight:400}}>Cảnh sát</small></button>
          <button className="btn btn-danger btn-lg" onClick={() => callNumber('114', 'Cứu hỏa')}>🚒 114<br/><small style={{fontSize:'0.7em', fontWeight:400}}>Cứu hỏa</small></button>
          <button className="btn btn-danger btn-lg" onClick={() => callNumber('115', 'Cấp cứu')}>🚑 115<br/><small style={{fontSize:'0.7em', fontWeight:400}}>Cấp cứu</small></button>
          <button className="btn btn-danger btn-lg" onClick={() => callNumber('111', 'Tổng đài bảo vệ trẻ em')}>🛡️ 111<br/><small style={{fontSize:'0.7em', fontWeight:400}}>Bảo vệ TE</small></button>
        </div>
      </div>

      <div className="card card-gold" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Thêm Người Thân</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Tên (VD: Mẹ, Vợ)" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'white' }}
          />
          <input 
            type="tel" 
            placeholder="Số điện thoại" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'white' }}
          />
          <button className="btn btn-primary" onClick={addContact}>➕ Thêm</button>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Danh Bạ Người Thân</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                <button 
                  style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => callNumber(c.phone, c.name)}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>📞 {c.phone}</div>
                </button>
                <button 
                  style={{ width: 48, background: 'var(--accent-red-dim)', border: 'none', borderLeft: '1px solid var(--border-default)', color: 'var(--accent-red)', cursor: 'pointer' }}
                  onClick={() => deleteContact(c.id)}
                  aria-label="Xóa"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
