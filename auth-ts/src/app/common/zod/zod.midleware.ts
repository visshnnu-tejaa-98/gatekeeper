import type { ZodType } from "zod";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ValidationError } from "../utils/api-error";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate: Record<string, any> = {};

    if ("body" in req) dataToValidate.body = req.body;
    if ("query" in req) dataToValidate.query = req.query;
    if ("params" in req) dataToValidate.params = req.params;
    if ("file" in req) dataToValidate.file = req.file;
    const result = await schema.safeParseAsync(dataToValidate);

    if (!result.success) {
      return next(new ValidationError(result.error.flatten().fieldErrors));
    }

    const validatedData = result.data as Record<string, any>;

    if (validatedData.body) req.body = validatedData.body;
    if (validatedData.params) req.params = validatedData.params;
    if (validatedData.file) req.file = validatedData.file;
    if (validatedData.query) {
      for (const key in req.query) {
        delete req.query[key];
      }
      Object.assign(req.query, result.data);
    }

    return next();
  };
};
