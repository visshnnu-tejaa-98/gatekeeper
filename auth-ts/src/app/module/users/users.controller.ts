import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import { UnauthorizedError } from "../../common/utils/api-error";
import {
  listAllUsers,
  getUserDetails,
  updateUser,
  removeUser,
  revokeSessions,
} from "./users.service";
import { UpdateUserSchemaType } from "./users.schema";

const getUsers = async (req: Request, res: Response) => {
  const users = await listAllUsers();
  ApiResponse.success(res, "Users fetched successfully", users);
};

const getUser = async (req: Request, res: Response) => {
  const { sub: requesterId, role: requesterRole } = req.user;
  if (!requesterId) throw new UnauthorizedError("Invalid session");
  const targetUserId = req.params.id as string;
  const user = await getUserDetails(targetUserId, requesterId, requesterRole);
  ApiResponse.success(res, "User fetched successfully", user);
};

const updateUserProfile = async (req: Request, res: Response) => {
  const { sub: requesterId, role: requesterRole } = req.user;
  if (!requesterId) throw new UnauthorizedError("Invalid session");
  const targetUserId = req.params.id as string;
  const { name, email, role } = req.body as UpdateUserSchemaType["body"];

  const rawData = { name, email, role };
  const cleanData: Record<string, any> = {};

  for (const [key, value] of Object.entries(rawData)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }

  const result = await updateUser({
    targetUserId,
    requesterId,
    requesterRole,
    data: cleanData,
  });
  ApiResponse.success(res, "User updated successfully", result);
};

const deleteUser = async (req: Request, res: Response) => {
  const targetUserId = req.params.id as string;
  await removeUser(targetUserId);
  ApiResponse.success(res, `User ${targetUserId} deleted successfully`);
};

const revokeUserSessions = async (req: Request, res: Response) => {
  const { sub: requesterId, role: requesterRole } = req.user;
  if (!requesterId) throw new UnauthorizedError("Invalid session");
  const targetUserId = req.params.id as string;
  const result = await revokeSessions(targetUserId, requesterId, requesterRole);
  ApiResponse.success(res, "User sessions revoked", result);
};

export {
  getUsers,
  getUser,
  updateUserProfile,
  deleteUser,
  revokeUserSessions,
};
