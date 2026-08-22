# Echoes Backend Roadmap

**Echoes is a frontend-first MERN learning laboratory.** The Vault, recording ritual, Future Self letters, archive, collections, insight screens, visual treatments, and responsive behavior are already present. The backend beneath them is deliberately unfinished. Implement the following stages in order so every choice has a visible effect in the preserved product.

> Do not begin by connecting an AI provider or a cloud bucket. First establish data ownership, validation, and a predictable HTTP contract. The advanced features become much easier after that foundation exists.

| Stage | Your implementation goal | Echoes outcome | Leave untouched |
|---|---|---|---|
| 1 | Install and start MongoDB, then use `MONGO_URI` from your private `.env` file. | The API can connect to your own database. | The UI shell and development fixtures. |
| 2 | Turn the six schema stubs in `server/models/` into registered Mongoose models with your own validation and indexes. | Echoes gets durable users, recordings, collections, letters, insight records, and audio metadata. | The supplied field inventory and frontend response types unless you deliberately evolve both. |
| 3 | Add a database connection module and a shared error handler. | Failed database operations return deliberate JSON errors instead of crashing a route. | The `501 NOT_IMPLEMENTED` scaffold routes until their controller is ready. |
| 4 | Build journal-entry CRUD, beginning with `GET /api/journal-entries` and `POST /api/journal-entries`. | Timeline and Vault data can become real. | Local fixtures until each matching route passes tests. |
| 5 | Build collection CRUD and link entries to a collection you own. | The Collections screen can move from fixtures to MongoDB. | Collection visuals, labels, filtering controls, and empty states. |
| 6 | Implement registration, password hashing, login, JWT creation, and Bearer-token middleware. | The development user can be replaced with real accounts. | The current development bypass until a protected route test passes. |
| 7 | Enforce ownership for every user-scoped query and mutation. | A user cannot read, alter, export, or reveal another user’s memories. | The frontend route structure. |
| 8 | Build an audio upload service around `POST /api/uploads` and your chosen private object storage provider. | Audio metadata can be stored in MongoDB while recording bytes live elsewhere. | The local browser recording preview and download controls. |
| 9 | Create transcription and metadata-suggestion service adapters. | The recording ritual can request transcripts, moods, and collection suggestions. | API keys and provider logic must remain server-side. |
| 10 | Implement sealed Future Self letters with server-enforced unlock checks. | A future letter cannot reveal early merely by changing the browser clock or UI state. | The existing ceremony, wax-seal, and locked-letter presentation. |
| 11 | Produce insights from your own aggregation queries, then optionally add an AI summarizer behind a service boundary. | The Insights page can be based on the user’s actual entries. | The supplied qualitative insight fixture while you learn the aggregation. |
| 12 | Implement an export route, security review, tests, and deployment configuration. | A user can safely request a complete archive of their own memories. | The product’s visual identity. |

## Suggested first milestone

Implement a single authenticated-equivalent vertical slice using the development bypass: **list journal entries for the injected user, create one text-only journal entry, and render it in Timeline.** Do not add audio, AI, or Future Self rules until this is reliable and tested. This gives you a clean, observable baseline for Express routing, Mongoose persistence, API responses, and React service calls.

## Deliberate gaps you are expected to close

| Area | Where the gap begins | Your task |
|---|---|---|
| Database connection | No connection module is provided. | Decide connection lifecycle, retry behavior, and startup failure policy. |
| Controllers | Routes return `501` through `notImplemented`. | Add small controller modules and wire them incrementally. |
| Validation | Payload shapes exist in `client/src/types/api.ts`, but server validation is absent. | Choose a validation library or plain checks and design error responses. |
| Authentication | `server/middleware/auth.js` is unsafe by design. | Implement password handling, JWT issuance, verification, expiration, and account lookup. |
| Authorization | No ownership check exists. | Scope every model query by the authenticated user. |
| Storage | `/api/uploads` is a boundary only. | Choose private object storage, MIME/size rules, and deletion lifecycle. |
| Transcription and AI | Routes are contracts only. | Implement provider adapters, timeouts, costs, privacy policy, and fallback handling. |
| Time locks | Future letter routes have no reveal rule. | Enforce unlock time and decide how timezone and clock drift are handled. |

## Working agreement between client and server

The client’s service files make ordinary REST requests when `VITE_USE_FIXTURES=false`; otherwise they return isolated development fixtures. Migrate one service at a time only after its REST route behaves correctly. Each route should return the generic contract already described in `client/src/types/api.ts`:

```ts
{ success: true, data: /* feature-specific payload */ }
```

For expected client mistakes, return `{ success: false, code, message }` with an appropriate HTTP status. Keep error messages useful but do not expose stack traces, tokens, secrets, storage keys, or internal database details.

## Completion definition for a backend feature

A feature is ready to switch off its fixture only when its route validates input, authenticates the request, authorizes ownership, persists or retrieves the correct document, returns the declared contract, covers success and failure tests, and leaves the existing UI state behavior unchanged.
