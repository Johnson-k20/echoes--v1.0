# Echoes Feature-to-Backend Map

This map translates every backend-dependent interaction in the preserved Echoes interface into the backend work you will eventually own. The **controller** and **service** columns describe modules you should create; they do not exist yet.

| Feature | UI component or route | Data required | MongoDB model | Express route | Future controller | Future service | Authorization | Expected response |
|---|---|---|---|---|---|---|---|---|
| Development session | `useAuth`, authenticated shell, Settings | Current user profile | `User` | `GET /api/auth/me` | `authController.me` | `authService` | Development bypass now; verified JWT later | `User` profile |
| Account registration | Auth affordance | Name, email, password | `User` | `POST /api/auth/register` | `authController.register` | `authService` | Public, rate-limited | Newly created safe user profile |
| Account login | Auth affordance | Email, password | `User` | `POST /api/auth/login` | `authController.login` | `authService` | Public, rate-limited | Token strategy plus safe user profile |
| Record upload | Recording ritual | Audio bytes, filename, MIME type, duration | `AudioAsset` | `POST /api/uploads` | `uploadController.create` | `storageService` | Authenticated owner | Audio asset metadata only |
| Transcription | Recording ritual | Audio asset reference | `AudioAsset`, `JournalEntry` | `POST /api/journal-entries/transcribe` | `transcriptionController.create` | `transcriptionService` | Authenticated owner | Transcript and timing data |
| AI suggestions | Recording ritual | Transcript and optional context | `JournalEntry`, `Collection` | `POST /api/journal-entries/suggest-metadata` | `journalController.suggestMetadata` | `aiService` | Authenticated owner | Mood, title, and collection suggestion |
| Save a Vault entry | Recording ritual | Transcript, metadata, audio reference, ambience | `JournalEntry` | `POST /api/journal-entries` | `journalController.create` | `journalService` | Authenticated owner | Created journal entry |
| Browse archive | Home and Timeline | Ordered entries, filters, pagination cursor | `JournalEntry` | `GET /api/journal-entries` | `journalController.list` | `journalService` | Authenticated owner | Entry list and pagination metadata |
| Read or revise an entry | Timeline detail behavior | One entry and editable fields | `JournalEntry` | `GET/PATCH /api/journal-entries/:id` | `journalController.getById/update` | `journalService` | Authenticated owner | Journal entry |
| Delete an entry | Timeline and Settings actions | Entry identifier | `JournalEntry`, possibly `AudioAsset` | `DELETE /api/journal-entries/:id` | `journalController.remove` | `journalService` | Authenticated owner | Deletion confirmation |
| Curate collections | Collections | Names and entry membership | `Collection`, `JournalEntry` | `GET/POST/PATCH/DELETE /api/collections` | `collectionController` | `collectionService` | Authenticated owner | Collection list or updated collection |
| Seal Future Self letter | Future Self | Entry data and unlock date | `FutureLetter`, `JournalEntry` | `POST /api/future-letters` | `futureLetterController.create` | `futureLetterService` | Authenticated owner | Sealed letter metadata |
| View Future Self letters | Future Self | Locked, unlocked, and reveal-safe fields | `FutureLetter` | `GET /api/future-letters` | `futureLetterController.list` | `futureLetterService` | Authenticated owner | Letter list with safe visibility state |
| Reveal a letter | Future Self | Letter identifier and server time | `FutureLetter`, `JournalEntry` | `GET /api/future-letters/:id` | `futureLetterController.reveal` | `futureLetterService` | Authenticated owner plus unlock check | Revealed letter or locked-state error |
| Monthly reflection | Insights | Month, entry statistics, optional observation | `Insight`, `JournalEntry` | `GET /api/insights/:periodMonth` | `insightController.getOrCreate` | `insightService` | Authenticated owner | Monthly insight |
| Archive export | Settings | User’s entries, collections, audio policy | All user-owned models | `POST /api/archive` | `archiveController.create` | `archiveService` | Authenticated owner, recent re-auth recommended | Export job or secure download metadata |
| Account removal | Settings danger zone | User identifier and confirmation | All user-owned models | `DELETE /api/users/me` | `userController.removeMe` | `userService` | Authenticated owner, recent re-auth required | Deletion confirmation |

## Contract conventions

Every client service should expect the same envelope. On success, return `{ success: true, data }`; on failure, return `{ success: false, code, message }`. Keep dates as ISO strings or document a different choice consistently. Use MongoDB ObjectId strings in API responses rather than exposing Mongoose internals.

The intentional architectural rule for Echoes is that **audio bytes are not journal documents**. `AudioAsset` should describe a private object-storage object, while `JournalEntry` references that metadata. The recording UI remains capable of a local preview while your upload infrastructure is unfinished.
