import { eq } from "drizzle-orm";
import db from "../../../db";
import { usersTable } from "../../../db/schema";
import { BadRequestError, NotFoundError } from "../../common/utils/api-error";

type InsertUserServicePayload = {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
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
  verificationToken,
}: InsertUserServicePayload) => {
  const userId = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password,
      verificationToken,
      updatedAt: new Date(),
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      isEmailVerified: usersTable.isVerified,
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

const logoutUser = async () => {
  try {
    await db.update(usersTable).set({ refreshToken: null });
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

  console.log({ users });
  if (users.length === 0) throw new BadRequestError();
  const user = users[0];
  if (!user) throw new NotFoundError("User not found");
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
};
