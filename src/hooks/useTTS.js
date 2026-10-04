// useTTS.js - Fixed version
// Fixes:
// 1. Chrome bug: TTS stops after ~15s → keepalive workaround
// 2. Accept initial settings from props
// 3. Stable speak() that doesn't recreate on every render
import { useState, useRef, useCallback, useEffect } from 'react'

export function useTTS(initialSettings = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(initialSettings.ttsRate ?? 0.9)
  const [pitch, setPitch] = useState(initialSettings.ttsPitch ?? 1.0)
  const [volume, setVolume] = useState(initialSettings.ttsVolume ?? 1.0)

  // Use refs for values used inside callbacks to avoid stale closures
  const rateRef = useRef(rate)
  const pitchRef = useRef(pitch)
  const volumeRef = useRef(volume)
  const selectedVoiceRef = useRef(null)
  const isSpeakingRef = useRef(false)
  const keepAliveRef = useRef(null)

  // Keep refs in sync
  useEffect(() => { rateRef.current = rate }, [rate])
  useEffect(() => { pitchRef.current = pitch }, [pitch])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { selectedVoiceRef.current = selectedVoice }, [selectedVoice])

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      if (allVoices.length === 0) return
      setVoices(allVoices)
      const viVoice = allVoices.find(v =>
        v.lang.startsWith('vi') || v.name.toLowerCase().includes('viet')
      )
      const preferred = viVoice || allVoices[0]
      setSelectedVoice(preferred)
      selectedVoiceRef.current = preferred
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
      if (keepAliveRef.current) clearInterval(keepAliveRef.current)
    }
  }, [])

  // Chrome TTS keepalive: Chrome pauses TTS after ~15s silence bug
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current)
    keepAliveRef.current = setInterval(() => {
      if (isSpeakingRef.current && !window.speechSynthesis.speaking) {
        window.speechSynthesis.resume()
      }
    }, 10000)
  }, [])

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  const speak = useCallback((text) => {
    if (!text?.trim()) return
    window.speechSynthesis.cancel()

    // Split long text into sentences for better control
    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current
    utterance.rate = rateRef.current
    utterance.pitch = pitchRef.current
    utterance.volume = volumeRef.current
    utterance.lang = 'vi-VN'

    utterance.onstart = () => {
      isSpeakingRef.current = true
      setIsSpeaking(true)
      setIsPaused(false)
      setProgress(0)
      startKeepAlive()
    }

    utterance.onend = () => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      setProgress(100)
      stopKeepAlive()
    }

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return
      isSpeakingRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      stopKeepAlive()
    }

    utterance.onboundary = (e) => {
      if (e.charIndex !== undefined && text.length > 0) {
        setProgress(Math.round((e.charIndex / text.length) * 100))
      }
    }

    window.speechSynthesis.speak(utterance)
  }, [startKeepAlive, stopKeepAlive]) // stable - uses refs for settings

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    isSpeakingRef.current = false
    setIsSpeaking(false)
    setIsPaused(false)
    setProgress(0)
    stopKeepAlive()
  }, [stopKeepAlive])

  return {
    speak, pause, resume, stop,
    isSpeaking, isPaused, progress,
    voices, selectedVoice, setSelectedVoice,
    rate, setRate, pitch, setPitch, volume, setVolume
  }
}
