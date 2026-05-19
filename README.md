# Relatos Latam — Generador de Contenido IA

Aplicación web para generar contenido viral en español para YouTube y TikTok, usando la API de Anthropic (Claude). Genera guiones con plot twists reales, títulos, descripciones y hashtags optimizados para SEO — todo listo para producir en CapCut.

![Relatos Latam](https://img.shields.io/badge/Relatos%20Latam-Generador%20IA-cc2020?style=for-the-badge)
![Claude API](https://img.shields.io/badge/Claude-Sonnet%204-orange?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=for-the-badge)

## Demo

🔗 **[Ver app en vivo](https://TU-USUARIO.github.io/relatos-latam)**

---

## ¿Qué genera?

Por cada ejecución genera automáticamente:

| Formato | Plataforma | Duración | Uso |
|---------|-----------|----------|-----|
| Guión largo 16:9 | YouTube | ~10 min | Monetización alta (CPM $8–$20) |
| Guión short 9:16 | TikTok | 65 seg | Alcance masivo |
| Guión short 9:16 | YouTube Shorts | 65 seg | Mismo archivo — doble alcance |

También genera: título de YouTube, descripción de YouTube, título para TikTok/Shorts, descripción corta para TikTok/Shorts, y 20 hashtags SEO.

Los guiones largos se dividen automáticamente en **bloques de máximo 440 caracteres** listos para pegar en CapCut (text-to-speech).

---

## Características

- **Motor de plot twists**: cada historia tiene mínimo 2 capas de giro. El primer giro parece el final. El segundo destruye todo lo anterior.
- **Pistas sembradas**: el guión planta detalles desde el inicio que el espectador no reconoce hasta el giro — genera rewatch orgánico.
- **Números en letras**: el motor convierte automáticamente todos los números a texto para que la voz IA de CapCut los lea correctamente.
- **Bloques pre-divididos**: el guión se divide automáticamente respetando el límite de 500 caracteres de CapCut, con botón de copia individual por bloque.
- **API Key segura**: la key se guarda solo en `localStorage` del navegador del usuario. Nunca se envía a ningún servidor externo.
- **Fallback inteligente**: si la API falla, genera el prompt completo para copiar y pegar en Claude.ai.

---

## Canales disponibles

- 🔥 **Traición y Venganza** — historias de traiciones reales, venganzas legales, psicología oscura
- 🕵️ **Misterios y Crimen** — casos sin resolver, conspiraciones, crimen real latinoamericano
- 🎮 **Historias Gaming** — escándalos de esports, estudios que quebraron, traiciones en la industria

---

## Stack

- **Frontend**: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- **API**: Anthropic Claude Haiku — máxima calidad, ~$2 USD/mes
- **Deploy**: GitHub Pages
- **Storage**: localStorage del navegador (sin backend, sin base de datos)

---

## Setup local

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/relatos-latam.git
cd relatos-latam

# No hay dependencias. Abrí index.html en tu navegador
open index.html

# O usá un servidor local simple
npx serve .
```

---

## Deploy en GitHub Pages

1. Fork o cloná este repo en tu cuenta de GitHub
2. Ve a **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** → **/ (root)**
5. Guardá — en 2 minutos tu app está en `https://TU-USUARIO.github.io/relatos-latam`

---

## API Key

Necesitás una API Key de Anthropic:

1. Creá cuenta en [console.anthropic.com](https://console.anthropic.com)
2. Ve a **API Keys → Create Key**
3. Copiá la key (empieza con `sk-ant-api03-...`)
4. Pegála en la pantalla de inicio de la app

**Costo estimado**: ~$2–3 USD/mes para 36 videos. Modelo: `claude-haiku-4-5` — calidad Claude completa al menor costo disponible.

---

## Seguridad

- La API Key **nunca sale de tu navegador**. Se guarda en `localStorage` y se envía directamente a `api.anthropic.com`.
- La app no tiene backend, no hay servidor intermedio, no hay logs.
- Si compartís el repositorio público, **no hardcodees tu API key en el código**.

---

## Estructura del proyecto

```
relatos-latam/
├── index.html      # App principal
├── styles.css      # Estilos
├── app.js          # Lógica de la aplicación + llamadas a la API
└── README.md       # Este archivo
```

---

## Roadmap

- [ ] Historial de guiones generados (localStorage)
- [ ] Exportar guión como .txt o .docx
- [ ] Integración con Google Drive para guardar automáticamente
- [ ] Plantillas de thumbnails para YouTube
- [ ] Calendario editorial integrado

---

## Licencia

MIT — usá, modificá y distribuí libremente.

---

*Hecho con Claude (Anthropic) · Diseñado para Relatos Latam*
