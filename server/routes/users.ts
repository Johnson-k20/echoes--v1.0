import { Router } from "express";
import { notImplemented } from "./_notImplemented";

export const usersRouter = Router();

usersRouter.get("/me", notImplemented("Current user profile"));
usersRouter.patch("/me", notImplemented("Profile update"));
usersRouter.delete("/me", notImplemented("Account deletion"));
