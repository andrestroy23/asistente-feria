import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { get, set } from 'idb-keyval'
import './App.css'

// Iconos vectoriales de precisión tecnica
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

// Compresor de imágenes
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
      img.onerror = () => reject(new Error('Fallo en decodificación de imagen'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Fallo en lectura de archivo'))
    reader.readAsDataURL(file)
  })
}

// Limpieza para síntesis de voz
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
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-chat')
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
          spanishVoices.find(v => v.name.includes('Natural') || v.name.includes('Neural')) || spanishVoices[0]
        if (naturalVoice) setSelectedVoiceName(naturalVoice.name)
      }
    }
    loadVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [selectedVoiceName])

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
        content: 'SISTEMA INICIALIZADO // Núcleo DeepSeek activo.\n\nCapacidades:\n- Procesamiento de texto y código técnico.\n- Generación de imágenes mediante comandos.\n- Síntesis de voz y persistencia local.\n\nIngrese una consulta o escriba "crear imagen de [descripción]" para generar gráficos.'
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
      alert("Navegador incompatible con reconocimiento de voz.")
      return
    }

    if (isListeningRef.current) {
      recognitionRef.current?.stop()
      setIsListening(false)
      isListeningRef.current = false
      return
    }

    try {
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
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInput(baseInputRef.current + transcript)
      }
      recognition.onerror = () => {
        setIsListening(false)
        isListeningRef.current = false
      }
      recognition.onend = () => {
        setIsListening(false)
        isListeningRef.current = false
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      isListeningRef.current = false
    }
  }

  const speakText = (text, idx) => {
    if (!window.speechSynthesis) return
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

    if (selectedVoiceName && availableVoices.length > 0) {
      const voiceObj = availableVoices.find(v => v.name === selectedVoiceName)
      if (voiceObj) utterance.voice = voiceObj
    }

    utterance.onstart = () => setSpeakingIdx(idx)
    utterance.onend = () => setSpeakingIdx(null)
    utterance.onerror = () => setSpeakingIdx(null)

    window.speechSynthesis.speak(utterance)
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const base64 = await compressImage(file)
      setSelectedImage(base64)
    } catch (err) {
      alert('Error al comprimir imagen.')
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
          const base64 = await compressImage(file)
          setSelectedImage(base64)
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
      content: userText || 'Analice esta imagen.',
      ...(currentImage ? { image: currentImage } : {})
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setSelectedImage(null)
    setLoading(true)

    let currentTitle = sessions.find(s => s.id === currentSessionId)?.title || 'SESIÓN'
    if (currentTitle.startsWith('SESIÓN // ')) {
      currentTitle = (userText || 'ANALISIS').slice(0, 25).toUpperCase()
    }

    try {
      const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
      // DETECCIÓN AMPLIADA DE COMANDOS PARA CREAR IMÁGENES
      const textLower = userText.toLowerCase();
      const isImageRequest =
        textLower.includes('crear imagen') ||
        textLower.includes('genera una imagen') ||
        textLower.includes('generar una imagen') ||
        textLower.includes('dibuja') ||
        textLower.includes('crea una imagen') ||
        textLower.includes('haz una imagen');

      if (isImageRequest) {
        // Extraemos lo que quiere que dibuje limpiando el texto del comando
        let promptClean = userText
          .replace(/crear imagen de|genera una imagen de|generar una imagen de|dibuja un|dibuja una|dibuja|crea una imagen de|haz una imagen de/gi, '')
          .trim();

        if (!promptClean) promptClean = userText;

        const encodedPrompt = encodeURIComponent(promptClean);
        const generatedImageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&nologo=true`;

        const botResponse = `Imagen generada correctamente:\n\n![${userText}](${generatedImageUrl})`;
        const finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }];
        setMessages(finalMessages);

        const updatedSessions = sessions.map((s) =>
          s.id === currentSessionId ? { ...s, title: currentTitle, messages: finalMessages } : s
        );
        saveToStorage(updatedSessions);
        setLoading(false);
        return;
      }

      if (isImageRequest) {
        // Usamos Pollinations AI (modelo gratuito directo sin consumo de tokens de API) para generar imágenes estables
        const promptClean = encodeURIComponent(userText.replace(/crear imagen de|genera una imagen de|dibuja/gi, '').trim());
        const generatedImageUrl = `https://pollinations.ai/p/${promptClean}?width=1024&height=1024&nologo=true`;

        const botResponse = `Imagen generada correctamente según el parámetro:\n\n![${userText}](${generatedImageUrl})`;
        const finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }];
        setMessages(finalMessages);

        const updatedSessions = sessions.map((s) =>
          s.id === currentSessionId ? { ...s, title: currentTitle, messages: finalMessages } : s
        );
        saveToStorage(updatedSessions);
        setLoading(false);
        return;
      }

      // PETICIÓN NORMAL CON DEEPSEEK
      const apiMessages = [
        {
          role: "system",
          content: "Eres DeepSeek V3, un sistema de inteligencia artificial avanzado y técnico. Responde de forma analítica, estructurada y clara. No uses emojis."
        },
        ...updatedMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ]

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Terminal IA",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: apiMessages,
          max_tokens: 2000
        })
      })

      const data = await response.json()
      let finalMessages = updatedMessages

      if (response.ok && data.choices && data.choices.length > 0) {
        const botResponse = data.choices[0].message.content
        finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }]
      } else {
        const errorMsg = data.error?.message || "Error en el servidor de inferencia."
        finalMessages = [...updatedMessages, { role: 'assistant', content: `[FALLO]: ${errorMsg}` }]
      }

      setMessages(finalMessages)
      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId ? { ...s, title: currentTitle, messages: finalMessages } : s
      )
      saveToStorage(updatedSessions)

    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '[ERROR DE RED]: No se pudo conectar con la API.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">DEEPSEEK // CORE</div>
          <div className="brand-sub">TERMINAL TÉCNICA</div>
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
              <button className="delete-btn" onClick={(e) => deleteSession(e, s.id)} title="Eliminar">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div className="header-info">
            <div className="avatar"><IconCpu /></div>
            <div>
              <div className="title-row">
                <h2>DEEPSEEK V3 // ASISTENTE</h2>
                <span className="version-tag">v3.0-PRO</span>
              </div>
              <div className="status-online">
                <span className="pulse-dot"></span>
                <span>MOTOR ACTIVO // TEXTO + CÓDIGO + IMÁGENES</span>
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
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name.slice(0, 30)}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="model-selector-container">
              <label htmlFor="model-select">MOTOR:</label>
              <select id="model-select" value={selectedModel} disabled className="model-select">
                <option value="deepseek/deepseek-chat">DEEPSEEK V3 [ACTIVO]</option>
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
                    {msg.role === 'user' ? 'OPERADOR // ENTRADA' : 'DEEPSEEK // RESPUESTA'}
                  </span>
                </div>

                {msg.image && (
                  <div className="bubble-image-container">
                    <img src={msg.image} alt="Entrada visual" className="bubble-image" />
                  </div>
                )}

                {msg.content && <ReactMarkdown>{msg.content}</ReactMarkdown>}

                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className={`speak-btn ${speakingIdx === idx ? 'speaking' : ''}`}
                    onClick={() => speakText(msg.content, idx)}
                  >
                    <IconSpeaker />
                    <span>{speakingIdx === idx ? 'DETENER AUDIO' : 'SINTETIZAR AUDIO'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble loading-bubble">
                <div className="bubble-meta"><span className="meta-role">PROCESANDO...</span></div>
                <div className="tech-loading-container">
                  <span className="tech-loading-line"></span>
                  <span className="tech-loading-text">GENERANDO RESPUESTA O IMAGEN...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {selectedImage && (
          <div className="image-preview-bar">
            <div className="image-preview-card">
              <img src={selectedImage} alt="Preview" className="image-preview-img" />
              <button type="button" className="image-preview-close" onClick={() => setSelectedImage(null)}>
                <IconClose />
              </button>
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
            disabled={loading}
          >
            <IconCamera />
          </button>

          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
          >
            <IconMic />
          </button>

          <div className="input-field-wrapper">
            <span className="input-prompt-symbol">&gt;</span>
            <input
              type="text"
              placeholder="Escribe una consulta, código o 'crear imagen de [descripción]'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading || (!input.trim() && !selectedImage)}>
            <IconSend />
            <span>EJECUTAR</span>
          </button>
        </form>
      </main>
    </div>
  )
}

export default App