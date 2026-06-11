import type { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../common/utils/api-error";
import { verifyAccessToken } from "../../common/utils/jwt";
import { ADMIN, SUPER_ADMIN } from "../../common/constants";
import { isTokenRevoked } from "../oidc/oidc.utils";

interface AuthUser {
  iss: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  role: string;
  jti: string;
  exp: number;
}
declare global {
  namespace Express {
    interface Request {
      user: AuthUser | JwtPayload;
    }
  }
}

const authenticate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      if (user.jti && (await isTokenRevoked(user.jti))) {
        throw new UnauthorizedError("Token has been revoked");
      }

      const { iss, sub, email, email_verified, name, picture, role, jti, exp } =
        user;

      req.user = {
        iss,
        sub,
        email,
        email_verified,
        name,
        picture,
        role,
        jti,
        exp,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

const restrictToAuthenticatedUser = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError("Authentication Required");
    return next();
  };
};

const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication Required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError(
        "You do not have permission to perform this action",
      );
    }
    next();
  };
};

export { authenticate, restrictToAuthenticatedUser, restrictTo };
