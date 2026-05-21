import csurf from "csurf";
import { NextFunction, Request, Response } from "express";
import { logError } from "@/lib/logger";

const isProduction = process.env.NODE_ENV === "production";

const createCsrfMiddleware = (valueExtractor: (req: Request) => string) =>
  csurf({
    cookie: {
      httpOnly: true, // Prevent access via JavaScript (mitigates XSS)
      secure: isProduction, // Only send over HTTPS in production
      sameSite: isProduction ? "none" : "lax", // Because frontend and backend are on different domains in production
    },
    value: valueExtractor,
  });

// CSRF middleware configuration
// It stocks the secret in an HttpOnly cookie and expects the token to be sent in the request header 'x-csrf-token'
export const csrfProtection = createCsrfMiddleware((req) => {
  // Read the token from X-CSRF-Token header
  return req.headers["x-csrf-token"] as string;
});

// CSRF middleware for SSE routes (accepts query param)
// EventSource cannot send custom headers, so we accept the token as a query parameter
export const csrfProtectionSSE = createCsrfMiddleware((req) => {
  // Try query parameter first for SSE routes, then fallback to header for regular routes
  return (
    (req.query.csrfToken as string) || (req.headers["x-csrf-token"] as string)
  );
});

// Endpoint to get the CSRF token
export function getCsrfToken(req: Request, res: Response) {
  res.json({ success: true, csrfToken: req.csrfToken() });
}

// Customised error handler for CSRF errors
export function csrfErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Only handle CSRF-specific errors here
  if ("code" in error && error.code === "EBADCSRFTOKEN") {
    logError(error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId,
    });
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token. Please refresh the page and try again.",
    });
  }
  next(error);
}
