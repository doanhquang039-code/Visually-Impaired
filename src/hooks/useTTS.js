// Utility hook for Text-to-Speech (Web Speech API)
import { useState, useRef, useCallback, useEffect } from 'react'

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(0.9)
  const [pitch, setPitch] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const utteranceRef = useRef(null)
  const textRef = useRef('')
  const charIndexRef = useRef(0)

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      setVoices(allVoices)
      // Prefer Vietnamese voices
      const viVoice = allVoices.find(v =>
        v.lang.startsWith('vi') || v.name.toLowerCase().includes('viet')
      )
      if (viVoice) setSelectedVoice(viVoice)
      else if (allVoices.length > 0) setSelectedVoice(allVoices[0])
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const speak = useCallback((text) => {
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    textRef.current = text

    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    utterance.lang = 'vi-VN'

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); setProgress(0) }
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); setProgress(100) }
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }
    utterance.onboundary = (e) => {
      if (e.charIndex !== undefined) {
        charIndexRef.current = e.charIndex
        setProgress(Math.round((e.charIndex / text.length) * 100))
      }
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [selectedVoice, rate, pitch, volume])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setProgress(0)
  }, [])

  return {
    speak, pause, resume, stop,
    isSpeaking, isPaused, progress,
    voices, selectedVoice, setSelectedVoice,
    rate, setRate, pitch, setPitch, volume, setVolume
  }
}
