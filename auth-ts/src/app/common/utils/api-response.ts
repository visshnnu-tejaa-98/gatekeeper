import type { Response } from "express";

class ApiResponse {
  static success(res: Response, message: string = "Success", data: any = {}) {
    return res.status(200).json({ success: true, message, data });
  }

  static created(res: Response, message: string, data: any = null) {
    return res.status(201).json({ success: true, message, data });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    meta?: Record<string, string>,
  ) {
    const details = {
      code: meta?.code || "",
      error: meta?.errorMessage || "",
    };

    return res.status(statusCode).json({ message, details });
  }
}

export default ApiResponse;
