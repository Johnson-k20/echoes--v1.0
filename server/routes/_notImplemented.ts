import type { RequestHandler } from "express";

/**
 * The MERN learning laboratory intentionally stops at the route boundary.
 * Replace this handler one feature at a time as you learn controllers,
 * Mongoose queries, ownership checks, validation, and error handling.
 */
export function notImplemented(feature: string): RequestHandler {
  return (_request, response) => {
    response.status(501).json({
      success: false,
      code: "NOT_IMPLEMENTED",
      message: `${feature} is intentionally unfinished in this Echoes learning laboratory. See BACKEND_ROADMAP.md.`,
    });
  };
}
