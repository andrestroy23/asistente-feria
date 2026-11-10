# 🤖 Asistente Virtual IA - Expoferia

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![DeepSeek](https://img.shields.io/badge/Modelo-DeepSeek_Chat-4D6BFE)](https://openrouter.ai/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_(idb--keyval)-orange)](https://github.com/jakearchibald/idb-keyval)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

> Proyecto interactivo de Asistente Virtual Inteligente con soporte para múltiples sesiones de chat en base de datos local (IndexedDB), reconocimiento de voz (Speech-to-Text), renderizado dinámico de Markdown/código y conexión con el modelo **DeepSeek Chat** mediante la API de **OpenRouter**.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Arquitectura y Funcionamiento](#-arquitectura-y-funcionamiento)
- [Compatibilidad del Navegador](#-compatibilidad-del-navegador)
- [Licencia](#-licencia)

---

## ✨ Características Principales

- 📷 **Análisis Visual de Fotos y Capturas**: Puedes adjuntar imágenes mediante el botón 📷 o pegarlas directamente con `Ctrl+V`. La IA analiza los detalles, resuelve dudas sobre fotos, diagramas, fórmulas o fragmentos de código en capturas de pantalla.
- 🧠 **Modelos Multimodales e IA Avanzada**: Soporte para modelos de texto y visión de alto rendimiento como `google/gemini-2.5-flash`, `openai/gpt-4o-mini` y `deepseek/deepseek-chat` a través de OpenRouter con selector integrado.
- 🎙️ **Reconocimiento de Voz Continuo**: Dictado por voz (Speech-to-Text) en tiempo real con Web Speech API sin cortes abruptos en pausas normales.
- 🔊 **Síntesis de Voz (Text-to-Speech)**: Botón para escuchar las respuestas del asistente narradas con voz en español.
- 💾 **Persistencia Local con IndexedDB**: Los chats, mensajes e imágenes se guardan automáticamente en el navegador usando `idb-keyval`, asegurando que no se pierda el historial tras recargar la página.
- 🗂️ **Gestión Multi-Sesión**:
  - Creación de nuevos chats independientes.
  - Títulos automáticos generados a partir de la primera consulta.
  - Cambio fluido entre conversaciones en la barra lateral.
  - Eliminación individual de historiales.
- 📝 **Soporte Markdown y Bloques de Código**: Renderizado con `react-markdown`, optimizado para mostrar fragmentos de código con sintaxis clara y formato enriquecido.
- 🎨 **Interfaz de Usuario Moderna**:
  - Tema oscuro (*Dark Mode*) con estética profesional.
  - Previsualización interactiva de imágenes antes de enviar.
  - Indicadores visuales de estado y burbujas de carga animadas.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
| :--- | :--- |
| **React 19** | Biblioteca principal para la construcción de interfaces de usuario reactivas. |
| **Vite** | Herramienta de compilación ultrarrápida y entorno de desarrollo frontend. |
| **OpenRouter API** | Pasarela de IA utilizada para invocar el modelo `deepseek/deepseek-chat`. |
| **idb-keyval** | Envoltorio ligero sobre IndexedDB para almacenamiento local asíncrono y persistente. |
| **Web Speech API** | API nativa del navegador para capturar y transcribir voz a texto. |
| **react-markdown** | Componente para procesar y renderizar Markdown en React de forma segura. |
| **CSS3** | Estilos personalizados, animaciones pulsantes y diseño adaptable sin librerías pesadas. |

---

## 📁 Estructura del Proyecto

```text
asistente-feria/
├── public/                 # Archivos estáticos e iconos
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Recursos multimedia y logos
│   ├── App.css             # Estilos globales y componentes del chat
│   ├── App.jsx             # Lógica principal (IA, voz, estado y almacenamiento)
│   ├── index.css           # Estilos base de la aplicación
│   └── main.jsx            # Punto de entrada de la aplicación React
├── .env.example            # Plantilla de variables de entorno
├── .gitignore              # Archivos y carpetas ignorados por Git
├── eslint.config.js        # Configuración de ESLint
├── index.html              # Plantilla HTML raíz
├── package.json            # Dependencias y scripts del proyecto
├── README.md               # Documentación en español
└── vite.config.js          # Configuración de Vite
```

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18.0 o superior recomendada).
- Gestor de paquetes: `npm`, `yarn` o `pnpm`.
- Una clave de API de [OpenRouter](https://openrouter.ai/) (créditos gratuitos o de pago).
- Navegador moderno con soporte para reconocimiento de voz (se recomienda **Google Chrome** o navegadores basados en Chromium).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio y entrar al directorio

```bash
cd asistente-feria
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar la clave de API

Copia el archivo de plantilla `.env.example` y crea tu archivo `.env`:

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Linux / macOS / Bash
cp .env.example .env
```

Abre el archivo `.env` y coloca tu API Key de OpenRouter:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-tu-clave-aqui
```

> ⚠️ **Importante**: Nunca compartas ni subas tu archivo `.env` a repositorios públicos. Ya se encuentra excluido en `.gitignore`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre en tu navegador la dirección indicada en la terminal (usualmente `http://localhost:5173`).

---

## 🔐 Variables de Entorno

| Variable | Requerido | Descripción |
| :--- | :---: | :--- |
| `VITE_OPENROUTER_API_KEY` | **Sí** | Clave de autenticación para consumir la API de OpenRouter. Inicia con `sk-or-v1-...`. |

---

## 📜 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga rápida (HMR). |
| `npm run build` | Compila la aplicación optimizada para producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm run lint` | Ejecuta ESLint para analizar la sintaxis y buenas prácticas del código. |

---

## 🏗️ Arquitectura y Funcionamiento

```
  ┌───────────────────────────────────────────────────────────┐
  │                    Interfaz de Usuario                    │
  │  ┌───────────────────────┐     ┌───────────────────────┐  │
  │  │   Barra Lateral       │     │   Área de Chat        │  │
  │  │   - Nueva Sesión      │     │   - Historial Activo  │  │
  │  │   - Lista de Sesiones │     │   - Entrada por Voz   │  │
  │  │   - Eliminar Sesión   │     │   - Formulario Texto  │  │
  │  └───────────┬───────────┘     └───────────┬───────────┘  │
  └──────────────┼─────────────────────────────┼──────────────┘
                 │                             │
                 ▼                             ▼
       ┌──────────────────┐           ┌──────────────────┐
       │    IndexedDB     │           │    OpenRouter    │
       │   (idb-keyval)   │           │    (DeepSeek)    │
       │  Persistencia    │           │  Respuestas IA   │
       └──────────────────┘           └──────────────────┘
```

1. **Gestión de Estado**: El estado central (`sessions`, `messages`, `currentSessionId`) mantiene sincronizadas las conversaciones tanto en memoria como en `IndexedDB`.
2. **Ciclo de Mensajes**: Cada envío añade temporalmente el mensaje del usuario al hilo, activa el indicador de carga y despacha la solicitud HTTP POST hacia `https://openrouter.ai/api/v1/chat/completions`.
3. **Persistencia Automática**: Tras recibir la respuesta del modelo, la sesión se actualiza y se sincroniza inmediatamente con el almacenamiento local del navegador.

---

## 🌐 Compatibilidad del Navegador

- **Funcionalidad de Chat y Persistencia**: Compatible con todos los navegadores modernos (Chrome, Firefox, Edge, Safari, Brave, Opera).
- **Entrada por Voz (Web Speech API)**: Funciona de forma óptima en **Google Chrome**, **Microsoft Edge** y derivados de Chromium con permisos de micrófono habilitados.

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE). Puedes utilizarlo, modificarlo y distribuirlo libremente para fines académicos y personales.
