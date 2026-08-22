# Echoes — MERN Learning Laboratory

Echoes is a voice-first personal journal with two preserved product modes: **The Vault**, for quick reflection and memory capture, and **Future Self**, for letters designed to unlock later. Its dark charcoal, amber, glass, grain, ritual, and sacred-geometry interface remains intact. What has changed is the architecture beneath it: the application is now a **production-looking React UI shell paired with an intentionally unfinished Express and MongoDB backend laboratory**.

> **The frontend is the product. The backend is the exercise.** You should be able to open Echoes, understand what each screen is meant to do, and then implement the data, security, storage, AI, and time-locking behavior yourself.

## What is preserved

| Preserved product surface | What still works without a backend |
|---|---|
| Vault, recording, archive, collections, Future Self, insights, and settings routes | Every visual route remains navigable under the development-only auth bypass. |
| Dark charcoal and amber design system | Typography, spacing, glass panels, animated grain, sacred dividers, responsive layouts, and motion remain in `client/src`. |
| Recording ritual interaction | Browser recording controls, local preview, local download, and temporary UI feedback remain frontend concerns. |
| Loading, empty, success, and error-oriented presentation | The interface communicates intended product states using isolated development fixtures. |
| Service boundaries | The UI calls named services in `client/src/services/`, rather than a generated RPC client. |

## What was intentionally removed

The finished production implementation was removed so it cannot silently solve the learning work for you. The project no longer contains the generated RPC stack, hosted OAuth workflow, Drizzle ORM schema and migrations, MySQL integration, cloud storage helpers, transcription provider implementation, LLM implementation, or production-specific backend runtime. The client contains no production key, provider URL, database URL, or cloud credential.

The replacement is deliberately incomplete: Express mounts REST route contracts, Mongoose files describe likely model fields, and the development auth route makes pages reachable. Database connection, controller logic, validation, password handling, JWT verification, ownership checks, uploads, transcription, AI, insight generation, and Future Self unlock enforcement are **your work**.

## Architecture now

```text
Preserved React pages and components
                |
                v
client/src/services/*.ts
                |
                v
Express REST contracts in server/routes/
                |
                v
Your future controllers, services, auth, and Mongoose models
                |
                v
Your MongoDB database and chosen private object storage
```

The client starts with fixtures enabled so the product continues to look complete while the server is unfinished. When you are ready to integrate a feature, set `VITE_USE_FIXTURES=false`, implement only that matching API route, test it, and then switch the matching service from fixture data to the API response.

## Technology inventory

| Layer | Current technology | Purpose in this repository |
|---|---|---|
| UI | React 19, TypeScript, Vite, Tailwind CSS | Preserved product interface and responsive design system. |
| Navigation and interaction | Wouter, React components, browser APIs | Route composition, visual interactions, and recording-side user experience. |
| Client boundary | Typed `fetch` services and fixture store | The contract between the UI and your future REST API. |
| API scaffold | Express, CORS, JSON body parsing | A small, intentionally incomplete REST application. |
| Data scaffold | MongoDB and Mongoose schema stubs | A vocabulary for future persistence, not a connected database. |
| Development process | `concurrently`, `tsx`, Vitest | Start both processes locally and write regression tests as you implement. |

## Project map

```text
client/src/
  pages/                 Preserved Echoes routes and product UI
  components/            Preserved visual and interaction components
  services/              REST request contracts and development fixtures
  types/api.ts           Shared frontend response contracts

server/
  index.ts               Minimal Express application and API mounts
  routes/                Intentionally incomplete REST endpoint contracts
  middleware/auth.js     Unsafe development-only identity bypass
  models/                Mongoose schema stubs; models are not registered yet

BACKEND_ROADMAP.md       Recommended product-specific implementation order
FEATURE_MAP.md           Screen-to-model-to-route implementation map
BACKEND_CHALLENGES.md    Beginner, intermediate, and advanced challenges
IMPLEMENT_YOURSELF.md    The work deliberately left for you
```

## Installation and environment configuration

Install Node.js and MongoDB locally, then install this repository’s dependencies with the package manager recorded in `package.json`.

```bash
pnpm install
```

Create a private `.env` file from the environment template shown below. Do not commit this file. The repository intentionally uses placeholders rather than secrets.

