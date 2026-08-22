import mongoose from "mongoose";

/** Core voice-journal schema stub — no model or queries are implemented. */
export const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  audioAssetId: { type: mongoose.Schema.Types.ObjectId, ref: "AudioAsset" },
  audioKey: String,
  audioUrl: String,
  transcript: String,
  durationSec: Number,
  mood: String,
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  ambience: String,
  title: String,
  mode: { type: String, enum: ["vault", "future_self"], default: "vault" },
  sealDate: Date,
  unlockDate: Date,
  encryptedAudioKey: String,
  encrypted: { type: Boolean, default: false },
}, { timestamps: true });

// TODO: Design indexes and authorization-aware queries before registering this model.
