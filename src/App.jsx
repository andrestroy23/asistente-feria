import { useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! 🤖 Bienvenid@ a la Feria. Pregúntame sobre horarios, stands o eventos.' }
  ])
  const [input, setInput] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input
    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setInput('')

    setTimeout(() => {
      let botResponse = `Interesante pregunta sobre "${userText}". ¿Te gustaría saber sobre horarios o ubicaciones de los stands?`
      const text = userText.toLowerCase()

      if (text.includes('horario') || text.includes('hora')) {
        botResponse = '⏰ La feria atiende de 9:00 AM a 6:00 PM.'
      } else if (text.includes('donde') || text.includes('lugar') || text.includes('ubicacion')) {
        botResponse = '📍 Nos encontramos en el Pabellón Principal de Exposición.'
      } else if (text.includes('stand') || text.includes('comida') || text.includes('locales')) {
        botResponse = '🏢 Hay más de 30 stands de tecnología, artesanías y gastronomía.'
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }])
    }, 300)
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