| Variable | Example development value | Why you will need it |
|---|---|---|
| `PORT` | `5000` | The Express API port. |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/echoes` | Your own MongoDB connection string. |
| `JWT_SECRET` | A long random value you generate | Required only when you implement real JWT authentication. |
| `CLIENT_URL` | `http://localhost:3000` | Express CORS origin for the Vite client. |
| `WHISPER_API_KEY` | Leave blank until you choose a provider | Future transcription boundary. |
| `AI_API_KEY` | Leave blank until you choose a provider | Future metadata and insight boundary. |

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/echoes
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000
WHISPER_API_KEY=
AI_API_KEY=
```

## Start the application

The standard development command starts the preserved Vite client on port `3000` and the unfinished Express API on port `5000` together. Vite proxies browser requests beginning with `/api` to the Express process.

```bash
pnpm dev
```

For separate terminals, use the explicit process scripts instead:

```bash
pnpm client
pnpm server
```

Use the following checks before and after your own backend changes:

```bash
pnpm check
pnpm test
pnpm build
```

## MongoDB setup is your first backend exercise

Start a local MongoDB instance, set `MONGO_URI` in your private environment, and create a database connection module. No connection is supplied by design. The files under `server/models/` are schema **stubs**, not registered models, and no route currently queries MongoDB. This means a healthy `GET /api/health` response confirms only that Express is running; it does not mean persistence has been implemented.

## REST API inventory

| Area | Endpoint contract | Current state |
|---|---|---|
| Health | `GET /api/health` | Returns a learning-scaffold status. |
| Development identity | `GET /api/auth/me`, `POST /api/auth/logout` | Harmless development-only responses. Replace before production. |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login` | `501 Not Implemented`. |
| User account | `GET/PATCH/DELETE /api/users/me` | `501 Not Implemented`. |
| Journal entries | `GET/POST /api/journal-entries`, `GET/PATCH/DELETE /api/journal-entries/:id` | `501 Not Implemented`. |
| Transcription and metadata | `POST /api/journal-entries/transcribe`, `POST /api/journal-entries/suggest-metadata` | `501 Not Implemented`. |
| Collections | `GET/POST /api/collections`, `PATCH/DELETE /api/collections/:id` | `501 Not Implemented`. |
| Future Self | `GET/POST /api/future-letters`, `GET /api/future-letters/:id` | `501 Not Implemented`. |
| Insights | `GET /api/insights/:periodMonth` | `501 Not Implemented`. |
| Uploads | `POST /api/uploads` | `501 Not Implemented`. |
| Archive export | `POST /api/archive` | `501 Not Implemented`. |

## Recommended development order

Begin with a small vertical slice: durable text-only journal entries for the development user. Add a database connection, register `JournalEntry`, write `GET` and `POST` controllers, validate the request, test the result, and switch only `journalService` away from fixtures. Then build collections, authentication and ownership, audio metadata and uploads, Future Self rules, insights, and AI integrations in that order.

The detailed sequence appears in [BACKEND_ROADMAP.md](./BACKEND_ROADMAP.md). Use [FEATURE_MAP.md](./FEATURE_MAP.md) whenever you want to trace a screen through data, model, route, controller, service, authorization, and response. Read [BACKEND_CHALLENGES.md](./BACKEND_CHALLENGES.md) before choosing a milestone and [IMPLEMENT_YOURSELF.md](./IMPLEMENT_YOURSELF.md) to keep the learning boundary explicit.

## Authentication and security warning

`server/middleware/auth.js` and the `GET /api/auth/me` response are marked **DEVELOPMENT ONLY**. They inject or return a fixed identity so every preserved page remains reachable. They are not authentication, do not verify a token, do not authorize a resource, and must never be used in production. Before any real deployment, implement password security, JWT verification, ownership checks, input validation, error handling, rate controls, private storage access, and secret management.

## Realtime and external integrations

Echoes does not currently require Socket.IO or another realtime transport; it is a personal, asynchronous journal. Add realtime only for a concrete future requirement such as multi-device synchronization status or collaboration. The external integrations you may eventually choose to build are private object storage for audio, a transcription provider, an AI provider for metadata and qualitative summaries, and an optional notification mechanism for unlocked Future Self letters. The interface is preserved, but no provider is selected or configured for you.

## Learning boundary

Treat journal content and recordings as sensitive personal data while you build. Keep secrets out of source control, write tests around access control, and understand the code you add before relying on it. The Echoes Android companion was completed separately and is not changed by this web-focused learning-lab conversion.
