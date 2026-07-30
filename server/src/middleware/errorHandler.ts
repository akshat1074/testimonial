import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Wraps an async route handler so rejected promises reach errorHandler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Must have 4 args for Express to recognize this as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

/**
 * Every Supabase call in this app follows the same shape: `{ data, error }`.
 * This turns "if (error) throw new ApiError(500, msg)" into one line and,
 * critically, always logs the *real* error server-side first — without
 * this, a wrong Supabase key or a table that doesn't exist yet just shows
 * up as an opaque 500 with no way to tell why from the browser.
 */
export function assertNoSupabaseError(
  error: { message: string } | null,
  clientMessage: string
): asserts error is null {
  if (error) {
    console.error(`${clientMessage}:`, error.message);
    throw new ApiError(500, clientMessage);
  }
}