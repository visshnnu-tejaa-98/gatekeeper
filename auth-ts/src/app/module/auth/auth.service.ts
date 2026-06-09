import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/utils/api-error";
import {
  AccessTokenPayload,
  generateAccessToken,
  generateRandomString,
  generateRefeshToken,
  generateResetToken,
  generateSalt,
  generateVerifyEmailToken,
  hash,
  hashToken,
  verifyEmailToken,
  verifyResetToken,
} from "../../common/utils/jwt";
import {
  addNewShortCode,
  checkUserWithEmailExists,
  getUserByEmailVerifyToken,
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
import { USER } from "../../common/constants";
import { env } from "../../common/zod/env";
import path from "node:path";
import { fileUpload } from "../../common/utils/imagekit";

const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const userExists = await checkUserWithEmailExists(email);

  if (userExists)
    throw new ConflictError(
      `User with given ${email} already exists, please try login`,
    );

  const salt = await generateSalt(10);
  const hashedPassword = await hash(password, salt);

  const verificationToken = generateVerifyEmailToken({ email, role: USER });
  const hashedVerificationToken = hashToken(verificationToken);

  const [user] = await insertUser({
    name,
    email,
    password: hashedPassword,
    verificationToken: hashedVerificationToken,
  });

  if (!user) {
    throw new BadRequestError("User creation failed");
  }

  const claims: AccessTokenPayload = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: user.id.toString(),
    email: user.email,
    email_verified: user.isEmailVerified ?? false,
    name: user.name,
    picture: user.avatar ?? "",
    role: user.role,
  };

  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefeshToken({ id: user?.id!, role: USER });
  const hashedRefreshToken = hashToken(refreshToken);

  const updatedUser = await updateUserWithRefreshToken(
    hashedRefreshToken,
    email,
  );

  // await sendVerificationEmail(email, verificationToken);

  return { id: user?.id, accessToken };
};

const verifyEmail = async ({ token }: { token: string }) => {
  const hashedToken = hashToken(token);
  const user = await getUserByEmailVerifyToken(hashedToken);
  const decoded = verifyEmailToken(token) as JwtPayload;

  if (user.email !== decoded.email)
    throw new BadRequestError("Token Expired or Invalid token");
  const updatedUser = await updateUserAfterEmailVerification(decoded.email);

  return updatedUser;
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

  const claims: AccessTokenPayload = {
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
  const shortCode = generateRandomString(3);
  const createdShortCode = await addNewShortCode({
    shortCode,
    userId: user.id,
    clientId,
  });

  return {
    shortCode,
    createdShortCode,
  };
};

const logout = async () => {
  const status = await logoutUser();
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
    // console.log()
    // const fileName = `${Date.now()}-${Math.random() * 1e9}${path.extname(file?.originalname!)}`;
    const fileName = Date.now().toString();

    const response = await fileUpload(file?.buffer!, fileName);

    if (!response.url) {
      throw new BadRequestError("something went wrong in file upload");
    }

    const updatedUser = await uploadAvatarInDB(userId, response.url);

    return updatedUser;
  } catch (error) {
    console.error(111, error);
    throw new BadRequestError("Something went wrong in file upload 222");
  }
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
};
