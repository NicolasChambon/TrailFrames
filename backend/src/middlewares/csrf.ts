import csurf from "csurf";
import { NextFunction, Request, Response } from "express";
import { logError } from "@/lib/logger";

const isProduction = process.env.NODE_ENV === "production";

// CSRF middleware configuration
// It stocks the secret in an HttpOnly cookie and expects the token to be sent in the request header 'x-csrf-token'
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  },
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
  next: NextFunction
) {
  logError(error, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
  });

  if ("code" in error && error.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token. Please refresh the page and try again.",
    });
  }
  next(error);
}
