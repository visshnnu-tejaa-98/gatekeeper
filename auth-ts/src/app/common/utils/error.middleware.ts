import { NextFunction, Request, Response } from "express";

export const errorMiddleWare = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";

  const isProduction = process.env.NODE_ENV === "production";
  const isServerError = statusCode >= 500;

  const response = {
    message: isProduction && isServerError ? "Internal Server Error" : message,
    details: {
      code: errorCode,
      error:
        isProduction && isServerError ?
          "An unexpected error occurred"
        : (err.details ?? err.stack ?? message),
    },
  };

  res.status(statusCode).json(response);
};
