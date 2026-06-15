import { UnauthorizedError } from "../../common/utils/api-error";
import { SUPER_ADMIN } from "../../common/constants";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  revokeUserSessions as revokeUserSessionsByUserId,
} from "./users.utils";
import { UpdateUserByIdProps } from "./users.types";

const listAllUsers = async () => {
  return await getAllUsers();
};

const getUserDetails = async (
  targetUserId: string,
  requesterId: string,
  requesterRole: string,
) => {
  if (requesterRole !== SUPER_ADMIN && targetUserId !== requesterId)
    throw new UnauthorizedError("You can only view your own profile");
  return await getUserById(targetUserId);
};

const updateUser = async (props: UpdateUserByIdProps) => {
  const { targetUserId, requesterId, requesterRole, data } = props;

  if (requesterRole !== SUPER_ADMIN && targetUserId !== requesterId)
    throw new UnauthorizedError("You can only update your own profile");

  if (requesterRole !== SUPER_ADMIN && data.role !== undefined)
    throw new UnauthorizedError("You are not allowed to change roles");

  return await updateUserById(targetUserId, data);
};

const removeUser = async (userId: string) => {
  return await deleteUserById(userId);
};

const revokeSessions = async (
  targetUserId: string,
  requesterId: string,
  requesterRole: string,
) => {
  if (requesterRole !== SUPER_ADMIN && targetUserId !== requesterId)
    throw new UnauthorizedError(
      "You can only revoke sessions for your own account",
    );
  return await revokeUserSessionsByUserId(targetUserId);
};

export { listAllUsers, getUserDetails, updateUser, removeUser, revokeSessions };
