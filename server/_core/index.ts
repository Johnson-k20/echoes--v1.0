import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerMobileSessionRoutes } from "../mobile-session";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import multer from "multer";
import type { Request } from "express";
import { storagePut } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  // Multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: '/tmp/uploads',
      filename: (_req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  });

  // Ensure temp upload directory exists
  const { mkdirSync } = await import('fs');
  mkdirSync('/tmp/uploads', { recursive: true });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Auth middleware for upload endpoint
  const { COOKIE_NAME } = await import("../../shared/const");
  const { sdk } = await import("./sdk");

  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const cookie = req.cookies?.[COOKIE_NAME];
      const authHeader = req.headers?.authorization;
      const sessionToken = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);
      if (!sessionToken) return res.status(401).json({ error: 'Authentication required' });
      const session = await sdk.verifySession(sessionToken);
      if (!session) return res.status(401).json({ error: 'Invalid session' });
      // Look up user in DB by openId
      const { getUserByOpenId } = await import("../db");
      const user = await getUserByOpenId(session.openId);
      if (!user) return res.status(401).json({ error: 'User not found' });
      (req as any).userId = user.id;
      next();
    } catch {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // File upload endpoint (authenticated)
  app.post('/api/upload', requireAuth, upload.single('file'), async (req: Request & { file?: Express.Multer.File; userId?: number }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      const file = req.file;
      const userId = req.userId || 0;
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relKey = `echoes/${userId}/${Date.now()}-${safeName}`;
      const { readFileSync, unlink } = await import('fs');
      const fileBuffer = readFileSync(file.path);
      const { key, url } = await storagePut(relKey, fileBuffer, file.mimetype || 'audio/webm');
      // Cleanup temp file (fire-and-forget)
      unlink(file.path, () => {});
      res.json({ key, url });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerMobileSessionRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
