import type { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../common/utils/api-error";
import { verifyAccessToken } from "../../common/utils/jwt";

interface AuthUser {
  iss: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  role: string;
}
declare global {
  namespace Express {
    interface Request {
      user: AuthUser | JwtPayload;
    }
  }
}

const authenticate = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return next();
    if (!authHeader?.startsWith("Bearer")) {
      throw new UnauthorizedError("Invalid Authorization header format");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token not provided");
    }
    const user = verifyAccessToken(token);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const { iss, sub, email, email_verified, name, picture, role } = user;
    req.user = { iss, sub, email, email_verified, name, picture, role };

    next();
  };
};

const restrictToAuthenticatedUser = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError("Authentication Required");
    return next();
  };
};

const adminOnly = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication Required");
    }

    if (req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required");
    }
    next();
  };
};

const superAdminOnly = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication Required");
    }

    if (req.user.role !== "superAdmin") {
      throw new UnauthorizedError("Super Admin access required");
    }
    next();
  };
};

export { authenticate, restrictToAuthenticatedUser, adminOnly, superAdminOnly };
