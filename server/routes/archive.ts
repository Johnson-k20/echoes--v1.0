import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const archiveRouter = Router();

archiveRouter.post("/", notImplemented("Archive export"));
