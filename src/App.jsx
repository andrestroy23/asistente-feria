import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { get, set } from 'idb-keyval'
import './App.css'

// Iconos vectoriales de precisión tecnica (sin uso de emojis)
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

const IconTerminal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
)

const IconCpu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
)

const IconCamera = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
)

const IconMic = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const IconSpeaker = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
)

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

// Optimizador y compresor de matrices de imagen para almacenamiento y transmision
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 1024
        const maxHeight = 1024
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        resolve(compressed)
      }
      img.onerror = () => reject(new Error('Fallo en decodificacion de matriz visual'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Fallo en lectura de archivo binario'))
    reader.readAsDataURL(file)
  })
}

// Limpieza y adaptacion fonetica del texto Markdown para sintesis de voz natural y fluida
const cleanTextForSpeech = (markdownText) => {
  if (!markdownText) return ''
  let text = markdownText

  text = text.replace(/```[\s\S]*?```/g, '. Código detallado en pantalla. ')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')
  text = text.replace(/^>\s+/gm, '')
  text = text.replace(/^[\*\-\+]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')
  text = text.replace(/(\/\/|::)/g, ', ')
  text = text.replace(/[\[\]{}]/g, '')
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

function App() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash')
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const [speakingIdx, setSpeakingIdx] = useState(null)
  const speechIntervalRef = useRef(null)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const baseInputRef = useRef('')

  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return
      const allVoices = window.speechSynthesis.getVoices()
      const spanishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('es'))
      setAvailableVoices(spanishVoices)

      if (spanishVoices.length > 0 && !selectedVoiceName) {
        const naturalVoice =
          spanishVoices.find(v => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online (Natural)')) ||
          spanishVoices.find(v => v.name.toLowerCase().includes('google')) ||
          spanishVoices.find(v => v.name.toLowerCase().includes('microsoft')) ||
          spanishVoices[0]

        if (naturalVoice) {
          setSelectedVoiceName(naturalVoice.name)
        }
      }
    }

    loadVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current)
      }
    }
  }, [selectedVoiceName])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    const loadDB = async () => {
      const savedSessions = await get('ai_chat_sessions')
      if (savedSessions && savedSessions.length > 0) {
        setSessions(savedSessions)
        setCurrentSessionId(savedSessions[0].id)
        setMessages(savedSessions[0].messages)
      } else {
        createNewChat()
      }
    }
    loadDB()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const saveToStorage = async (updatedSessions) => {
    setSessions(updatedSessions)
    await set('ai_chat_sessions', updatedSessions)
  }

  const createNewChat = () => {
    const newId = Date.now().toString()
    const initialMsg = [
      {
        role: 'assistant',
        content: 'SISTEMA INICIALIZADO // Núcleo de asistencia cognitiva activo.\n\nCapacidades del entorno:\nInferencia neural multimodal (texto, código y análisis de imágenes).\nEntrada de audio continua y síntesis de voz en español.\nPersistencia de datos en almacenamiento local (IndexedDB).\n\nIngrese un comando, consulta o cargue un archivo visual para comenzar.'
      }
    ]
    const newSession = {
      id: newId,
      title: 'SESIÓN // ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: initialMsg
    }
    const updated = [newSession, ...sessions]
    setCurrentSessionId(newId)
    setMessages(initialMsg)
    saveToStorage(updated)
  }

  const selectSession = (id) => {
    const found = sessions.find((s) => s.id === id)
    if (found) {
      setCurrentSessionId(found.id)
      setMessages(found.messages)
    }
  }

  const deleteSession = (e, id) => {
    e.stopPropagation()
    const updated = sessions.filter((s) => s.id !== id)
    if (updated.length === 0) {
      createNewChat()
    } else {
      saveToStorage(updated)
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id)
        setMessages(updated[0].messages)
      }
    }
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Navegador incompatible con el transductor de voz. Utilice Google Chrome o Microsoft Edge.")
      return
    }

    if (isListeningRef.current) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      isListeningRef.current = false
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'es-ES'
      recognition.continuous = true
      recognition.interimResults = true

      baseInputRef.current = input ? input.trim() + ' ' : ''

      recognition.onstart = () => {
        setIsListening(true)
        isListeningRef.current = true
      }

      recognition.onresult = (event) => {
        let sessionTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          sessionTranscript += event.results[i][0].transcript
        }
        setInput(baseInputRef.current + sessionTranscript)
      }

      recognition.onerror = (event) => {
        console.warn("Error en transductor de audio:", event.error)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert("Acceso al micrófono denegado en la configuración del navegador.")
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error === 'audio-capture') {
          alert("Dispositivo de entrada de audio no detectado en el hardware.")
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error !== 'no-speech') {
          setIsListening(false)
          isListeningRef.current = false
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        isListeningRef.current = false
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error("Fallo al inicializar transductor:", err)
      setIsListening(false)
      isListeningRef.current = false
    }
  }

  const speakText = (text, idx) => {
    if (!window.speechSynthesis) return

    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current)
      speechIntervalRef.current = null
    }

    if (speakingIdx === idx && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setSpeakingIdx(null)
      return
    }

    window.speechSynthesis.cancel()

    const naturalSpeech = cleanTextForSpeech(text)
    if (!naturalSpeech) return

    const utterance = new SpeechSynthesisUtterance(naturalSpeech)
    utterance.lang = 'es-ES'
    utterance.rate = 0.98
    utterance.pitch = 1.0

    if (selectedVoiceName && availableVoices.length > 0) {
      const voiceObj = availableVoices.find(v => v.name === selectedVoiceName)
      if (voiceObj) {
        utterance.voice = voiceObj
        utterance.lang = voiceObj.lang
      }
    } else if (availableVoices.length > 0) {
      const best = availableVoices.find(v => v.name.includes('Natural') || v.name.includes('Neural')) || availableVoices[0]
      if (best) {
        utterance.voice = best
        utterance.lang = best.lang
      }
    }

    utterance.onstart = () => {
      setSpeakingIdx(idx)
    }

    utterance.onend = () => {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current)
      }
      setSpeakingIdx(null)
    }

    utterance.onerror = () => {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current)
      }
      setSpeakingIdx(null)
    }

    speechIntervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(speechIntervalRef.current)
      } else {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000)

    window.speechSynthesis.speak(utterance)
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Formato no soportado. Cargue un archivo de imagen válido (JPG, PNG, WebP).')
      return
    }
    try {
      const base64 = await compressImage(file)
      setSelectedImage(base64)
    } catch (err) {
      alert('Error en la compresión del archivo visual.')
    } finally {
      e.target.value = ''
    }
  }

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          try {
            const base64 = await compressImage(file)
            setSelectedImage(base64)
          } catch (err) {
            console.error('Error al decodificar imagen del portapapeles:', err)
          }
        }
        break
      }
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()

    if (isListeningRef.current && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      isListeningRef.current = false
    }

    if ((!input.trim() && !selectedImage) || loading) return

    const userText = input.trim()
    const currentImage = selectedImage
    const userMsg = {
      role: 'user',
      content: userText || (currentImage ? 'Realice un análisis técnico estructurado de esta entrada visual.' : ''),
      ...(currentImage ? { image: currentImage } : {})
    }

    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setSelectedImage(null)
    setLoading(true)

    let currentTitle = sessions.find(s => s.id === currentSessionId)?.title || 'SESIÓN'
    if (currentTitle.startsWith('SESIÓN // ')) {
      const titleCandidate = userText || 'ANÁLISIS_VISUAL'
      currentTitle = titleCandidate.length > 25 ? titleCandidate.slice(0, 25).toUpperCase() + '...' : titleCandidate.toUpperCase()
    }

    try {
      const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

      const hasImagesInConversation = updatedMessages.some(m => m.image)
      let modelToUse = selectedModel
      if (hasImagesInConversation && modelToUse === 'deepseek/deepseek-chat') {
        modelToUse = 'google/gemini-2.5-flash'
      }

      const apiMessages = [
        {
          role: "system",
          content: "Eres un sistema de inteligencia artificial avanzado y tecnológico. Responde de forma analítica, estructurada y técnica. No utilices emojis bajo ninguna circunstancia. Cuando proporciones código, formatéalo estrictamente dentro de bloques de código markdown con su respectivo lenguaje."
        },
        ...updatedMessages.map(msg => {
          if (msg.role === 'user' && msg.image) {
            return {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: msg.content || 'Analice y describa técnicamente esta imagen.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: msg.image
                  }
                }
              ]
            }
          }
          return {
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }
        })
      ]

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Terminal IA Multimodal",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: apiMessages,
          max_tokens: 4000 // <--- SE FIJA UN LÍMITE SEGURO PARA EVITAR EL ERROR DE CRÉDITOS Y TOKENS
        })
      })

      const data = await response.json()
      let finalMessages = updatedMessages

      if (response.ok && data.choices && data.choices.length > 0) {
        const botResponse = data.choices[0].message.content
        finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }]
      } else {
        const errorMsg = data.error?.message || "Verifique la clave de acceso de OpenRouter o disponibilidad del motor."
        finalMessages = [...updatedMessages, { role: 'assistant', content: `[FALLO DE RESPUESTA]: ${errorMsg}` }]
      }

      setMessages(finalMessages)

      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: currentTitle, messages: finalMessages }
          : s
      )
      saveToStorage(updatedSessions)

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '[ERROR DE RED]: No se pudo establecer comunicación con el servidor de inferencia.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout-container">
      {/* Panel Lateral Tecnologico */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">NEXUS // CORE</div>
          <div className="brand-sub">SISTEMA MULTIMODAL</div>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>
          <IconPlus />
          <span>NUEVA SESIÓN</span>
        </button>

        <div className="history-list">
          <div className="history-header">
            <span className="history-label">REGISTROS // LOCAL_DB</span>
            <span className="history-count">[{sessions.length}]</span>
          </div>

          {sessions.map((s) => (
            <div
              key={s.id}
              className={`history-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => selectSession(s.id)}
            >
              <span className="chat-icon"><IconTerminal /></span>
              <span className="chat-title">{s.title}</span>
              <button className="delete-btn" onClick={(e) => deleteSession(e, s.id)} title="Eliminar registro">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="hud-metric">MEM: PERSISTENTE</span>
          <span className="hud-metric">ESTADO: LISTO</span>
        </div>
      </aside>

      {/* Area Central de Interfaz */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-info">
            <div className="avatar">
              <IconCpu />
            </div>
            <div>
              <div className="title-row">
                <h2>NEXUS // ASISTENTE IA</h2>
                <span className="version-tag">v4.2-NEURAL</span>
              </div>
              <div className="status-online">
                <span className="pulse-dot"></span>
                <span>SISTEMA ONLINE // AUDIO + VISIÓN + MEMORIA</span>
              </div>
            </div>
          </div>

          <div className="header-controls">
            {availableVoices.length > 0 && (
              <div className="voice-selector-container">
                <label htmlFor="voice-select">VOZ:</label>
                <select
                  id="voice-select"
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="voice-select"
                  title="Modulador de voz neuronal natural"
                >
                  {availableVoices.map((v) => {
                    const cleanName = v.name
                      .replace(/(Microsoft|Google)\s*/i, '')
                      .replace(/Online\s*\(Natural\)\s*-\s*/i, '[NATURAL] ')
                      .slice(0, 32)
                    return (
                      <option key={v.name} value={v.name}>
                        {cleanName}
                      </option>
                    )
                  })}
                </select>
              </div>
            )}

            <div className="model-selector-container">
              <label htmlFor="model-select">MOTOR:</label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                <option value="google/gemini-2.5-flash">GEMINI 2.5 FLASH [MULTIMODAL]</option>
                <option value="openai/gpt-4o-mini">GPT-4O MINI [VISIÓN + TEXTO]</option>
                <option value="deepseek/deepseek-chat">DEEPSEEK V3 [CÓDIGO + NLP]</option>
              </select>
            </div>
          </div>
        </header>

        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                <div className="bubble-meta">
                  <span className="meta-role">
                    {msg.role === 'user' ? 'OPERADOR // ENTRADA' : 'MOTOR_NEURAL // INFERENCIA'}
                  </span>
                </div>

                {msg.image && (
                  <div className="bubble-image-container">
                    <img src={msg.image} alt="Entrada visual" className="bubble-image" />
                    <div className="image-overlay-tag">ESPECTRO // IMAGEN PROCESADA</div>
                  </div>
                )}

                {msg.content && <ReactMarkdown>{msg.content}</ReactMarkdown>}

                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className={`speak-btn ${speakingIdx === idx ? 'speaking' : ''}`}
                    onClick={() => speakText(msg.content, idx)}
                    title={speakingIdx === idx ? "Detener reproducción de audio" : "Sintetizar salida por audio"}
                  >
                    {speakingIdx === idx ? (
                      <>
                        <span className="audio-bars">
                          <span className="bar"></span>
                          <span className="bar"></span>
                          <span className="bar"></span>
                        </span>
                        <span>DETENER AUDIO</span>
                      </>
                    ) : (
                      <>
                        <IconSpeaker />
                        <span>SINTETIZAR AUDIO</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble loading-bubble">
                <div className="bubble-meta">
                  <span className="meta-role">MOTOR_NEURAL // PROCESAMIENTO</span>
                </div>
                <div className="tech-loading-container">
                  <span className="tech-loading-line"></span>
                  <span className="tech-loading-text">CALCULANDO TENSORES DE INFERENCIA...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {selectedImage && (
          <div className="image-preview-bar">
            <div className="image-preview-card">
              <img src={selectedImage} alt="Previsualización" className="image-preview-img" />
              <button
                type="button"
                className="image-preview-close"
                onClick={() => setSelectedImage(null)}
                title="Descartar entrada"
              >
                <IconClose />
              </button>
            </div>
            <div className="preview-meta-info">
              <span className="image-preview-title">BUFFER VISUAL ACTIVADO</span>
              <span className="image-preview-hint">Entrada lista para decodificación espectral y análisis neural</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="input-box" onPaste={handlePaste}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Cargar archivo visual [JPG, PNG, WebP] or presione Ctrl+V"
            disabled={loading}
          >
            <IconCamera />
          </button>

          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title={isListening ? "Detener captura de audio" : "Iniciar captura de voz"}
          >
            {isListening ? (
              <span className="audio-bars">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </span>
            ) : (
              <IconMic />
            )}
          </button>

          <div className="input-field-wrapper">
            <span className="input-prompt-symbol">&gt;</span>
            <input
              type="text"
              placeholder={
                isListening
                  ? "TRANSMISIÓN DE AUDIO ACTIVA... ESCUCHANDO..."
                  : selectedImage
                    ? "Ingrese parámetro de análisis o presione EJECUTAR..."
                    : "Ingrese comando, consulta de código o pegue imagen [Ctrl+V]..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || (!input.trim() && !selectedImage)}
          >
            <IconSend />
            <span>EJECUTAR</span>
          </button>
        </form>
      </main>
    </div>
  )
}

export default App