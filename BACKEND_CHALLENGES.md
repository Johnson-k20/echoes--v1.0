# Echoes Backend Challenges

This progression is intentionally practical. Each challenge unlocks a visible product behavior while protecting the frontend from a premature rewrite.

## Beginner

| Challenge | What you should learn | Visible Echoes result |
|---|---|---|
| Start MongoDB locally and add a connection module | Environment variables, connection failures, application startup | The API can reach a database you control. |
| Register the schema stubs as Mongoose models | Documents, fields, timestamps, ObjectId references | Echoes has a model vocabulary aligned with the UI. |
| Replace one `501` route with `GET /api/journal-entries` | Express routers, controller separation, query results | Timeline can request real entries. |
| Create a text-only Vault entry | Request body validation, status codes, document creation | Recording results can persist without audio complexity. |
| Add collection CRUD | REST resource design and user-scoped queries | Collections can become real rather than fixture-based. |
| Write route tests | Supertest-style HTTP testing or your preferred equivalent | You can prove success, validation, missing-resource, and ownership cases. |

## Intermediate

| Challenge | What you should learn | Echoes-specific risk to solve |
|---|---|---|
| JWT registration and login | Password hashing, token claims, expiration, safe responses | Never return password hashes or put a token in an unsafe browser persistence strategy. |
| Authorization middleware | Bearer tokens and `userId` scoping | Every memory, collection, letter, insight, and export must belong to the caller. |
| Archive pagination and filtering | Cursors or page metadata, query indexes, date and collection filters | Keep Timeline responsive for a daily journal that grows over time. |
| Audio upload boundary | Multipart request policy, private object storage, metadata documents | Reject unsafe MIME types and sizes; store metadata, not bytes, in MongoDB. |
| Future Self reveal logic | Trusted server time, status transitions, defensive error design | A letter must not reveal before `unlockDate`, even if a user edits local state. |
| Archive export | Data selection, background-job decisions, privacy-preserving downloads | Export only the authenticated user’s data and decide whether audio is included. |

## Advanced

| Challenge | What you should learn | Echoes-specific design question |
|---|---|---|
| Transcription provider adapter | Private server-side provider calls, job lifecycle, retries, cost/error boundaries | How will you expose “processing” without making recordings disappear on failure? |
| AI metadata and insights | Prompt inputs, structured outputs, user privacy, graceful fallback | Which raw journal text is sent externally, and how will the UI behave if AI is unavailable? |
| Insight aggregation | MongoDB aggregation, date grouping, vocabulary statistics | Can an insight be useful without overclaiming what a user’s memories mean? |
| Encryption strategy | Key management, threat modeling, at-rest versus application-level encryption | Which features still work when the server cannot read a private audio key? |
| Notifications or delivery reminders | Background jobs, scheduling, opt-in delivery, retries | Future Self delivery should be reliable without revealing content in a notification. |
| Realtime collaboration | Socket authentication and event authorization | Echoes does not currently need realtime. Add Socket.IO only if a real multi-device or collaborative requirement emerges. |

> The interface contains rich motion and reflection, not a demand for complex infrastructure. Treat realtime as **not required** for the current personal-journal product. The meaningful advanced integrations are secure storage, transcription, AI boundaries, insight aggregation, and time-locked access.
