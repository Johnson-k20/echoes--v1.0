import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const futureLettersRouter = Router();

// A learner must enforce the unlock date on the server, not merely in React.
futureLettersRouter.get("/", notImplemented("Future letter listing"));
futureLettersRouter.get("/:id", notImplemented("Future letter reveal"));
futureLettersRouter.post("/", notImplemented("Future letter sealing"));
