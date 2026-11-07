import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { get, set } from 'idb-keyval'
import './App.css'

function App() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef(null)

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
        content: '¡Hola! 🤖 Soy tu Asistente Virtual IA. Tengo memoria guardada en base de datos local y soporte de voz/código. ¿En qué te ayudo?'
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

  // Reconocimiento de voz (Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => setInput(event.results[0][0].transcript)
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  // Envío de mensajes y actualización de la BD
  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    const updatedMessages = [...messages, { role: 'user', content: userText }]

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // Actualizar título en el historial si es la primera pregunta
    let currentTitle = sessions.find(s => s.id === currentSessionId)?.title || 'Chat'
    if (currentTitle === 'Nuevo Chat') {
      currentTitle = userText.length > 25 ? userText.slice(0, 25) + '...' : userText
    }

    try {
      // 🔑 Tu API Key de OpenRouter (empieza con sk-or-v1-...)
      const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

      const apiMessages = [
        {
          role: "system",
          content: "Eres un asistente de IA útil, experto en programación y múltiples áreas. Formatea el código claramente en bloques de código."
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
          "X-Title": "Asistente Virtual React",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: apiMessages
        })
      })

      const data = await response.json()
      let finalMessages = updatedMessages

      if (response.ok && data.choices && data.choices.length > 0) {
        const botResponse = data.choices[0].message.content
        finalMessages = [...updatedMessages, { role: 'assistant', content: botResponse }]
      } else {
        const errorMsg = data.error?.message || "Revisa tu API Key de OpenRouter."
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
              <span className="status-online">● En línea (Base de Datos + Voz)</span>
            </div>
          </div>
        </header>

        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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

        <form onSubmit={handleSend} className="input-box">
          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title={isListening ? "Escuchando..." : "Hablar"}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <input
            type="text"
            placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje o pregunta sobre código..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Enviar
          </button>
        </form>
      </main>
    </div>
  )
}

export default App