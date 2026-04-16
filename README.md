# PDF RAG

I built this project to chat with PDFs using retrieval-augmented generation (RAG).  
I upload a PDF, index it in the background, and then ask questions that are answered from the document context.

## Summary

This is my full-stack PDF chat prototype.

- I use a Next.js client for upload + chat.
- I use an Express server for APIs.
- I use a worker to process PDFs and store vectors.
- I use Qdrant + OpenAI to retrieve context and generate answers.

Main outcome: I can ask questions and get answers grounded in my uploaded PDF content.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF)
![Node.js](https://img.shields.io/badge/Node.js-Server-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express)
![BullMQ](https://img.shields.io/badge/BullMQ-Queue-DC382D)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC244C)
![OpenAI](https://img.shields.io/badge/OpenAI-LLM-412991?logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

## Status

### Completed

- [x] Upload a PDF and send it for background indexing
- [x] Ask questions and get answers using retrieved PDF context
- [x] Show retrieved references/chunks alongside responses
- [x] Keep chat + upload flow usable in a clean UI

### Updates Coming

- [ ] Persist uploaded file list per user after refresh
- [ ] Track document ownership (`userId` + `documentId`) during indexing
- [ ] Filter retrieval by current user and selected document
- [ ] Add document picker to choose which PDF to chat with
- [ ] Show indexing states (`uploaded`, `processing`, `ready`, `failed`)
- [ ] Add delete file flow with vector cleanup
- [ ] Add tests for upload, worker, and chat paths

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

In `server/.env`, I set at least:

```env
OPENAI_API_KEY=your_openai_key
QDRANT_URL=http://localhost:6333
```