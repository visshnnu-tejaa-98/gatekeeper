import { and, eq } from "drizzle-orm";
import db from "../../../db";
import {
  applicationsTable,
  shortCodesTable,
  usersTable,
} from "../../../db/schema";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../common/utils/api-error";

type InsertUserServicePayload = {
  name: string;
  email: string;
  password: string;
};

type UserLookup =
  | {
      email: string;
      id?: never;
    }
  | {
      id: string;
      email?: never;
    };

type UserUpdatePayload = Partial<typeof usersTable.$inferInsert>;

type addNewShortCodeProps = {
  userId: string;
  clientId: string;
  shortCode: string;
};

const checkUserWithEmailExists = async (email: string) => {
  const userExists = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (userExists.length === 0) return null;
  return userExists[0];
};

const insertUser = async ({
  name,
  email,
  password,
}: InsertUserServicePayload) => {
  const userId = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password,
      updatedAt: new Date(),
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      avatar: usersTable.avatar,
    });
  return userId;
};

const getUserByEmailVerifyToken = async (token: string) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.verificationToken, token));
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const updateUserAfterEmailVerification = async (email: string) => {
  const updatedUsers = await db
    .update(usersTable)
    .set({ isVerified: true, verificationToken: null })
    .where(eq(usersTable.email, email))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      isVerified: usersTable.isVerified,
    });

  if (updatedUsers.length === 0) throw new BadRequestError();
  const updatedUser = updatedUsers[0];
  if (!updatedUser) throw new NotFoundError("User not found");
  return updatedUser;
};

const updateUserWithRefreshToken = async (
  refreshToken: string,
  email: string,
) => {
  const users = await db
    .update(usersTable)
    .set({ refreshToken })
    .where(eq(usersTable.email, email))
    .returning({ id: usersTable.id });

  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const logoutUser = async (userId: string) => {
  try {
    await db
      .update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, userId));
  } catch (err) {
    throw new BadRequestError("Failed to logout the user");
  }
  return true;
};

const updateUserWithResetToken = async (resetToken: string, email: string) => {
  const users = await db
    .update(usersTable)
    .set({ resetToken })
    .where(eq(usersTable.email, email))
    .returning({ id: usersTable.id, resetToken: usersTable.resetToken });
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const getUserByResetToken = async (token: string) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.resetToken, token));
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const updateUserWithNewPassword = async (password: string, email: string) => {
  const users = await db
    .update(usersTable)
    .set({ password })
    .where(eq(usersTable.email, email))
    .returning({ id: usersTable.id });
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const getUserDetailsByUserId = async (id: string) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isEmailVerified: usersTable.isVerified,
      avatar: usersTable.avatar,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id));
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const uploadAvatarInDB = async (userId: string, avatarUrl: string) => {
  const users = await db
    .update(usersTable)
    .set({ avatar: avatarUrl })
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id, avatarUrl: usersTable.avatar });

  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const updateUserInfo = async (
  lookup: UserLookup,
  payload: UserUpdatePayload,
) => {
  const condition =
    lookup.id ?
      eq(usersTable.id, lookup.id)
    : eq(usersTable.email, lookup.email!);

  const updateUsers = await db
    .update(usersTable)
    .set(payload)
    .where(condition)
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      isVerified: usersTable.isVerified,
      resetToken: usersTable.resetToken,
      avatarUrl: usersTable.avatar,
    });

  if (updateUsers.length === 0) throw new BadRequestError();

  const updatedUser = updateUsers[0];
  if (!updatedUser) throw new NotFoundError("User not found");
  return updatedUser;
};

const addNewShortCode = async (props: addNewShortCodeProps) => {
  const { userId, clientId, shortCode } = props;
  const existingShortCodes = await db
    .select({
      shortCodeId: shortCodesTable.id,
      userId: shortCodesTable.userId,
      shortcode: shortCodesTable.shortcode,
      clientId: shortCodesTable.clientId,
    })
    .from(shortCodesTable)
    .where(
      and(
        eq(shortCodesTable.userId, userId),
        eq(shortCodesTable.clientId, clientId),
      ),
    )
    .limit(1);

  const existingShortCode = existingShortCodes[0] || null;

  if (!existingShortCode) {
    const newShortCode = await db
      .insert(shortCodesTable)
      .values({ shortcode: shortCode, userId, clientId })
      .returning({ shortCode: shortCodesTable.shortcode });

    if (!newShortCode || newShortCode.length === 0) {
      throw new NotFoundError("Error creating a new shortcode");
    }
    return newShortCode[0];
  }

  const updatedRows = await db
    .update(shortCodesTable)
    .set({ shortcode: shortCode })
    .where(eq(shortCodesTable.id, existingShortCode.shortCodeId))
    .returning({ shortCode: shortCodesTable.shortcode });

  if (!updatedRows || updatedRows.length === 0) {
    throw new NotFoundError("Error updating the existing shortcode");
  }

  return updatedRows[0];
};

const getRedirectUriByClientId = async (clientId: string) => {
  const redirectUris = await db
    .select({ redirectUri: applicationsTable.redirectUri })
    .from(applicationsTable)
    .where(eq(applicationsTable.clientId, clientId));
  if (redirectUris.length === 0) throw new BadRequestError();
  const redirectUri = redirectUris[0];
  if (!redirectUri) throw new NotFoundError("RedirectUri not found");
  return redirectUri;
};

const getUserByRefreshToken = async (hashedToken: string) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      avatar: usersTable.avatar,
      isVerified: usersTable.isVerified,
    })
    .from(usersTable)
    .where(eq(usersTable.refreshToken, hashedToken));

  if (users.length === 0) throw new UnauthorizedError("Invalid refresh token");
  const user = users[0];
  if (!user) throw new UnauthorizedError("Invalid refresh token");
  return user;
};

export {
  checkUserWithEmailExists,
  insertUser,
  getUserByEmailVerifyToken,
  updateUserAfterEmailVerification,
  updateUserWithRefreshToken,
  logoutUser,
  updateUserWithResetToken,
  getUserByResetToken,
  updateUserWithNewPassword,
  getUserDetailsByUserId,
  uploadAvatarInDB,
  updateUserInfo,
  addNewShortCode,
  getRedirectUriByClientId,
  getUserByRefreshToken,
};
