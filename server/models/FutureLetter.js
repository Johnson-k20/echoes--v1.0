import mongoose from "mongoose";

/** Future Self scheduling stub — decide whether this remains separate or is
 * embedded in JournalEntry before adding controllers. */
export const futureLetterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  journalEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "JournalEntry" },
  sealDate: Date,
  unlockDate: Date,
  status: { type: String, enum: ["sealed", "unlocked"] },
}, { timestamps: true });

// TODO: Enforce unlock checks server-side and define a safe reveal workflow.
