# HODIO-MVP

Herramienta de monitorización de discurso de odio y polarización en medios digitales españoles. Proyecto técnico de portfolio.

Licencia: [MIT](LICENSE)

## Stack

- **Backend**: Node.js + Express + better-sqlite3 + node-cron
- **Frontend**: React + Vite + TailwindCSS + Recharts
- **Clasificador IA**: Anthropic SDK (claude-sonnet-4-20250514)
- **Scraping**: Axios + Cheerio + rss-parser

## Setup

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env:
#   ANTHROPIC_API_KEY=tu_clave_aqui  (obligatorio para clasificación real)
#   TWITTER_BEARER_TOKEN=opcional    (dejar vacío para datos mock)
#   PORT=3001
#   VITE_API_URL=http://localhost:3001
```

## Ejecutar

Dos terminales:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

## API X (Twitter)

Para usar datos reales de X en lugar de mock:

1. Crea una app en [developer.twitter.com](https://developer.twitter.com)
2. Necesitas **Basic** o superior (acceso a API v2)
3. Genera un Bearer Token
4. Añade `TWITTER_BEARER_TOKEN=tu_token` en `.env`

Sin token, el sistema usa automáticamente datos mock.

## Capturas

<!-- Screenshot placeholder -->

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/health | Estado del servidor y DB |
| GET | /api/items | Items paginados |
| GET | /api/items/:id | Detalle de un item |
| GET | /api/stats/overview | Estadísticas globales |
| GET | /api/stats/trend?days=7 | Evolución temporal |
| GET | /api/sources | Lista de fuentes |
| POST | /api/sources | Añadir fuente |
| PUT | /api/sources/:id/toggle | Activar/desactivar fuente |
| POST | /api/analyze | Analizar texto manual |
| POST | /api/fetch/rss | Disparar fetch RSS manual |
