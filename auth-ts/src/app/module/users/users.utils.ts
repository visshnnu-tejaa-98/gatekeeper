import { eq, inArray, or } from "drizzle-orm";
import db from "../../../db";
import {
  usersTable,
  applicationsTable,
  shortCodesTable,
  authorizationCodesTable,
} from "../../../db/schema";
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

/**
 * Delete a user along with every record that references them via FK:
 *   - authorization_codes by userId OR by clientId of their applications
 *   - shortcodes by userId OR by clientId of their applications
 *   - applications they own
 *   - the user row itself
 * Runs as a single transaction so a failure rolls everything back.
 */
const deleteUserById = async (userId: string) => {
  return await db.transaction(async (tx) => {
    const userApps = await tx
      .select({ clientId: applicationsTable.clientId })
      .from(applicationsTable)
      .where(eq(applicationsTable.userId, userId));

    const clientIds = userApps.map((a) => a.clientId);

    const authCodeFilter =
      clientIds.length > 0
        ? or(
            eq(authorizationCodesTable.userId, userId),
            inArray(authorizationCodesTable.clientId, clientIds),
          )
        : eq(authorizationCodesTable.userId, userId);
    await tx.delete(authorizationCodesTable).where(authCodeFilter);

    const shortCodeFilter =
      clientIds.length > 0
        ? or(
            eq(shortCodesTable.userId, userId),
            inArray(shortCodesTable.clientId, clientIds),
          )
        : eq(shortCodesTable.userId, userId);
    await tx.delete(shortCodesTable).where(shortCodeFilter);

    await tx
      .delete(applicationsTable)
      .where(eq(applicationsTable.userId, userId));

    const deleted = await tx
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (deleted.length === 0) throw new NotFoundError("User not found");
    return deleted[0]!;
  });
};

/**
 * Invalidate every refresh token for a user. The user will need to sign in
 * again on every device. Access tokens already in flight expire normally.
 */
const revokeUserSessions = async (userId: string) => {
  const updated = await db
    .update(usersTable)
    .set({ refreshToken: null, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id, updatedAt: usersTable.updatedAt });

  if (updated.length === 0) throw new NotFoundError("User not found");
  return updated[0]!;
};

export {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  revokeUserSessions,
};
