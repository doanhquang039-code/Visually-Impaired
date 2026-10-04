// useSTT.js - Fixed version
// Fixes:
// 1. Stale closure bug: status in onend was always 'idle' (captured at mount)
// 2. Recognition auto-restarts when stopped unexpectedly (network drops)
// 3. Proper cleanup on unmount
import { useState, useRef, useCallback, useEffect } from 'react'

export function useSTT() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef(null)
  // Use ref to avoid stale closure in callbacks
  const isListeningRef = useRef(false)
  const statusRef = useRef('idle')
  const shouldRestartRef = useRef(false)

  const updateStatus = useCallback((s) => {
    statusRef.current = s
    setStatus(s)
  }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const createRecognition = () => {
      const recognition = new SpeechRecognition()
      recognition.lang = 'vi-VN'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isListeningRef.current = true
        setIsListening(true)
        updateStatus('listening')
        setErrorMsg('')
      }

      recognition.onresult = (event) => {
        let finalText = ''
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalText += result[0].transcript + ' '
          } else {
            interimText += result[0].transcript
          }
        }
        if (finalText) {
          setTranscript(prev => prev + finalText)
          setInterimTranscript('')
        }
        if (interimText) {
          setInterimTranscript(interimText)
        }
      }

      recognition.onerror = (event) => {
        isListeningRef.current = false
        setInterimTranscript('')

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            shouldRestartRef.current = false
            updateStatus('error')
            setIsListening(false)
            setErrorMsg('Trình duyệt chưa được cấp quyền microphone. Hãy cho phép truy cập microphone và thử lại.')
            break
          case 'no-speech':
            // No speech detected - just reset, don't show error
            updateStatus('idle')
            setIsListening(false)
            break
          case 'network':
            updateStatus('error')
            setIsListening(false)
            setErrorMsg('Lỗi kết nối mạng. Vui lòng kiểm tra internet.')
            break
          case 'aborted':
            // User stopped it - normal
            updateStatus('idle')
            setIsListening(false)
            break
          default:
            updateStatus('error')
            setIsListening(false)
            setErrorMsg(`Lỗi nhận dạng: ${event.error}. Thử lại nhé.`)
        }
      }

      recognition.onend = () => {
        isListeningRef.current = false
        setInterimTranscript('')

        // Auto-restart if user didn't explicitly stop
        if (shouldRestartRef.current) {
          try {
            recognition.start()
          } catch {
            shouldRestartRef.current = false
            setIsListening(false)
            updateStatus('idle')
          }
        } else {
          setIsListening(false)
          if (statusRef.current === 'listening') updateStatus('idle')
        }
      }

      return recognition
    }

    recognitionRef.current = createRecognition()

    return () => {
      shouldRestartRef.current = false
      try { recognitionRef.current?.abort() } catch {}
    }
  }, [updateStatus])

  const startListening = useCallback(() => {
    if (!isSupported) return
    if (isListeningRef.current) return // already listening

    setTranscript('')
    setInterimTranscript('')
    setErrorMsg('')
    shouldRestartRef.current = true
    updateStatus('listening')

    try {
      recognitionRef.current?.start()
    } catch (e) {
      console.warn('STT start error:', e)
    }
  }, [isSupported, updateStatus])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    isListeningRef.current = false
    updateStatus('idle')
    setIsListening(false)
    setInterimTranscript('')
    try { recognitionRef.current?.stop() } catch {}
  }, [updateStatus])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening, transcript, interimTranscript,
    status, errorMsg, isSupported,
    startListening, stopListening, clearTranscript
  }
}
