export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Invalid input payload or query parameters", details?: any) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required. Please provide a valid Bearer token.") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Access denied. Insufficient permissions or account suspended.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "The requested resource was not found.") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "A resource conflict occurred. Unique constraint failed.") {
    super(409, "RESOURCE_CONFLICT", message);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message = "Unprocessable entity. Business rule or state transition failed.") {
    super(422, "UNPROCESSABLE_ENTITY", message);
  }
}
