// Custom hook for Speech-to-Text (Web Speech Recognition API)
import { useState, useRef, useCallback, useEffect } from 'react'

export function useSTT() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [status, setStatus] = useState('idle') // idle | listening | processing | error
  const [errorMsg, setErrorMsg] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setStatus('listening')
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
      setStatus('listening')
    }

    recognition.onerror = (event) => {
      setStatus('error')
      setIsListening(false)
      switch (event.error) {
        case 'not-allowed':
          setErrorMsg('Trình duyệt chưa được cấp quyền microphone. Hãy cho phép truy cập microphone.')
          break
        case 'no-speech':
          setErrorMsg('Không phát hiện giọng nói. Hãy thử lại.')
          setStatus('idle')
          setIsListening(false)
          break
        case 'network':
          setErrorMsg('Lỗi kết nối mạng. Vui lòng kiểm tra internet.')
          break
        default:
          setErrorMsg(`Lỗi: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      if (status === 'listening') setStatus('idle')
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return
    setTranscript('')
    setInterimTranscript('')
    setErrorMsg('')
    try {
      recognitionRef.current?.start()
    } catch (e) {
      // already started
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimTranscript('')
    setStatus('idle')
  }, [])

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
