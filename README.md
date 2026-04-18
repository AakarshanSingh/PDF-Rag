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

### Updates Coming

- [ ] Persist uploaded file list per user after refresh
- [ ] Show indexing states (`uploaded`, `processing`, `ready`, `failed`)
- [ ] Enforce per-user upload quota limit in upload controller
- [ ] Add delete file flow with vector cleanup

## How To Run

1. Start infrastructure from project root.

```bash
docker compose up -d
```

2. Start server dependencies and API.

```bash
cd server
pnpm install
pnpm dev
```

3. Start the worker in a second terminal.

```bash
cd server
pnpm dev:worker
```

4. Start the client app.

```bash
cd client
pnpm install
pnpm dev
```

5. Open the app.

```text
http://localhost:3000
```

## Environment

In `server/.env`, set at least:

```env
OPENAI_API_KEY=your_openai_key
QDRANT_URL=http://localhost:6333
```