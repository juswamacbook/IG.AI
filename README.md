# Instagram Aesthetic AI Agent

An AI-powered agent that analyzes an Instagram account’s existing aesthetic and automatically generates on-brand post concepts, design briefs, and captions optimized for engagement goals such as saves, shares, or comments.

This project focuses on **automation + consistency**: instead of manually deciding what to post, the agent learns your visual and textual style once, stores it as memory, and uses it to curate future posts that fit your grid.

---

## Core Idea

The agent operates as a multi-stage pipeline:

1. **Aesthetic Ingestion** – Analyze existing Instagram posts (via grid screenshots)
2. **Style Extraction** – Extract color palette, contrast, layout density, and caption voice
3. **Aesthetic Memory** – Store a reusable style profile
4. **Post Generation** – Produce post concepts, design briefs, and captions
5. **Optimization & Ranking** – Score outputs based on aesthetic fit and post goal
6. **Export** – Provide Canva/Figma-ready design instructions and captions

The result is a repeatable, automated workflow for creating Instagram content that stays visually and tonally consistent.

---

## Features

- 📸 Upload Instagram grid screenshots to learn aesthetic
- 🎨 Automatic color palette and layout extraction
- 🧠 Persistent aesthetic memory (style profile)
- 🖼️ Design recipe system (carousel, photo post, text card, etc.)
- ✍️ Caption generation that matches your writing voice
- 📊 Scoring and ranking for engagement goals
- 📄 Exportable design briefs for Canva or Figma
- 🔁 Feedback-ready architecture for future learning

---

## Tech Stack

### Frontend
- Next.js (React + API routes)
- Tailwind CSS (UI)

### Backend
- Node.js / TypeScript
- OpenAI-compatible LLM for generation and critique

### Image Processing
- `sharp` – image preprocessing
- `node-vibrant` – color palette extraction

### Database
- SQLite
- Prisma ORM

---

## System Architecture



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
