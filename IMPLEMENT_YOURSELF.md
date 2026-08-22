# Implement Echoes Yourself

This repository is intentionally not a finished backend. The following work is the learning exercise. Resist the temptation to paste a completed solution without understanding each security and product decision.

## Foundation

- [ ] Create a private `.env` file from `.env.example` and choose your own `MONGO_URI` and `JWT_SECRET`.
- [ ] Decide how the server establishes, monitors, and closes the MongoDB connection.
- [ ] Convert each Mongoose schema stub into a model only after choosing required fields, field limits, normalization rules, indexes, and deletion behavior.
- [ ] Create controller modules rather than embedding database work inside route files.
- [ ] Design a consistent error middleware and API error envelope.
- [ ] Add request validation for every mutation.

## Identity and ownership

- [ ] Implement registration with password hashing and an email uniqueness decision.
- [ ] Implement login, JWT issuance, expiration, refresh or re-authentication policy, and logout behavior appropriate to your token transport.
- [ ] Replace `developmentAuthBypass` with real Bearer-token middleware.
- [ ] Add an ownership check to every user-scoped journal entry, collection, letter, insight, audio asset, archive, and account operation.
- [ ] Decide how to protect account deletion and archive export with recent authentication or confirmation.

## Echoes product behavior

- [ ] Implement Vault entry creation, listing, reading, editing, deletion, ordering, filtering, and pagination.
- [ ] Implement collections and decide whether automatic collections are trusted, editable, or both.
- [ ] Implement Future Self sealing and a server-side unlock rule that does not rely on the browser clock.
- [ ] Implement monthly insights from data you can explain and test.
- [ ] Implement archive export with a clear policy for transcripts, metadata, and audio files.

## Audio, transcription, and AI

- [ ] Choose private object storage and implement `POST /api/uploads` with size, MIME, ownership, cleanup, and access-control rules.
- [ ] Keep audio bytes out of MongoDB; persist only `AudioAsset` metadata and references.
- [ ] Decide how transcription jobs report pending, successful, and failed states.
- [ ] Implement a transcription provider adapter using a server-only key.
- [ ] Implement AI metadata and insight adapters with transparent failure behavior and a privacy decision about journal text.
- [ ] Build a deletion policy that removes or invalidates orphaned storage objects.

## Engineering discipline

- [ ] Write integration tests for each API contract before switching that frontend service away from its fixture.
- [ ] Test unauthorized, forbidden, invalid-input, not-found, and server-error responses—not only happy paths.
- [ ] Add rate limiting and careful logging around authentication and any paid external API.
- [ ] Review configuration before deployment so real tokens, database URLs, recordings, and journal content never enter Git.
- [ ] Keep the UI intact while changing backend behavior; a backend milestone is not a reason to redesign Echoes.

> **Do not ask an assistant to silently fill these gaps.** Use documentation, small experiments, tests, and your own design notes. The most valuable outcome is not merely a working journal; it is knowing why its API, security, privacy, and storage boundaries work the way they do.
