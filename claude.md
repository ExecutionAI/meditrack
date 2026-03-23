# MediTrack — Claude Context

## Project
Diet tracking app for **Héctor Jesús Zavala Luna**.
Doctor: Marco Polo Rodríguez Torres (IMSS Delegación Sur DF).
Plan: 2000 kcal — HCO 60% / PROT 15% / LIP 30%.
Starting weight: 179.3 kg.

All app copy and UI must be in **Spanish**. Code and internal docs in English.

## Always Do First
- Invoke the `frontend-design` skill before writing any frontend code, every session, no exceptions.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Single `index.html` — Tailwind CDN, mobile-first, all inline |
| Backend | `api.mjs` — Node.js + Express (ESM) |
| Database | Supabase — schema `meditrack` inside the Lab project |
| AI — food analysis | OpenAI GPT-4o (vision + text) |
| AI — voice transcription | OpenAI Whisper |
| Dev server | `serve.mjs` (port 3000) |
| Screenshots | `screenshot.mjs` + Puppeteer |
| Deployment | Render (API) + Namecheap (static) |

## Brand & Design
- **Primary color:** #2D6A4F (deep medical green)
- **Accent:** #52B788 (fresh green)
- **Warn:** #F4A261 (warm amber for alerts/missed portions)
- **Danger:** #E63946 (red for over-limit)
- **Background:** #F8FAF9 (near-white with green tint)
- **Text:** #1B2A23 (dark forest)
- Font pairing: **Outfit** (headings) + **Inter** (body) — both from Google Fonts
- Mobile-first, card-based UI, generous whitespace
- Never use default Tailwind palette colors directly

## App Structure
```
meditrack/
  index.html          ← full SPA (3 screens)
  api.mjs             ← Express API
  serve.mjs           ← local dev server (port 3000)
  screenshot.mjs      ← Puppeteer screenshot tool
  data/
    equivalents.js    ← food equivalents table (from doctor's sheets)
    meal-plan.js      ← Héctor's prescribed portions per meal
  briefs/             ← doctor's original tables (jpeg)
  brand_assets/       ← logos if added later
```

## App Features

### 1. Inicio Screen
- Shows **next meal in the pipeline** (Desayuno → Comida → Cena in order)
- Sequential pipeline: must complete Desayuno before logging Comida, etc.
- Always shows what food groups are needed for any meal (read-only view)
- Gamification: streak counter, daily compliance badge

### 2. Registrar Screen
- 3 input methods: Photo of menu, Photo of food, Voice note
- Can combine photo + voice for accuracy
- GPT-4o analyzes input → maps to food groups using equivalents table
- Always shows confirmation step before saving
- Meal type locked to next-in-pipeline (cannot skip)

### 3. Progreso Screen
- Day / Week / Month views
- Plan vs. consumed per food group (bar/progress charts)
- Streak tracking: consecutive days completing the full plan
- Gamification: badges, weekly summary, compliance %

## Meal Plan (prescribed portions)
| Grupo | Desayuno | Comida | Cena | Colación |
|-------|----------|--------|------|----------|
| Leche | 1 | 0 | 1 | 0 |
| Carne | 2 | 3 | 2 | 0 |
| Fruta | 1 | 1 | 1 | ✓ bajo IG |
| Verdura | 1 | 1 | 1 | ✓ bajo IG |
| Cereales | 3 | 4 | 2 | 0 |
| Leguminosas | 0 | 1 | 0 | 0 |
| Grasas | 1 | 2 | 1 | 0 |

Colaciones are unlimited but must be low-GI fruit or vegetable only.

## Coding Principles (from reference_architecture.md)
- No `window.confirm()` — always branded modals
- `localStorage` for auth token (not sessionStorage)
- Spanish for all user-facing copy
- AI output → always parse as JSON, always include confirmation step
- Two-step Supabase FK lookups when joins unreliable
- Never push automatically — only when explicitly told

## Environment Variables Required
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_TOKEN          ← Héctor's password (hashed check)
OPENAI_API_KEY
PORT                 ← optional, defaults to 3000
```
