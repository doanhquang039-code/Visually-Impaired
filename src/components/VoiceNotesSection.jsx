// VoiceNotesSection.jsx - Ghi chú bằng giọng nói (lưu text)
import { useState, useEffect } from 'react'
import { useSTT } from '../hooks/useSTT'
import { useTTS } from '../hooks/useTTS'

export default function VoiceNotesSection({ addToast }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('matviet_notes')) || [] } catch { return [] }
  })
  const stt = useSTT()
  const tts = useTTS()

  useEffect(() => {
    localStorage.setItem('matviet_notes', JSON.stringify(notes))
  }, [notes])

  const handleSave = () => {
    const text = (stt.transcript + ' ' + stt.interimTranscript).trim()
    if (!text) { addToast('Không có nội dung để lưu', 'error'); return }
    const newNote = { id: Date.now(), text, date: new Date().toISOString() }
    setNotes(prev => [newNote, ...prev])
    stt.clearTranscript()
    stt.stopListening()
    tts.speak('Đã lưu ghi chú')
    addToast('Đã lưu ghi chú!', 'success')
  }

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    tts.speak('Đã xóa ghi chú')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="section-badge" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
          <span>🎤</span> Ghi Chú
        </div>
        <h1 className="section-title">Sổ Tay Giọng Nói</h1>
        <p className="section-desc">Đọc ghi chú để lưu lại. Tự động lưu vào thiết bị.</p>
      </div>

      <div className="card card-gold" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Thêm Ghi Chú Mới</div>
        
        <div style={{ minHeight: 80, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: 16 }}>
          {stt.isListening ? (
            <>
              <span className="stt-final">{stt.transcript}</span>
              <span className="stt-interim"> {stt.interimTranscript}</span>
              <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', marginTop: 8 }}>🔴 Đang nghe...</div>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{stt.transcript || 'Nhấn micro và bắt đầu nói...'}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className={`btn ${stt.isListening ? 'btn-danger' : 'btn-primary'}`} 
            onClick={stt.isListening ? stt.stopListening : stt.startListening}
          >
            {stt.isListening ? '⏹ Dừng Ghi' : '🎙️ Ghi Âm'}
          </button>
          {(stt.transcript || stt.interimTranscript) && (
            <button className="btn btn-outline-gold" onClick={handleSave}>💾 Lưu Ghi Chú</button>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Danh Sách Ghi Chú ({notes.length})</div>
        {notes.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Chưa có ghi chú nào.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notes.map(note => (
              <div key={note.id} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(note.date).toLocaleString('vi-VN')}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{note.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => tts.speak(note.text)}>🔊 Đọc</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(note.id)}>🗑 Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
