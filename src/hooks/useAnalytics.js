// useAnalytics.js - Track usage data in localStorage
import { useEffect, useCallback } from 'react'

const STORAGE_KEY = 'matviet_analytics'
const MAX_EVENTS = 2000 // Limit storage size

export function getAnalyticsData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAnalyticsData(events) {
  try {
    // Keep only last MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {}
}

export function recordEvent(type, feature = null) {
  const events = getAnalyticsData()
  const event = {
    ts: Date.now(),
    type,           // 'visit' | 'feature_use' | 'session_start'
    feature,        // 'tts' | 'ocr' | 'stt' | 'news' | 'clock' | 'color' | 'braille'
    ua: navigator.userAgent.includes('Chrome') ? 'Chrome'
      : navigator.userAgent.includes('Firefox') ? 'Firefox'
      : navigator.userAgent.includes('Safari') ? 'Safari'
      : navigator.userAgent.includes('Edge') ? 'Edge' : 'Other',
    mobile: /Mobi|Android/i.test(navigator.userAgent),
  }
  events.push(event)
  saveAnalyticsData(events)
}

// Seed realistic demo data for the past 30 days (first time only)
export function seedDemoData() {
  const existing = getAnalyticsData()
  if (existing.length > 10) return // already have data

  const features = ['tts', 'ocr', 'stt', 'news', 'clock', 'color', 'braille']
  const browsers = ['Chrome', 'Edge', 'Firefox', 'Safari']
  const events = []
  const now = Date.now()

  for (let day = 29; day >= 0; day--) {
    // Visits per day: trending upward
    const baseVisits = 20 + (30 - day) * 3 + Math.floor(Math.random() * 15)
    const dayStart = now - day * 86400000

    for (let i = 0; i < baseVisits; i++) {
      const sessionTime = dayStart + Math.floor(Math.random() * 86400000)
      const ua = browsers[Math.floor(Math.random() * browsers.length)]
      const mobile = Math.random() > 0.6

      events.push({ ts: sessionTime, type: 'session_start', feature: null, ua, mobile })

      // Each session uses 1–4 features
      const numFeatures = Math.floor(Math.random() * 4) + 1
      for (let f = 0; f < numFeatures; f++) {
        // TTS and news are most popular
        const weightedFeatures = ['tts', 'tts', 'news', 'news', 'ocr', 'stt', 'clock', 'color', 'braille', 'calc', 'qr', 'notes', 'emergency', 'weather', 'convert', 'dict', 'location']
        const feat = weightedFeatures[Math.floor(Math.random() * weightedFeatures.length)]
        events.push({
          ts: sessionTime + f * 60000,
          type: 'feature_use',
          feature: feat,
          ua,
          mobile,
        })
      }
    }
  }

  saveAnalyticsData(events)
}

export function useAnalytics(activeTab) {
  // Record session start on mount
  useEffect(() => {
    seedDemoData()
    recordEvent('session_start')
  }, [])

  // Record feature usage when tab changes
  useEffect(() => {
    if (activeTab && activeTab !== 'home' && activeTab !== 'settings' && activeTab !== 'admin') {
      recordEvent('feature_use', activeTab)
    }
  }, [activeTab])
}
