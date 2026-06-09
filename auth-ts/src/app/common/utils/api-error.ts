class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: any;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = "",
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(details?: any) {
    super(400, "Validation Error", "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource Not Found") {
    super(404, message, "NOT_FOUND");
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN");
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message, "BAD_REQUEST");
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message, "CONFLICT");
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(500, message, "INTERNAL_SERVER_ERROR");
  }
}

export default ApiError;
