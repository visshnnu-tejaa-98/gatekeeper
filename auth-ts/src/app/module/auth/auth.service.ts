import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/utils/api-error";
import {
  AccessTokenClaims,
  generateAccessToken,
  generateConsentToken,
  generateRefeshToken,
  generateResetToken,
  generateSalt,
  generateVerifyEmailToken,
  hash,
  hashToken,
  verifyEmailToken,
  verifyRefreshToken,
  verifyResetToken,
} from "../../common/utils/jwt";
import {
  checkUserWithEmailExists,
  getUserByEmailVerifyToken,
  getUserByRefreshToken,
  getUserByResetToken,
  getUserDetailsByUserId,
  insertUser,
  logoutUser,
  updateUserAfterEmailVerification,
  updateUserInfo,
  updateUserWithNewPassword,
  updateUserWithRefreshToken,
  updateUserWithResetToken,
  uploadAvatarInDB,
} from "./auth.utils";
import { DEVELOPMENT, FIXED_SCOPES, USER } from "../../common/constants";
import { env } from "../../common/zod/env";
import { fileUpload } from "../../common/utils/imagekit";
import {
  getApplicationByClientId,
  insertRevokedToken,
} from "../oidc/oidc.utils";
import { sendVerificationEmail } from "../../common/config/nodemailer";

type LogoutProps = {
  userId: string;
  jti: string;
  exp: number;
};

const register = async ({
  name,
  email,
  password,
  clientId,
}: {
  name: string;
  email: string;
  password: string;
  clientId: string;
}) => {
  const userExists = await checkUserWithEmailExists(email);

  if (userExists)
    throw new ConflictError(
      `User with given ${email} already exists, please try login`,
    );

  const salt = await generateSalt(10);
  const hashedPassword = await hash(password, salt);

  const [user] = await insertUser({
    name,
    email,
    password: hashedPassword,
  });

  if (!user) {
    throw new BadRequestError("User creation failed");
  }

  const claims: AccessTokenClaims = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: user.id.toString(),
    email: user.email,
    email_verified: true,
    name: user.name,
    picture: user.avatar ?? "",
    role: user.role,
  };

  if (!clientId) {
    const accessToken = generateAccessToken(claims);
    const refreshToken = generateRefeshToken({ id: user?.id!, role: USER });
    const hashedRefreshToken = hashToken(refreshToken);

    const updatedUser = await updateUserWithRefreshToken(
      hashedRefreshToken,
      email,
    );
    return { id: user?.id, accessToken };
  }
  const { name: applicationName } = await getApplicationByClientId(clientId);
  const consentToken = generateConsentToken({ userId: user.id, clientId });

  return {
    consentToken,
    applicationName,
    scopes: FIXED_SCOPES,
  };
};

const verifyUserEmailRequest = async (email: string) => {
  const verificationToken = generateVerifyEmailToken({ email, role: USER });
  const hashedVerificationToken = hashToken(verificationToken);

  const updatedUser = await updateUserInfo(
    { email },
    { verificationToken: hashedVerificationToken },
  );

  await sendVerificationEmail(email, verificationToken);

  if (env.NODE_ENV !== DEVELOPMENT) return {};

  return {
    emailVerificationToken: verificationToken,
  };
};

const verifyEmail = async ({ token }: { token: string }) => {
  const hashedToken = hashToken(token);
  const user = await getUserByEmailVerifyToken(hashedToken);
  const decoded = verifyEmailToken(token) as JwtPayload;

  if (user.email !== decoded.email)
    throw new BadRequestError("Token Expired or Invalid token");
  const updatedUser = await updateUserAfterEmailVerification(decoded.email);

  // Re-issue tokens so the JWT now carries email_verified: true. Without this
  // the user keeps their old token (email_verified: false) until it expires.
  const claims: AccessTokenClaims = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: user.id.toString(),
    email: user.email,
    email_verified: true,
    name: user.name,
    picture: user.avatar ?? "",
    role: user.role,
  };
  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefeshToken({ id: user.id, role: user.role });
  const hashedRefreshToken = hashToken(refreshToken);
  await updateUserWithRefreshToken(hashedRefreshToken, user.email);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    isVerified: updatedUser.isVerified,
    accessToken,
    refreshToken,
  };
};

