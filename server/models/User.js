import mongoose from "mongoose";

/** Mongoose schema stub — intentionally not registered as a model yet. */
export const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

// TODO: Decide required fields, normalization, unique indexes, and only then
// export mongoose.model("User", userSchema).
