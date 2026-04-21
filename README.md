# PDF RAG

PDF RAG is a full-stack project for chatting with PDF documents using retrieval-augmented generation (RAG).

A PDF is uploaded, indexed in the background, and then used as context for question answering.

## Summary

This is a PDF chat prototype with a separate client, API server, and background worker.

- Next.js client for upload and chat UI.
- Express server for upload and chat endpoints.
- BullMQ worker for background PDF processing.
- Qdrant + OpenAI for retrieval and answer generation.

Main outcome: questions are answered using relevant content from uploaded PDFs.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Clerk
- Node.js + Express
- BullMQ + Redis
- Qdrant
- OpenAI + LangChain
- Docker Compose

## Status

### Completed

- [x] Upload a PDF and send it for background indexing
- [x] Ask questions and get answers using retrieved PDF context
- [x] Show retrieved references/chunks alongside responses
- [x] Filter retrieval by current authenticated user to avoid cross-user mixing
- [x] Persist uploaded file list per user after refresh
- [x] Enforce per-user upload quota limit in upload controller
- [x] Show indexing states (`uploaded`, `processing`, `ready`, `failed`)

### Updates Coming

- [ ] Add delete file flow with vector cleanup
- [ ] Add payment gateway for upload user quota

## How To Run

1. Create environment files.

`server/.env`

```env
DATABASE_URL=postgresql://pdfrag:pdfrag@localhost:5432/pdfrag
REDIS_HOST=localhost
REDIS_PORT=6379
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
DEFAULT_UPLOAD_LIMIT=2
OPENAI_API_KEY=your_openai_key
QDRANT_URL=http://localhost:6333
```

`client/.env`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

2. Start infrastructure (from project root).

```bash
docker compose up -d
```

3. Install dependencies and run DB migration.

```bash
cd server
pnpm install
pnpm db:migrate

cd ../client
pnpm install
```

4. Start the API server (terminal 1).

```bash
cd server
pnpm dev
```

5. Start the worker (terminal 2).

```bash
cd server
pnpm dev:worker
```

6. Start the client app (terminal 3).

```bash
cd client
pnpm dev
```

7. Open the app.

```text
http://localhost:3000
```

## Environment

Environment variables are listed in step 1 of the local run guide.