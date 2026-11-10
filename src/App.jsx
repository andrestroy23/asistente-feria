import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { get, set } from 'idb-keyval'
import './App.css'

// Redimensiona y comprime imágenes para optimizar el almacenamiento en IndexedDB y la API
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
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
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
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const baseInputRef = useRef('')

  // Limpieza al desmontar el componente
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

  // 1. Cargar el historial completo desde la Base de Datos al iniciar
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

  // Auto scroll hacia el último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Guardar en IndexedDB cada vez que cambian los mensajes
  const saveToStorage = async (updatedSessions) => {
    setSessions(updatedSessions)
    await set('ai_chat_sessions', updatedSessions)
  }

  // Crear una nueva sesión de chat
  const createNewChat = () => {
    const newId = Date.now().toString()
    const initialMsg = [
      {
        role: 'assistant',
        content: '¡Hola! 🤖 Soy tu Asistente Virtual IA. Tengo memoria en base de datos local, soporte de voz y análisis visual de fotos 📷. ¿En qué te ayudo?'
      }
    ]
    const newSession = {
      id: newId,
      title: 'Nuevo Chat',
      messages: initialMsg
    }
    const updated = [newSession, ...sessions]
    setCurrentSessionId(newId)
    setMessages(initialMsg)
    saveToStorage(updated)
  }

  // Cambiar entre chats guardados
  const selectSession = (id) => {
    const found = sessions.find((s) => s.id === id)
    if (found) {
      setCurrentSessionId(found.id)
      setMessages(found.messages)
    }
  }

  // Eliminar un chat de la base de datos
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

  // Reconocimiento de voz continuo (Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Google Chrome o Microsoft Edge.")
      return
    }

    // Si ya está escuchando, detener al pulsar de nuevo
    if (isListeningRef.current) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      isListeningRef.current = false
      return
    }

    try {
      // Abortar cualquier instancia previa residual
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'es-ES'
      recognition.continuous = true // Mantiene el micrófono abierto sin cortarse en pausas breves
      recognition.interimResults = true // Muestra la transcripción en tiempo real

      // Conservar el texto previo si ya se había escrito algo
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
        console.warn("Speech recognition error:", event.error)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert("Permiso de micrófono denegado. Por favor, concede acceso al micrófono en los permisos de tu navegador.")
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error === 'audio-capture') {
          alert("No se detectó ningún micrófono conectado en tu equipo.")
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error !== 'no-speech') {
          // Ignorar silencios momentáneos para que no se apague
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
      console.error("Error al iniciar reconocimiento:", err)
      setIsListening(false)
      isListeningRef.current = false
    }
  }

  // Reproducir respuesta por voz (Text-to-Speech)
  const speakText = (text) => {
    if (!window.speechSynthesis) return
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      return
    }
    const cleanText = text.replace(/[`*#_>\[\]]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'es-ES'
    utterance.rate = 1.0
    window.speechSynthesis.speak(utterance)
  }

  // Manejador para adjuntar imagen desde archivo
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP, etc.).')
      return
    }
    try {
      const base64 = await compressImage(file)
      setSelectedImage(base64)
    } catch (err) {
      alert('Error al procesar la imagen seleccionada.')
    } finally {
      e.target.value = ''
    }
  }

  // Manejador para pegar imagen desde el portapapeles (Ctrl+V)
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
            console.error('Error al pegar la imagen:', err)
          }
        }
        break
      }
    }
  }

  // Envío de mensajes y actualización de la BD
  const handleSend = async (e) => {
    e.preventDefault()

    // Si el micrófono seguía encendido, detenerlo limpiamente al enviar
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
      content: userText || (currentImage ? 'Analiza esta imagen con detalle y explica qué contiene.' : ''),
      ...(currentImage ? { image: currentImage } : {})
    }

    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setSelectedImage(null)
    setLoading(true)

    // Actualizar título en el historial si es la primera pregunta
    let currentTitle = sessions.find(s => s.id === currentSessionId)?.title || 'Chat'
    if (currentTitle === 'Nuevo Chat') {
      const titleCandidate = userText || 'Análisis de imagen'
      currentTitle = titleCandidate.length > 25 ? titleCandidate.slice(0, 25) + '...' : titleCandidate
    }

    try {
      // 🔑 Tu API Key de OpenRouter (empieza con sk-or-v1-...)
      const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

      console.log("Valor de la API Key:", API_KEY ? "¡Cargada correctamente!" : "¡ESTÁ VACÍA O INDEFINIDA!");

      const hasImagesInConversation = updatedMessages.some(m => m.image)

      // Si hay imágenes en el chat y el modelo seleccionado no tiene visión, usar Gemini 2.5 Flash
      let modelToUse = selectedModel
      if (hasImagesInConversation && modelToUse === 'deepseek/deepseek-chat') {
        modelToUse = 'google/gemini-2.5-flash'
      }

      const apiMessages = [
        {
          role: "system",
          content: "Eres un asistente de IA útil, experto en análisis visual, programación y resolución de dudas. Si el usuario adjunta una imagen, obsérvala con atención, analiza sus detalles visuales y responde con precisión a sus preguntas. Formatea el código claramente en bloques de código."
        },
        ...updatedMessages.map(msg => {
          if (msg.role === 'user' && msg.image) {
            return {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: msg.content || 'Analiza esta imagen con detalle.'
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
          "X-Title": "Asistente Virtual React",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: apiMessages
        })
      })

      const data = await response.json()
      let finalMessages = updatedMessages

      if (response.ok && data.choices && data.choices.length > 0) {
        const botResponse = data.choices[0].message.content
        finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }]
      } else {
        const errorMsg = data.error?.message || "Revisa tu API Key de OpenRouter o el modelo seleccionado."
        finalMessages = [...updatedMessages, { role: 'assistant', content: `❌ Error de API: ${errorMsg}` }]
      }

      setMessages(finalMessages)

      // Guardar sesión actualizada en IndexedDB
      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: currentTitle, messages: finalMessages }
          : s
      )
      saveToStorage(updatedSessions)

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error de red al consultar la IA.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout-container">
      {/* Panel Lateral (Sidebar con Base de Datos) */}
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={createNewChat}>
          ➕ Nuevo Chat
        </button>
        <div className="history-list">
          <span className="history-label">Historial Guardado</span>
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`history-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => selectSession(s.id)}
            >
              <span className="chat-icon">💬</span>
              <span className="chat-title">{s.title}</span>
              <button className="delete-btn" onClick={(e) => deleteSession(e, s.id)} title="Eliminar chat">
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Árbol Principal del Chat */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-info">
            <span className="avatar">🤖</span>
            <div>
              <h2>Asistente Virtual IA</h2>
              <span className="status-online">● En línea (Memoria + Voz + Visión 📷)</span>
            </div>
          </div>
          <div className="model-selector-container">
            <label htmlFor="model-select">Modelo:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <option value="google/gemini-2.5-flash">⚡ Gemini 2.5 Flash (Visión + Texto)</option>
              <option value="openai/gpt-4o-mini">🤖 GPT-4o Mini (Visión + Texto)</option>
              <option value="deepseek/deepseek-chat">🧠 DeepSeek Chat (Texto / Código)</option>
            </select>
          </div>
        </header>

        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.image && (
                  <div className="bubble-image-container">
                    <img src={msg.image} alt="Adjunto" className="bubble-image" />
                  </div>
                )}
                {msg.content && <ReactMarkdown>{msg.content}</ReactMarkdown>}
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className="speak-btn"
                    onClick={() => speakText(msg.content)}
                    title="Escuchar respuesta con voz"
                  >
                    🔊 Escuchar
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble loading-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Previsualización de imagen adjunta antes de enviar */}
        {selectedImage && (
          <div className="image-preview-bar">
            <div className="image-preview-card">
              <img src={selectedImage} alt="Previsualización" className="image-preview-img" />
              <button
                type="button"
                className="image-preview-close"
                onClick={() => setSelectedImage(null)}
                title="Quitar imagen"
              >
                ✕
              </button>
            </div>
            <span className="image-preview-hint">📷 Imagen lista para analizar con IA</span>
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
            title="Subir o adjuntar foto (o pega con Ctrl+V)"
            disabled={loading}
          >
            📷
          </button>
          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title={isListening ? "Detener micrófono" : "Hablar por micrófono"}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <input
            type="text"
            placeholder={
              isListening
                ? "🎙️ Escuchando... habla ahora..."
                : selectedImage
                ? "Escribe una pregunta sobre la foto o pulsa Enviar..."
                : "Escribe tu mensaje, pregunta o pega una imagen (Ctrl+V)..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || (!input.trim() && !selectedImage)}>
            Enviar
          </button>
        </form>
      </main>
    </div>
  )
}

export default App