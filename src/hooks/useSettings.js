// Hook lưu cài đặt vào localStorage
import { useState, useEffect, useCallback } from 'react'

const DEFAULTS = {
  fontSize: 18,
  ttsRate: 0.9,
  ttsPitch: 1.0,
  ttsVolume: 1.0,
  ttsVoiceName: '',
  theme: 'dark',
  autoReadOCR: true,
  clockInterval: 0, // 0 = tắt, 15/30/60 phút
}

const STORAGE_KEY = 'matviet_settings'

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULTS)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  // Apply font size globally
  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}px`
  }, [settings.fontSize])

  return { settings, updateSetting, resetSettings }
}
