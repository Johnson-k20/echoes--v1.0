import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const insightsRouter = Router();

insightsRouter.get("/:periodMonth", notImplemented("Monthly insight generation and retrieval"));
