import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const journalEntriesRouter = Router();

// Keep these paths aligned with client/src/services/journalService.ts.
journalEntriesRouter.post("/transcribe", notImplemented("Audio transcription"));
journalEntriesRouter.post("/suggest-metadata", notImplemented("AI metadata suggestion"));
journalEntriesRouter.get("/", notImplemented("Journal entry listing"));
journalEntriesRouter.post("/", notImplemented("Journal entry creation"));
journalEntriesRouter.get("/:id", notImplemented("Journal entry lookup"));
journalEntriesRouter.patch("/:id", notImplemented("Journal entry update"));
journalEntriesRouter.delete("/:id", notImplemented("Journal entry deletion"));
