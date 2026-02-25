/**
 * Custom error classes for API route error handling.
 * Use with the response wrapper to return consistent error payloads.
 */

/** Base HTTP error with status code for API responses */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request", code?: string) {
    super(400, message, code);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, code ?? "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", code?: string) {
    super(403, message, code);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found", code?: string) {
    super(404, message, code ?? "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", code?: string) {
    super(409, message, code);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal server error", code?: string) {
    super(500, message, code ?? "INTERNAL_ERROR");
    this.name = "InternalServerError";
  }
}

/** Type guard: check if error is an HttpError */
export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}
