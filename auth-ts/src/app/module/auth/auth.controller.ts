import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import {
  forgot,
  login,
  logout,
  profile,
  refreshUserToken,
  register,
  resetUserPassword,
  uploadAvatar,
  verifyEmail,
  verifyUserEmailRequest,
} from "./auth.service";
import { UnauthorizedError } from "../../common/utils/api-error";
import { DEVELOPMENT } from "../../common/constants";
import { env } from "../../common/zod/env";

const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const clientId = req.query.client_id as string;
  const data = await register({ name, email, password, clientId });
  ApiResponse.created(res, "User created successfully", data);
};

const verifyEmailRequest = async (req: Request, res: Response) => {
  const { email } = req.user;
  const result = await verifyUserEmailRequest(email);

  ApiResponse.success(res, `Email Sent to ${email} successfully`, result);
};

const verifyUserEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await verifyEmail({ token });
  ApiResponse.created(res, "User Email Verified Successfully", user);
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientId = req.query.client_id as string;

  const data = await login({
    email,
    password,
    clientId,
  });

  ApiResponse.created(res, "User loggedin successfully", data);
};

const getUserProfile = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user === "string") {
    throw new UnauthorizedError("Invalid session content");
  }
  const { sub } = req.user;
  const userDetails = await profile(sub!);
  ApiResponse.success(res, "Fetched user details successfully", {
    user: userDetails,
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const { sub: userId, jti, exp } = req.user;
  if (!userId || !jti || exp === undefined)
    throw new UnauthorizedError("Invalid session");
  await logout({ userId, jti, exp });
  ApiResponse.success(res, "User logout successfully");
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const { resetToken } = await forgot({ email });
  ApiResponse.success(res, "Email sent", { resetToken });
};

const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.query;
  const user = await resetUserPassword({ password, token: token?.toString()! });
  ApiResponse.success(res, "Password reset successfully", user);
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  const tokens = await refreshUserToken(token);
  ApiResponse.success(res, "Token refreshed successfully", tokens);
};

const uploadUserAvatar = async (req: Request, res: Response) => {
  const userId = req.user.sub;
  const response = await uploadAvatar(userId!, req.file!);
  ApiResponse.success(res, "File uploaded successfully", response);
};

export {
  registerUser,
  verifyUserEmail,
  loginUser,
  profile,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  refreshToken,
  uploadUserAvatar,
  verifyEmailRequest,
};
