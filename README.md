# NEXUS AI // Terminal de Asistencia Multimodal

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenRouter](https://img.shields.io/badge/API-OpenRouter-4D6BFE)](https://openrouter.ai/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_(idb--keyval)-orange)](https://github.com/jakearchibald/idb-keyval)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

> Sistema de interfaz técnica e inferencia neural multimodal con persistencia local en IndexedDB, captura y síntesis de audio en tiempo real, análisis visual de matrices de imagen y arquitectura de modelos intercambiables (Gemini 2.5 Flash, GPT-4o Mini, DeepSeek V3).

---

## Indice de Secciones

- [Capacidades del Sistema](#capacidades-del-sistema)
- [Pila Tecnologica](#pila-tecnologica)
- [Arquitectura de Directorios](#arquitectura-de-directorios)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Despliegue](#instalacion-y-despliegue)
- [Variables de Entorno](#variables-de-entorno)
- [Comandos de Ejecucion](#comandos-de-ejecucion)
- [Flujo de Procesamiento](#flujo-de-procesamiento)
- [Compatibilidad de Hardware y Navegadores](#compatibilidad-de-hardware-y-navegadores)
- [Licencia](#licencia)

---

## Capacidades del Sistema

- **Procesamiento y Analisis Visual**: Carga de imágenes en formatos estándar o pegado directo desde el portapapeles (`Ctrl+V`). Compresión por matriz Canvas en cliente antes del envío e inferencia con modelos multimodales.
- **Inferencia Neural Multimodelo**: Selector dinámico de motores neurales optimizados:
  - `google/gemini-2.5-flash`: Inferencia multimodal ultrarrápida para texto y visión.
  - `openai/gpt-4o-mini`: Procesamiento equilibrado de texto y capacidades visuales.
  - `deepseek/deepseek-chat`: Inferencia técnica especializada en algoritmos y código.
- **Transmision Continua de Audio**: Entrada por transductor de voz (Speech-to-Text) continuo mediante Web Speech API, con visualización de ecualizador en tiempo real sin interrupciones por pausas breves.
- **Sintesis Vocal**: Conversión de texto a habla (Text-to-Speech) nativa en español para reproducir las respuestas generadas por el sistema.
- **Persistencia en Memoria Local**: Base de datos cliente IndexedDB administrada con `idb-keyval`, garantizando la retención íntegra de historiales y recursos visuales.
- **Administrador de Sesiones**: Creación, conmutación y purga de registros de sesión con generación automática de identificadores de contexto.
- **Salida Estructurada de Codigo**: Formateo de código en bloques de consola de alta legibilidad con soporte completo de Markdown técnico.
- **Interfaz Cyber-Terminal HUD**: Diseño visual de alta tecnología con paleta de neón cian, cuadrícula de circuito, indicadores LED de estado y vectorización SVG pura (sin emojis).

---

## Pila Tecnologica

| Componente | Especificacion |
| :--- | :--- |
| **Nucleo Frontend** | React 19 |
| **Empaquetador / Servidor** | Vite |
| **Pasarela de Inferencia** | OpenRouter API |
| **Almacenamiento Local** | IndexedDB (`idb-keyval`) |
| **Captura de Audio** | Web Speech API (`SpeechRecognition`) |
| **Sintesis Vocal** | Web Speech Synthesis API (`SpeechSynthesis`) |
| **Procesamiento Markdown** | `react-markdown` |
| **Optimizador de Imagenes** | HTML5 Canvas API |
| **Estilos e Iconografia** | CSS3 Grid/Flexbox + SVG vectorial |

---

## Arquitectura de Directorios

```text
asistente-feria/
├── public/                 # Recursos publicos y vectores base
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Graficos y dependencias estaticas
│   ├── App.css             # Especificaciones tecnicas de interfaz y estilos HUD
│   ├── App.jsx             # Logica de procesamiento neural, audio y estado
│   ├── index.css           # Capa de estilos base
│   └── main.jsx            # Punto de montaje de React
├── .env.example            # Plantilla de variables de entorno
├── .gitignore              # Modulos y registros excluidos de Git
├── eslint.config.js        # Reglas de sintaxis y analisis estatico
├── index.html              # Estructura del documento raiz
├── package.json            # Dependencias del proyecto
├── README.md               # Documentacion tecnica en espanol
└── vite.config.js          # Configuracion de compilacion Vite
```

---

## Requisitos Previos

- Entorno de ejecucion Node.js (v18.0 o superior).
- Gestor de dependencias npm, yarn o pnpm.
- Clave de autenticacion de OpenRouter ([openrouter.ai](https://openrouter.ai/keys)).
- Navegador compatible con Web Speech API (Google Chrome o Microsoft Edge recomendado).

---

## Instalacion y Despliegue

### 1. Navegar al directorio del proyecto

```bash
cd asistente-feria
```

### 2. Instalar modulos y dependencias

```bash
npm install
```

### 3. Configurar parametros de entorno

Generar el archivo `.env` a partir de la plantilla:

```bash
# En Windows PowerShell
Copy-Item .env.example .env

# En Linux o macOS
cp .env.example .env
```

Ingresar la clave de API en el archivo `.env`:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-su-clave-aqui
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

---

## Variables de Entorno

| Variable | Requerido | Descripcion |
| :--- | :---: | :--- |
| `VITE_OPENROUTER_API_KEY` | Si | Clave de acceso a la pasarela de OpenRouter (`sk-or-v1-...`). |

---

## Comandos de Ejecucion

| Comando | Proposito |
| :--- | :--- |
| `npm run dev` | Inicia el entorno de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila los paquetes optimizados para distribucion en produccion (`dist/`). |
| `npm run preview` | Ejecuta un servidor local para inspeccionar la compilacion de produccion. |
| `npm run lint` | Ejecuta el validador estatico de codigo ESLint. |

---

## Flujo de Procesamiento

```text
  [OPERADOR]
      │
      ├──> Transmision de Audio ──> Web Speech API ────┐
      ├──> Carga Visual / Paste ─> Canvas Optimizer ───┼──> Estado de Sesion
      └──> Entrada de Comando ────────────────────────┘            │
                                                                   ▼
                                                         IndexedDB (idb-keyval)
                                                                   │
                                                                   ▼
                                                       OpenRouter Inferencia API
                                                       [Gemini / GPT / DeepSeek]
                                                                   │
                                                                   ▼
                                                         Respuesta Estructurada
                                                                   │
                                                      ┌────────────┴────────────┐
                                                      ▼                         ▼
                                                Render Markdown          Sintesis Vocal
```

---

## Compatibilidad de Hardware y Navegadores

- **Motor de Renderizado y Persistencia**: Totalmente compatible con navegadores basados en Blink, Gecko y WebKit (Chrome, Edge, Firefox, Brave, Safari, Opera).
- **Transductor de Audio (Voz)**: Optimizada para motores Chromium (Google Chrome, Microsoft Edge) con permisos de microfono autorizados.
- **Sintesis de Voz**: Compatible de forma nativa en todos los navegadores modernos a traves de `window.speechSynthesis`.

---

## Licencia

Distribuido bajo los terminos de la Licencia [MIT](LICENSE).
