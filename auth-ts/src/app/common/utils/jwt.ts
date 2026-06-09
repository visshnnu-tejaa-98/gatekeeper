import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { NotFoundError } from "./api-error";
import { env } from "../zod/env";
import { StringValue } from "ms";
import { createHash, randomBytes } from "node:crypto";

type AccessTokenPayload = {
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  role: string;
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

const generateAccessToken = (payload: AccessTokenPayload) => {
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
};

export type { AccessTokenPayload };
