import type { ZodType } from "zod";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ValidationError } from "../utils/api-error";

export const validate = (
  schema: ZodType,
  source: "body" | "params" | "query" | "file" = "body",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req[source]);
    if (!result.success) {
      next(new ValidationError(result.error.flatten().fieldErrors));
      return;
    }
    if (source === "query") {
      for (const key in req.query) {
        delete req.query[key];
      }
      Object.assign(req.query, result.data);
    } else {
      req[source] = result.data;
    }
    next();
  };
};
