import mongoose from "mongoose";

/** Metadata-only audio asset schema stub. Never store recording bytes in MongoDB. */
export const audioAssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  key: String,
  url: String,
  contentType: String,
  originalName: String,
  sizeBytes: Number,
  storageProvider: String,
}, { timestamps: true });

// TODO: Select object storage, create a private upload flow, and register the model.
