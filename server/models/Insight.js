import mongoose from "mongoose";

/** Monthly reflection schema stub — no aggregate or AI generation is included. */
export const insightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  periodMonth: String,
  topWords: [String],
  avgDurationSec: Number,
  generatedObservation: String,
}, { timestamps: true });

// TODO: Build the data aggregation first, then add an optional AI service boundary.
