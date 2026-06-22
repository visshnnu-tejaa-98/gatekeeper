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
    // Soft auth: if a valid token is present, attach req.user. Anything wrong
    // with the token (missing, malformed, expired, revoked) → silently leave
    // req.user unset and let per-route guards decide. This keeps public
    // endpoints (register/login/etc.) reachable even when the client holds a
    // stale token in storage.
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer")) return next();

      const token = authHeader.split(" ")[1];
      if (!token) return next();

      const user = verifyAccessToken(token);
      if (!user) return next();

      if (user.jti && (await isTokenRevoked(user.jti))) return next();

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
      return next();
    } catch {
      return next();
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
