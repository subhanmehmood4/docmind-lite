# DocMind Lite

AI-powered document Q&A demo built by [DevAxon](https://devaxon.com). Upload a PDF, ask questions in natural language, and get answers with source citations powered by RAG (Retrieval-Augmented Generation).

## Features

- PDF upload with drag & drop
- Text extraction, chunking, and vector embeddings
- Semantic search over document chunks (Supabase + pgvector)
- Gemini answers grounded in retrieved context
- Citation cards showing page number and source snippet
- Sample PDF for instant demo testing
- Rate limiting and PDF size/page guardrails

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **LLM:** Google Gemini (`text-embedding-004`, `gemini-2.0-flash`) — free tier available
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

### 3. Get a Gemini API key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key — free tier includes generous daily limits

### 4. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and service role key

### 5. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```env
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **Important:** API keys are only used in server routes (`app/api/*`). Never expose them in the browser.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push `docmind-lite` to a GitHub repo (or deploy from this monorepo with root directory set to `docmind-lite`)
2. Import the project in [Vercel](https://vercel.com)
3. Add the three environment variables from `.env.local`
4. Deploy

## Usage

1. Upload a PDF (max 10MB, 20 pages) or click **Try a sample PDF**
2. Wait for processing (text extraction + embedding)
3. Ask questions in the chat panel
4. Answers include citation cards with page numbers and source snippets

## Guardrails

- Max PDF size: 10MB
- Max pages: 20
- Scanned/image-only PDFs show a friendly error
- Chat endpoint rate-limited (30 req/min per IP)
- Answers constrained to retrieved document context

## Project Structure

```
docmind-lite/
├── app/
│   ├── api/ingest/route.ts   # PDF upload → chunk → embed → store
│   ├── api/chat/route.ts     # Question → retrieve → answer
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── UploadZone.tsx
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   └── CitationCard.tsx
├── lib/
│   ├── google.ts
│   ├── supabase.ts
│   ├── chunk.ts
│   ├── pdf.ts
│   └── rate-limit.ts
├── public/sample.pdf
└── supabase/schema.sql
```

## License

Internal DevAxon demo — not for redistribution.
