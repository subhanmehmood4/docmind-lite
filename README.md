# DocMind

Document intelligence for legal and compliance teams — built by [DevAxon](https://devaxon.com). Upload a PDF, ask questions in natural language, and get answers with page-level citations powered by production RAG.

## Features

- PDF upload with drag & drop
- Text extraction, chunking, and vector embeddings
- Semantic search over document chunks (Supabase + pgvector)
- Groq-powered answers grounded in retrieved context
- Citation cards showing page number and source snippet
- Sample PDF for instant demo testing
- Rate limiting and PDF size/page guardrails

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Chat:** [Groq](https://console.groq.com) — `llama-3.3-70b-versatile` (free tier)
- **Embeddings:** [Hugging Face](https://huggingface.co) — `all-mpnet-base-v2` (free tier)
- **Vector DB:** Supabase (Postgres + pgvector)
- **PDF parsing:** unpdf (server-side)

## Quick Start

### 1. Clone and install

```bash
cd docmind-lite
npm install
```

### 2. Generate sample PDF

```bash
npm run generate:sample
```

### 3. Get free API keys

**Groq (chat answers):**
1. Go to [console.groq.com](https://console.groq.com)
2. Create an API key — free tier, no credit card

**Hugging Face (embeddings for search):**
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a token with **Read** access — free

> Groq does not offer embeddings, so Hugging Face handles vector search. Both are free.

### 4. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 5. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```env
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> **Important:** API keys are only used in server routes (`app/api/*`). Never expose them in the browser.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

Live demo: [docmind-lite.vercel.app](https://docmind-lite.vercel.app)

## License

Internal DevAxon demo — not for redistribution.
