# NEXUS AI // Terminal de Asistencia Multimodal

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenRouter](https://img.shields.io/badge/API-OpenRouter-4D6BFE)](https://openrouter.ai/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_(idb--keyval)-orange)](https://github.com/jakearchibald/idb-keyval)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

> Sistema de interfaz técnica e inferencia neural multimodal con persistencia local en IndexedDB, captura y síntesis de audio en tiempo real, análisis visual de matrices de imagen, modulación de voz natural y arquitectura multimodelo (Gemini 2.5 Flash, GPT-4o Mini, DeepSeek V3).

---

## Índice de Secciones

- [Capacidades del Sistema](#capacidades-del-sistema)
- [Pila Tecnológica](#pila-tecnológica)
- [Arquitectura de Directorios](#arquitectura-de-directorios)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Despliegue](#instalación-y-despliegue)
- [Variables de Entorno](#variables-de-entorno)
- [Comandos de Ejecución](#comandos-de-ejecución)
- [Flujo de Procesamiento](#flujo-de-procesamiento)
- [Compatibilidad de Hardware y Navegadores](#compatibilidad-de-hardware-y-navegadores)
- [Licencia](#licencia)

---

## Capacidades del Sistema

- **Procesamiento y Análisis Visual**: Carga de imágenes en formatos estándar (JPG, PNG, WebP) o pegado directo desde el portapapeles (`Ctrl+V`). Compresión automática por matriz Canvas en cliente antes del envío para optimizar ancho de banda y almacenamiento en IndexedDB.
- **Inferencia Neural Multimodelo**: Selector dinámico de motores neurales optimizados en tiempo real:
  - `google/gemini-2.5-flash`: Inferencia multimodal ultrarrápida para procesamiento combinado de texto y visión.
  - `openai/gpt-4o-mini`: Procesamiento analítico equilibrado de visión y lenguaje natural.
  - `deepseek/deepseek-chat`: Inferencia técnica especializada en algoritmos, estructuras de datos y código fuente.
  - Conmutación automática: Si se adjunta una imagen mientras se utiliza un motor de texto puro, el sistema migra automáticamente la petición a un modelo multimodal para evitar excepciones de API.
- **Transmisión Continua de Audio (Speech-to-Text)**: Entrada por transductor de voz continuo mediante Web Speech API, con visualización de ecualizador en tiempo real sin interrupciones por silencios o pausas intermedias.
- **Modulador de Voz Neuronal Natural (Text-to-Speech)**:
  - Detección dinámica y priorización de voces neuronales de alta fidelidad (`[NATURAL]` de Microsoft Azure en Edge o voces neuronales de Google en Chrome).
  - Selector de voz en la cabecera (`VOZ:`) para alternar entre diferentes moduladores en español disponibles en el equipo.
  - Filtro fonético inteligente que elimina marcas de formato Markdown y resume bloques de código para garantizar una cadencia de lectura humana y fluida.
  - Control de reproducción con estado activo (`DETENER AUDIO`), ondas sonoras y mecanismo de protección contra pausas automáticas en textos extensos.
- **Persistencia en Memoria Local**: Base de datos cliente IndexedDB administrada mediante `idb-keyval`, garantizando la retención íntegra de sesiones, mensajes e imágenes sin necesidad de bases de datos externas.
- **Administrador Multi-Sesión**: Creación, conmutación y eliminación de historiales con asignación automática de identificadores de contexto.
- **Salida Estructurada de Código**: Renderizado de código en bloques de consola de alta legibilidad con soporte completo de Markdown técnico y sintaxis coloreada.
- **Interfaz Cyber-Terminal HUD**: Diseño visual de alta tecnología con paleta de neón cian, cuadrícula de circuito, indicadores LED de estado, línea de comandos con prompt (`>`) y vectorización SVG pura (sin emojis).

---

## Pila Tecnológica

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Núcleo de Interfaz** | React 19 | Biblioteca principal para la arquitectura de componentes reactivos. |
| **Compilador / Servidor** | Vite | Herramienta de compilación ultrarrápida y servidor de desarrollo HMR. |
| **Pasarela de Inferencia** | OpenRouter API | Enrutamiento unificado hacia modelos Gemini, GPT y DeepSeek. |
| **Almacenamiento Local** | IndexedDB (`idb-keyval`) | Persistencia asíncrona de sesiones e imágenes en el navegador. |
| **Captura de Voz (STT)** | Web Speech API | Transcripción de audio a texto continuo en tiempo real. |
| **Síntesis Vocal (TTS)** | Web Speech Synthesis API | Modulación de voz neuronal nativa en español. |
| **Procesador de Formato** | `react-markdown` | Renderizado seguro de respuestas Markdown y bloques de código. |
| **Compresión Visual** | HTML5 Canvas API | Redimensionamiento y optimización de imágenes en el cliente. |
| **Estilos e Iconografía** | CSS3 Grid/Flexbox + SVG | Diseño tecnológico estilo terminal HUD con gráficos vectoriales. |

---

## Arquitectura de Directorios

```text
asistente-feria/
├── public/                 # Recursos públicos y vectores base
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Recursos estáticos del proyecto
│   ├── App.css             # Especificaciones técnicas de estilos Cyber-Terminal HUD
│   ├── App.jsx             # Lógica de inferencia neural, audio, visión y estado
│   ├── index.css           # Capa de estilos base
│   └── main.jsx            # Punto de montaje de la aplicación React
├── .env                    # Variables de entorno locales (ignorado por Git)
├── .env.example            # Plantilla estructurada de variables de entorno
├── .gitignore              # Módulos y registros excluidos de control de versiones
├── eslint.config.js        # Reglas de sintaxis y análisis estático
├── index.html              # Estructura del documento raíz
├── package.json            # Manifiesto de dependencias y scripts
├── README.md               # Documentación técnica completa
└── vite.config.js          # Configuración del compilador Vite
```

---

## Requisitos Previos

- Entorno de ejecución [Node.js](https://nodejs.org/) (versión 18.0 o superior recomendada).
- Gestor de dependencias `npm`, `yarn` o `pnpm`.
- Clave de autenticación de [OpenRouter](https://openrouter.ai/keys).
- Navegador compatible con Web Speech API y voces neuronales (se recomienda **Google Chrome** o **Microsoft Edge**).

---

## Instalación y Despliegue

### 1. Navegar al directorio del proyecto

```bash
cd asistente-feria
```

### 2. Instalar módulos y dependencias

```bash
npm install
```

### 3. Configurar parámetros de entorno

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

La consola indicará la dirección local de acceso (habitualmente `http://localhost:5173`).

---

## Variables de Entorno

| Variable | Requerido | Descripción |
| :--- | :---: | :--- |
| `VITE_OPENROUTER_API_KEY` | Sí | Clave de acceso a la pasarela de OpenRouter (`sk-or-v1-...`). |

---

## Comandos de Ejecución

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila los paquetes optimizados para producción en la carpeta `dist/`. |
| `npm run preview` | Ejecuta un servidor local para previsualizar la compilación de producción. |
| `npm run lint` | Ejecuta el analizador estático de código ESLint. |

---

## Flujo de Procesamiento

```text
  [OPERADOR]
      │
      ├──> Transmisión de Audio ──> Web Speech API ────┐
      ├──> Carga Visual / Paste ─> Canvas Optimizer ───┼──> Estado de Sesión
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
                                                Render Markdown          Síntesis Vocal
                                            (Consola de Código)       (Modulador Natural)
```

---

## Compatibilidad de Hardware y Navegadores

- **Motor de Renderizado e IndexedDB**: Totalmente compatible con todos los navegadores modernos basados en Blink, Gecko y WebKit (Chrome, Edge, Firefox, Brave, Safari, Opera).
- **Transductor de Audio (Voz a Texto)**: Optimizado para navegadores Chromium (**Google Chrome**, **Microsoft Edge**) con permisos de micrófono concedidos.
- **Síntesis Vocal (Texto a Voz Natural)**: Compatible de forma nativa a través de `window.speechSynthesis`. Para obtener la máxima naturalidad y voces neuronales, se recomienda **Microsoft Edge** (voces *Online Natural* de Azure) o **Google Chrome** (voces neuronales de Google Cloud).

---

## Licencia

Distribuido bajo los términos de la Licencia [MIT](LICENSE).
