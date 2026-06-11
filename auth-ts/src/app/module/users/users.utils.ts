import { eq } from "drizzle-orm";
import db from "../../../db";
import { usersTable } from "../../../db/schema";
import { NotFoundError } from "../../common/utils/api-error";
import { ALLOWED_ROLES } from "../../common/constants";

type AllowedRole = (typeof ALLOWED_ROLES)[number];

const SAFE_USER_FIELDS = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  role: usersTable.role,
  avatar: usersTable.avatar,
  isVerified: usersTable.isVerified,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
};

const getAllUsers = async () => {
  return await db.select(SAFE_USER_FIELDS).from(usersTable);
};

const getUserById = async (userId: string) => {
  const users = await db
    .select(SAFE_USER_FIELDS)
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (users.length === 0) throw new NotFoundError("User not found");
  return users[0]!;
};

const updateUserById = async (
  userId: string,
  data: { name?: string; email?: string; role?: AllowedRole },
) => {
  const updated = await db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning(SAFE_USER_FIELDS);

  if (updated.length === 0) throw new NotFoundError("User not found");
  return updated[0]!;
};

const deleteUserById = async (userId: string) => {
  const deleted = await db
    .delete(usersTable)
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  if (deleted.length === 0) throw new NotFoundError("User not found");
  return deleted[0]!;
};

export { getAllUsers, getUserById, updateUserById, deleteUserById };
