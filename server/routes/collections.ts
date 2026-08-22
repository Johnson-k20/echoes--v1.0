import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const collectionsRouter = Router();

collectionsRouter.get("/", notImplemented("Collection listing"));
collectionsRouter.post("/", notImplemented("Collection creation"));
collectionsRouter.patch("/:id", notImplemented("Collection update"));
collectionsRouter.delete("/:id", notImplemented("Collection deletion"));
