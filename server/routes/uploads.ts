import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const uploadsRouter = Router();

// Do not put audio bytes in MongoDB. Choose and configure an object-storage
// provider yourself, then persist only AudioAsset metadata in MongoDB.
uploadsRouter.post("/", notImplemented("Audio upload and object storage"));
