import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { NotFoundError } from "./api-error";
import { env } from "../zod/env";
import { StringValue } from "ms";
import { createHash, randomBytes, randomUUID } from "node:crypto";

type ConsentTokenPayload = {
  sub: string;
  clientId: string;
  type: string;
  iat: number;
  exp: number;
};

type AccessTokenClaims = {
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  role: string;
};

type AccessTokenPayload = AccessTokenClaims & {
  jti: string;
  exp: number;
  iat: number;
};

const generateSalt = async (rounds: number) => {
  return await bcrypt.genSalt(rounds);
};

const generateRandomString = (bytes: number) =>
  randomBytes(bytes).toString("hex");

const hash = async (payload: string, salt: string) => {
  return await bcrypt.hash(payload, salt);
};

const hashToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

const generateVerifyEmailToken = ({
  email,
  role,
}: {
  email: string;
  role: string;
}) => {
  const payload = { email, role };
  const secret = env.JWT_VERIFY_TOKEN_SECRET;
  const expiresIn = env.JWT_VERIFY_TOKEN_EXPIRES || "5m";
  if (!secret)
    throw new NotFoundError(
      "Error While generating email verification token - JWT_SECRET_NOTFOUND",
    );

  if (!expiresIn)
    throw new NotFoundError(
      "Error While generating email verification token - JWT_SECRET_NOTFOUND",
    );
  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  };
  return jwt.sign(payload, secret, options);
};

const verifyEmailToken = (token: string) => {
  const secret = env.JWT_VERIFY_TOKEN_SECRET;
  return jwt.verify(token, secret);
};

const generateAccessToken = (payload: AccessTokenClaims) => {
  const secret = env.JWT_ACCESS_TOKEN_SECRET;
  const expiresIn = env.JWT_ACCESS_TOKEN_EXPIRES || "15m";
  if (!secret)
    throw new NotFoundError(
      "Error While generating access token - JWT_SECRET_NOTFOUND",
    );

  if (!expiresIn)
    throw new NotFoundError(
      "Error While generating access expiry token - JWT_SECRET_NOTFOUND",
    );
  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
    jwtid: randomUUID(),
  };
  return jwt.sign(payload, secret, options);
};

const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = env.JWT_ACCESS_TOKEN_SECRET;
  return jwt.verify(token, secret) as AccessTokenPayload;
};

const generateRefeshToken = ({ id, role }: { id: string; role: string }) => {
  const payload = { id, role };
  const secret = env.JWT_REFRESH_TOKEN_SECRET;
  const expiresIn = env.JWT_REFRESH_TOKEN_EXPIRES || "15m";
  if (!secret)
    throw new NotFoundError(
      "Error While generating access token - JWT_SECRET_NOTFOUND",
    );

  if (!expiresIn)
    throw new NotFoundError(
      "Error While generating access expiry token - JWT_SECRET_NOTFOUND",
    );
  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  };
  return jwt.sign(payload, secret, options);
};

const verifyRefreshToken = (token: string) => {
  const secret = env.JWT_REFRESH_TOKEN_SECRET;
  return jwt.verify(token, secret);
};

const generateResetToken = ({ id, role }: { id: string; role: string }) => {
  const payload = { id, role };
  const secret = env.JWT_RESET_TOKEN_SECRET;
  const expiresIn = env.JWT_RESET_TOKEN_EXPIRES || "15m";
  if (!secret)
    throw new NotFoundError(
      "Error While generating access token - JWT_SECRET_NOTFOUND",
    );

  if (!expiresIn)
    throw new NotFoundError(
      "Error While generating access expiry token - JWT_SECRET_NOTFOUND",
    );
  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  };
  return jwt.sign(payload, secret, options);
};

const verifyResetToken = (token: string) => {
  const secret = env.JWT_RESET_TOKEN_SECRET;
  return jwt.verify(token, secret);
};

const generateConsentToken = ({
  userId,
  clientId,
}: {
  userId: string;
  clientId: string;
}) => {
  const payload = { sub: userId, clientId, type: "consent" };
  const secret = env.JWT_CONSENT_TOKEN_SECRET;
  const expiresIn = env.JWT_CONSENT_TOKEN_EXPIRES || "5m";
  const options: SignOptions = { expiresIn: expiresIn as StringValue };

  return jwt.sign(payload, secret, options);
};

const verifyConsentToken = (token: string): ConsentTokenPayload => {
  const secret = env.JWT_CONSENT_TOKEN_SECRET;
  return jwt.verify(token, secret) as ConsentTokenPayload;
};

export {
  generateSalt,
  generateRandomString,
  hash,
  hashToken,
  generateVerifyEmailToken,
  verifyEmailToken,
  generateAccessToken,
  verifyAccessToken,
  generateRefeshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  generateConsentToken,
  verifyConsentToken,
};

export type { AccessTokenClaims, AccessTokenPayload, ConsentTokenPayload };
