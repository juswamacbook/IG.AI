# Instagram Aesthetic AI Agent

An AI-powered agent that analyzes an Instagram brand’s aesthetic and generates on-brand palette ideas and mood captions. The current app provides a brand workspace with palette management and local AI generation via Ollama.

---

## What It Does (Current)

- Create brands and palettes
- Store palettes in Postgres via Prisma
- Generate palette suggestions + mood captions with a **local** AI model (Ollama)

---

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS

### Backend
- Node.js / TypeScript
- Prisma ORM
- Local AI via Ollama (no API key required)

### Database
- Postgres (Docker recommended)

---

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Start Postgres (Docker)

```bash
docker run --name ig-ai-postgres   -e POSTGRES_USER=igai   -e POSTGRES_PASSWORD=igai_password   -e POSTGRES_DB=ig_ai   -p 5432:5432   -d postgres:16
```

If the container already exists:

```bash
docker start ig-ai-postgres
```

### 3) Configure environment

Create or update `.env`:

```
DATABASE_URL="postgresql://igai:igai_password@localhost:5432/ig_ai?schema=public"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:8b"
```

### 4) Create DB schema

```bash
npm run db:push
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Local AI (Ollama)

Install and run Ollama, then pull the model:

```bash
ollama run llama3.1:8b
```

Sanity check:

```bash
curl http://localhost:11434/api/tags
```

---

## Prisma Commands

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

---

## Roadmap (Planned)

- Screenshot ingestion + palette extraction
- Aesthetic memory profile
- Design brief generation
- Exportable Figma/Canva design recipes
