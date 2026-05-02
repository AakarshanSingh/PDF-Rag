# PDF RAG

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <img height="32" src="https://skillicons.dev/icons?i=nextjs" title="Next.js" />
  <img height="32" src="https://skillicons.dev/icons?i=react" title="React" />
  <img height="32" src="https://skillicons.dev/icons?i=ts" title="TypeScript" />
  <img height="32" src="https://skillicons.dev/icons?i=tailwind" title="Tailwind CSS" />
  <img height="32" src="https://skillicons.dev/icons?i=nodejs" title="Node.js" />
  <img height="32" src="https://skillicons.dev/icons?i=express" title="Express" />
  <img height="32" src="https://skillicons.dev/icons?i=redis" title="Redis" />
  <img height="32" src="https://skillicons.dev/icons?i=docker" title="Docker Compose" />
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://unpkg.com/@lobehub/icons-static-webp@latest/dark/openai.webp" />
    <img height="32" src="https://unpkg.com/@lobehub/icons-static-webp@latest/light/openai.webp" title="OpenAI" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://unpkg.com/@lobehub/icons-static-webp@latest/dark/langchain.webp" />
    <img height="32" src="https://unpkg.com/@lobehub/icons-static-webp@latest/light/langchain.webp" title="LangChain" />
  </picture>
  <img height="32" src="https://skillicons.dev/icons?i=githubactions" title="GitHub Actions" />
</div>

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
- Custom Authentication (JWT & Resend)
- Node.js + Express
- BullMQ + Redis
- Qdrant
- OpenAI + LangChain
- Docker Compose
- GitHub Actions (CI/CD)

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
DEFAULT_UPLOAD_LIMIT=1
OPENAI_API_KEY=your_openai_key
QDRANT_URL=http://localhost:6333
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_resend_from_email
```

### The Easy Way (Production Docker)

You can run the entire application stack in a single command using the production Docker Compose file. This automatically builds the apps, runs database migrations, and manages all services without needing multiple terminal windows.

2. Run the production docker-compose file:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

3. Open the app at `http://localhost:3000`.

### Local Development (Manual)

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