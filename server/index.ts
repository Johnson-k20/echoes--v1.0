import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { archiveRouter } from "./routes/archive";
import { authRouter } from "./routes/auth";
import { collectionsRouter } from "./routes/collections";
import { futureLettersRouter } from "./routes/futureLetters";
import { insightsRouter } from "./routes/insights";
import { journalEntriesRouter } from "./routes/journalEntries";
import { uploadsRouter } from "./routes/uploads";
import { usersRouter } from "./routes/users";

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

app.use(cors({ origin: clientUrl }));
app.use(bodyParser.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    data: {
      status: "learning-scaffold",
      message: "Echoes Express routes are intentionally incomplete. Read BACKEND_ROADMAP.md.",
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/journal-entries", journalEntriesRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/future-letters", futureLettersRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/archive", archiveRouter);

app.use("/api", (_request, response) => {
  response.status(404).json({
    success: false,
    code: "API_ROUTE_NOT_FOUND",
    message: "This API route has not been scaffolded yet.",
  });
});

if (process.env.NODE_ENV === "production") {
  const currentFile = fileURLToPath(import.meta.url);
  const publicDirectory = path.resolve(path.dirname(currentFile), "public");
  app.use(express.static(publicDirectory));
  app.get("*", (_request, response) => response.sendFile(path.join(publicDirectory, "index.html")));
}

const port = Number(process.env.PORT || 5000);

if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
  app.listen(port, () => {
    console.info(`Echoes learning API listening on port ${port}`);
  });
}

export { app };