const login = async ({
  email,
  password,
  clientId,
}: {
  email: string;
  password: string;
  clientId?: string | undefined;
}) => {
  const user = await checkUserWithEmailExists(email);

  if (!user) throw new UnauthorizedError("Invalid email or password");

  const result =
    user.password && (await bcrypt.compare(password, user.password));

  if (!result) throw new UnauthorizedError("Invalid email or password");

  const claims: AccessTokenClaims = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: user.id.toString(),
    email: user.email,
    email_verified: user.isVerified ?? false,
    name: user.name,
    picture: user.avatar ?? "",
    role: user.role,
  };

  if (!clientId) {
    const accessToken = generateAccessToken(claims);
    const refreshToken = generateRefeshToken({ id: user.id, role: user.role });
    const hashedRefreshToken = hashToken(refreshToken);

    const updatedUser = await updateUserWithRefreshToken(
      hashedRefreshToken,
      email,
    );

    return {
      id: updatedUser.id,
      accessToken,
    };
  }
  const { name: applicationName } = await getApplicationByClientId(clientId);
  const consentToken = generateConsentToken({ userId: user.id, clientId });

  return {
    consentToken,
    applicationName,
    scopes: FIXED_SCOPES,
  };
};

const logout = async ({ userId, jti, exp }: LogoutProps) => {
  await insertRevokedToken(jti, new Date(exp * 1000));
  const status = await logoutUser(userId);
  return status;
};

const profile = async (id: string) => {
  const user = await getUserDetailsByUserId(id);
  return user;
};

const forgot = async ({ email }: { email: string }) => {
  const user = await checkUserWithEmailExists(email);

  if (!user)
    throw new NotFoundError(`User with given email ${email} not found`);

  const resetToken = generateResetToken({ id: user.id, role: user.role });
  const hashedResetToken = hashToken(resetToken);
  await updateUserWithResetToken(hashedResetToken, user.email);

  if (env.NODE_ENV !== DEVELOPMENT) return {};

  return {
    resetToken,
  };
};

const resetUserPassword = async ({
  password,
  token,
}: {
  password: string;
  token: string;
}) => {
  const hashedToken = hashToken(token);
  const user = await getUserByResetToken(hashedToken);
  const decoded = verifyResetToken(token) as JwtPayload;

  if (user.id !== decoded.id)
    throw new BadRequestError("Token Expired or Invalid token");

  const salt = await generateSalt(10);
  const hashedPassword = await hash(password, salt);

  const updatedUser = await updateUserWithNewPassword(
    hashedPassword,
    user.email,
  );

  return updatedUser;
};

const uploadAvatar = async (userId: string, file: Express.Multer.File) => {
  try {
    // const fileName = `${Date.now()}-${Math.random() * 1e9}${path.extname(file?.originalname!)}`;
    const fileName = Date.now().toString();

    const response = await fileUpload(file?.buffer!, fileName);

    if (!response.url) {
      throw new BadRequestError("something went wrong in file upload");
    }

    const updatedUser = await uploadAvatarInDB(userId, response.url);

    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Something went wrong in file upload 222");
  }
};

const refreshUserToken = async (incomingRefreshToken: string) => {
  const hashedToken = hashToken(incomingRefreshToken);
  const user = await getUserByRefreshToken(hashedToken);

  // Verify JWT validity (throws if expired or tampered)
  verifyRefreshToken(incomingRefreshToken);

  const claims: AccessTokenClaims = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: user.id.toString(),
    email: user.email,
    email_verified: user.isVerified ?? false,
    name: user.name,
    picture: user.avatar ?? "",
    role: user.role,
  };

  const newAccessToken = generateAccessToken(claims);
  const newRefreshToken = generateRefeshToken({ id: user.id, role: user.role });
  const hashedNewRefreshToken = hashToken(newRefreshToken);

  await updateUserWithRefreshToken(hashedNewRefreshToken, user.email);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export {
  register,
  verifyEmail,
  login,
  logout,
  profile,
  forgot,
  resetUserPassword,
  uploadAvatar,
  verifyUserEmailRequest,
  refreshUserToken,
};
